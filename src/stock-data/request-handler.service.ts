import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import axiosRateLimit from "axios-rate-limit";
import GlobalConstant from "../common/globalConstants.constant";
import { CustomLogger } from "../custom-logger.service";
import { Credential } from "../entities/credential/credential.entity";
import { CredentialService } from "../entities/credential/credential.service";
import { FYERS_HISTORICAL_ROUTE, FYERS_REFRESH_TOKEN_URL, Resolution } from "./config/stock-data.constant";
import { FyersApiResponseDTO } from "./dto/fyers-api-response.dto";
import { FyersHistoricalDataDTO } from "./dto/fyers-historical-response.dto";
import { RefreshTokenResponseDTO } from "./dto/refresh-token-response.dto";
import { RefreshTokenRequestDTO } from "./dto/refresh-token.request.dto";
import { Cron, CronExpression } from "@nestjs/schedule";
import moment from "moment";

@Injectable()
export class RequestHandlerService {
    constructor(
        private readonly configService: ConfigService,
        private readonly logger: CustomLogger = new CustomLogger(
            RequestHandlerService.name
        ),
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private readonly credentialService: CredentialService
    ) {}

    getAxiosInstanceByMaxRPS(maxRequests: number): AxiosInstance {
        return axiosRateLimit(
            axios.create({
                // baseURL: this.configService.getOrThrow<string>("FYERS_BASE_URL"), // base url is not needed here => check the docs
                headers: {
                    [GlobalConstant.CONTENT_TYPE]:
                        GlobalConstant.APPLICATION_JSON // not necessary though
                }
            }),
            {
                maxRequests
            }
        );
    }

    @Cron(CronExpression.EVERY_DAY_AT_7AM)
    async refreshToken (): Promise<string> {
        this.logger.verbose(`Cron job trigerred for FYERS refresh token at ${moment().format("YYYY-MM-DDTHH:mm:ssZ")}`);
        const fyersAppId: string = this.configService.getOrThrow<string>("FYERS_APP_ID");
        const fyersAppSecret = this.configService.getOrThrow<string>("FYERS_APP_SECRET");
        const http: AxiosInstance = this.getAxiosInstanceByMaxRPS(3);

        //TODO: direct dematAccountId is being passed here => not a good aproach.
        const [ refreshToken, pin, accessToken ] = await Promise.all( [
            this.credentialService.findCredentialByDematId( 2, GlobalConstant.REFRESH_TOKEN ),
            this.credentialService.findCredentialByDematId( 2, "pin" ),
            this.credentialService.findCredentialByDematId(2, GlobalConstant.ACCESS_TOKEN)
        ] );


        return await http
            .post(
                FYERS_REFRESH_TOKEN_URL,
                new RefreshTokenRequestDTO(
                    refreshToken.keyValue,
                    pin.keyValue,
                    fyersAppId,
                    fyersAppSecret
                )
            )
            .then((response: AxiosResponse<RefreshTokenResponseDTO>) => {
                const { access_token: accT } = response.data;
                accessToken.keyValue = accT;
                this.credentialService.save([accessToken]);
                return response.data.access_token;
            });
    }

    async getData<Type>(
        stockName: string,
        resolution: Resolution,
        rangeFrom: string,
        rangeTo: string,
        dateFormat: number
    ): Promise<Type> {
        const route: string = `${FYERS_HISTORICAL_ROUTE}?symbol=${ stockName }&resolution=${ resolution }&date_format=${dateFormat}&range_from=${ rangeFrom }&range_to=${ rangeTo }&oi_flag=1`;

        const fyersAppId: string = this.configService.getOrThrow<string>("FYERS_APP_ID");
        const accessToken: Credential = await this.credentialService.findCredentialByDematId(2,GlobalConstant.ACCESS_TOKEN);

        this.logger.verbose(`Inside execute method: ${RequestHandlerService.name}, route ${route}`);
        const http: AxiosInstance = this.getAxiosInstanceByMaxRPS(3);

        return await http
            .get(route, {
                headers: {
                    [GlobalConstant.Authorization]: `${fyersAppId}:${accessToken.keyValue}`
                }
            })
            .then((res: AxiosResponse<FyersApiResponseDTO<Type>>) => res.data.candles);
    }
}
