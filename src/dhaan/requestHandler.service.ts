import { Injectable, Logger, RequestMethod } from "@nestjs/common";
import axios from "axios";
import axiosRateLimit from "axios-rate-limit";
import { ApiType, DhaanConstants } from "./config/dhaanConstants.constant";
import { AxiosInstance } from "axios";
import { AxiosResponse } from "axios";
import { Observable, catchError, from, firstValueFrom } from "rxjs";
import { AxiosError } from "axios";
import { DhanEnv, DhanHqClient, HoldingsDetail } from "dhanhq";
import { APPLICATION_JSON } from "src/common/globalConstants.constant";


class AxiosFactory {
    private static tradingAxios: AxiosInstance;
    private static nonTradingAxios: AxiosInstance;
    private static historicalAxios: AxiosInstance;

    constructor() {
        AxiosFactory.tradingAxios = axiosRateLimit( axios.create( {
            baseURL: process.env.DHAAN_BASE_URL,
                headers: {
                    [DhaanConstants.ACCESS_TOKEN]:
                        process.env.DHAAN_ACCESS_TOKEN,
                    "Content-Type": APPLICATION_JSON, // not necessary though
                },
        }), {
            maxRPS: 25,
        });
        AxiosFactory.nonTradingAxios = axiosRateLimit( axios.create( {
            baseURL: process.env.DHAAN_BASE_URL,
                headers: {
                    [DhaanConstants.ACCESS_TOKEN]:
                        process.env.DHAAN_ACCESS_TOKEN,
                    "Content-Type": APPLICATION_JSON, // not necessary though
                },
        }), {
            maxRPS: 100,
        });
        AxiosFactory.tradingAxios = axiosRateLimit( axios.create( {
            baseURL: process.env.DHAAN_BASE_URL,
                headers: {
                    [DhaanConstants.ACCESS_TOKEN]:
                        process.env.DHAAN_ACCESS_TOKEN,
                    "Content-Type": APPLICATION_JSON, // not necessary though
                },
        }), {
            maxRPS: 10,
        });
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
        return null;
    }
}

@Injectable()
export default class DhaanRequestHandler {
    private readonly logger: Logger = new Logger(DhaanRequestHandler.name);
    private readonly client: DhanHqClient = new DhanHqClient({
        accessToken: process.env.DHAAN_ACCESS_TOKEN,
        env: DhanEnv.PROD,
    });

    async execute<Type>(
        route: string,
        requestMethod: RequestMethod,
        requestBody: Object,
        apiType: ApiType,
    ): Promise<Type> {
        try {
            this.logger.log(`Inside execut method: ${route}`);
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
                promise,
            ).pipe(
                catchError((error: AxiosError) => {
                    this.logger.error("error that we faced just now", error);
                    throw new Error("An error happened!");
                }),
            );

            const resposne: AxiosResponse<Type> =
                await firstValueFrom( observableRequest );


            const holdingDetails: HoldingsDetail[] = await this.client.getHoldings();
            return resposne.data;
        } catch (error) {
            this.logger.error(
                `Error occured while hitting the ${route} request from Dhaan apis`,
                error,
            );
        }
    }
}
