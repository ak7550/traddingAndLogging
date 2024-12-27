import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { CustomConfigService as ConfigService } from "../vault/custom-config.service";
import { Cron, CronExpression } from "@nestjs/schedule";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import axiosRateLimit from "axios-rate-limit";
import axiosRetry from "axios-retry";
import moment from "moment-timezone";
import GlobalConstant from "../common/globalConstants.constant";
import { CustomLogger } from "../custom-logger.service";
import { Credential } from "../entities/credential/credential.entity";
import { CredentialService } from "../entities/credential/credential.service";
import { DematService } from "../entities/demat/demat.service";
import { FYERS_HISTORICAL_ROUTE, FYERS_REFRESH_TOKEN_URL, Resolution } from "./config/stock-data.constant";
import { FyersApiResponseDTO } from "./dto/fyers-api-response.dto";
import { RefreshTokenResponseDTO } from "./dto/refresh-token-response.dto";
import { RefreshTokenRequestDTO } from "./dto/refresh-token.request.dto";
import utils from 'util';

@Injectable()
export class RequestHandlerService {
    private dataApi: AxiosInstance;
    constructor(
        private readonly configService: ConfigService,
        private readonly logger: CustomLogger = new CustomLogger(
            RequestHandlerService.name
        ),
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private readonly credentialService: CredentialService,
        private readonly dematService: DematService
    ) {
        this.dataApi = this.getAxiosInstanceByMaxRPS( 3 );
     }

    getAxiosInstanceByMaxRPS(maxRequests: number): AxiosInstance {
        const client: AxiosInstance = axiosRateLimit(
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

        axiosRetry(client, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

        return client;
    }

    @Cron(CronExpression.EVERY_DAY_AT_9AM)
    async refreshToken(): Promise<string> {
        this.logger.verbose(`Cron job trigerred for FYERS refresh token at ${moment().format("YYYY-MM-DDTHH:mm:ssZ")}`);

        const fyersAppIdPromise: Promise<string> = this.configService.getOrThrow<string>("FYERS_APP_ID");
        const fyersAppSecretPromise: Promise<string> = this.configService.getOrThrow<string>( "FYERS_APP_SECRET" );
        const [fyersAppId, fyersAppSecret] = await Promise.all( [ fyersAppIdPromise, fyersAppSecretPromise ] );

        const http: AxiosInstance = this.getAxiosInstanceByMaxRPS(3);
        const [refreshToken, pin, accessToken]: Credential[] = await this.dematService.findOne(2)
            .then(demat => this.credentialService.findAll(demat))
            .then(credentials => {
                const refreshToken = credentials.filter(({ keyName }) => keyName === GlobalConstant.REFRESH_TOKEN)[0];
                const pin = credentials.filter(({ keyName }) => keyName === "pin")[0];
                const accessToken = credentials.filter(({ keyName }) => keyName === GlobalConstant.ACCESS_TOKEN)[0];
                return [refreshToken, pin, accessToken];
            });


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
                this.cacheManager.set(`2-${GlobalConstant.ACCESS_TOKEN}`, accT, 7 * 60 * 60 * 1000);
                this.logger.log(`Fyers credentials are updated and cached at ${moment().format('YYYY-MM-DD HH:mm')}`)
                return response.data.access_token;
            } )
            .catch( err => {
                this.logger.error( `Request failed with ${ utils.inspect( err, { depth: 4, colors: true } ) }` );
                return null;
            } );
    }

    async getData<Type>(
        stockName: string,
        resolution: Resolution,
        rangeFrom: string,
        rangeTo: string,
        dateFormat: number
    ): Promise<Type> {
        const route: string = `${FYERS_HISTORICAL_ROUTE}?symbol=${stockName}&resolution=${resolution}&date_format=${dateFormat}&range_from=${rangeFrom}&range_to=${rangeTo}&oi_flag=1`;

        const [ fyersAppId, accessToken ] = await Promise.all( [
            this.configService.getOrThrow<string>( "FYERS_APP_ID" ),
            this.credentialService.findCredentialByDematId( 2, GlobalConstant.ACCESS_TOKEN )
        ] );

        this.logger.verbose(`Inside execute method: ${RequestHandlerService.name}, route ${route}`);
        const http: AxiosInstance = this.dataApi;

        return await http
            .get(route, {
                headers: {
                    [GlobalConstant.Authorization]: `${fyersAppId}:${accessToken.keyValue}`
                }
            })
            .then( ( res: AxiosResponse<FyersApiResponseDTO<Type>> ) => res.data.candles )
            .catch( err => {
                this.logger.error( `Faced error while handling api request ${ route }, ${ utils.inspect( err, { depth: 4, colors: true } ) } at ${ moment().format( 'YYYY-MM-DD HH:mm' ) }` );
                return null;
            });
    }
}
