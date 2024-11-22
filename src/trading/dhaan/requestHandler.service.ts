import { Injectable, RequestMethod } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import axiosRateLimit from "axios-rate-limit";
import axiosRetry from "axios-retry";
import { Observable, catchError, firstValueFrom, from } from "rxjs";
import GlobalConstant from "../../common/globalConstants.constant";
import { CustomLogger } from "../../custom-logger.service";
import { ApiType } from "./config/dhaan.constant";
import utils from 'util';

class AxiosFactory {
    private static tradingAxios: AxiosInstance;
    private static nonTradingAxios: AxiosInstance;
    private static historicalAxios: AxiosInstance;

    private getAxiosInstance(maxRPS: number): AxiosInstance {
        const client:AxiosInstance = axiosRateLimit(
            axios.create({
                baseURL:
                    this.configService.getOrThrow<string>("DHAAN_BASE_URL"),
                headers: {
                    [GlobalConstant.ACCESS_TOKEN]:
                        this.configService.getOrThrow<string>(
                            "DHAAN_ACCESS_TOKEN"
                        ),
                    [GlobalConstant.CONTENT_TYPE]:
                        GlobalConstant.APPLICATION_JSON // not necessary though
                }
            }),
            {
                maxRPS
            }
        );

        axiosRetry(client, {retries: 3, retryDelay: axiosRetry.exponentialDelay });
        return client;
    }

    constructor(private readonly configService: ConfigService) {
        AxiosFactory.tradingAxios = this.getAxiosInstance(25);
        AxiosFactory.nonTradingAxios = this.getAxiosInstance(100);
        AxiosFactory.historicalAxios = this.getAxiosInstance(10);
    }

    static getAxiosInstance(apiType: ApiType): AxiosInstance {
        switch (apiType) {
            case ApiType.trading:
                return this.tradingAxios;
            case ApiType.nonTrading:
                return this.nonTradingAxios;
            case ApiType.historical:
                return this.historicalAxios;
            default:
                break;
        }
        return axios;
    }
}

@Injectable()
export default class DhaanRequestHandler {
    private readonly logger: CustomLogger = new CustomLogger(
        DhaanRequestHandler.name
    );

    async execute<Type>(
        route: string,
        requestMethod: RequestMethod,
        requestBody: Object,
        apiType: ApiType
    ): Promise<Type> {
        try {
            this.logger.verbose(`Inside execut method: ${route}`);
            const http: AxiosInstance = AxiosFactory.getAxiosInstance(apiType);
            let promise: Promise<AxiosResponse<Type>>;

            switch (requestMethod) {
                case RequestMethod.GET:
                    promise = http.get<Type>(route);
                    break;
                case RequestMethod.POST:
                    promise = http.post<Type>(route, requestBody);
                    break;
                case RequestMethod.PUT:
                    break;
                case RequestMethod.PATCH:
                    break;
                case RequestMethod.DELETE:
                    break;
                default:
                    break;
            }

            const observableRequest: Observable<AxiosResponse<Type>> = from(
                promise
            ).pipe(
                catchError((error: AxiosError) => {
                    this.logger.error(
                        "error that we faced just now",
                        `${utils.inspect(error, {depth: 4, colors: true, })}`
                    );
                    throw new Error("An error happened!");
                })
            );

            const resposne: AxiosResponse<Type> =
                await firstValueFrom(observableRequest);

            return resposne.data;
        } catch (error) {
            this.logger.error(
                `Error occured while hitting the ${route} request from Dhaan apis`,
                `${utils.inspect(error, {depth: 4, colors: true, })}`
            );
        }
    }
}
