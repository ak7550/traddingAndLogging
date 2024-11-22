import { Inject, Injectable, RequestMethod } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";
import { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { Observable, catchError, firstValueFrom, from } from "rxjs";
import GlobalConstant from "../../common/globalConstants.constant";
import { CustomLogger } from "../../custom-logger.service";
import AxiosFactory from "./axios-factory.service";
import { AngelConstant, ApiType } from "./config/angel.constant";
import GenerateTokenDto from "./dto/generate-token.request.dto.";
import GenerateTokenResponseDto from "./dto/generate-token.response.dto";
import AngelAPIResponse from "./dto/generic.response.dto";
import AngelSymbolTokenDTO from "./dto/symboltoken.response.dto";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import moment from "moment-timezone";
import utils from 'util';

@Injectable()
export default class AngelRequestHandler {

    @Cron(CronExpression.EVERY_DAY_AT_9AM)
    async getAllAngelSymbolToken (): Promise<AngelSymbolTokenDTO[]> {
        const keyName: string = "angel-symbol-token";
        const data: AngelSymbolTokenDTO[] = await this.cacheManager.get<AngelSymbolTokenDTO[]>(keyName);

        if ( data !== undefined ) {
            this.logger.verbose( `${ keyName } found in cache` );
            return data;
        }
        const http: AxiosInstance = this.axiosFactory.getAxiosInstanceByApiType(
            ApiType.others
        );
        return await http.get( AngelConstant.ANGEL_SYMBOL_TOKEN_URL )
            .then( ({data} :AxiosResponse<AngelSymbolTokenDTO[]>) => {
                this.cacheManager.set( keyName, data, 12 * 3600 * 1000 ); // cacheing it for 12 hours.
                return data;
            });
    }

    @Cron( CronExpression.EVERY_5_SECONDS )
    testing () {
        this.logger.debug( `Current time is: ${ moment().format() }` );
    }

    constructor(
        private readonly configService: ConfigService,
        private readonly axiosFactory: AxiosFactory,
        private readonly logger: CustomLogger = new CustomLogger(
            AngelRequestHandler.name
        ),
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) {}

    /**
     * this method is being used to call almost all the angel apis and handle their responses
     * @param route
     * @param requestMethod
     * @param requestBody
     * @param apiType
     * @returns
     * [More about Angel APIs](https://smartapi.angelbroking.com/docs/)
     * [Important docs to follow](https://docs.nestjs.com/techniques/http-module#using-axios-directly)
     */
    async execute<Type>(
        route: string,
        requestMethod: RequestMethod,
        requestBody: Object,
        apiType: ApiType,
        jwtToken?: string
    ): Promise<AngelAPIResponse<Type>> {
        try {
            this.logger.verbose(
                `Inside execute method: ${AngelRequestHandler.name}, route ${route}`
            );
            const http: AxiosInstance =
                this.axiosFactory.getAxiosInstanceByApiType(apiType);
            let promise: Promise<AxiosResponse<AngelAPIResponse<Type>>>;

            switch (requestMethod) {
                case RequestMethod.GET:
                    promise = http.get<AngelAPIResponse<Type>>(route, {
                        headers: {
                            [GlobalConstant.Authorization]: `Bearer ${jwtToken}`
                        }
                    });
                    break;
                case RequestMethod.POST:
                    promise = http.post<AngelAPIResponse<Type>>(
                        route,
                        requestBody,
                        {
                            headers: {
                                [GlobalConstant.Authorization]: `Bearer ${jwtToken}`
                            }
                        }
                    );
                    break;
                case RequestMethod.PUT:
                    break;
                case RequestMethod.PATCH:
                    break;
                case RequestMethod.DELETE:
                    break;
                case RequestMethod.OPTIONS:
                    break;
                default:
                    break;
            }

            const observableRequest: Observable<
                AxiosResponse<AngelAPIResponse<Type>>
            > = from(promise).pipe(
                catchError((error: AxiosError) => {
                    this.logger.error(`error that we faced just now,${utils.inspect(error, {depth: 4, colors: true, })}`);
                    throw new Error("An error happened!");
                })
            );

            const response: AxiosResponse<AngelAPIResponse<Type>> =
                await firstValueFrom(observableRequest);

            this.logger.verbose(
                `${AngelRequestHandler.name}: ${this.execute.name} => response received:
                            ${response.data.data}`,
                `route: ${route}`
            );
            return response.data;
        } catch (error) {
            this.logger.error(
                `Error occured while hitting the ${route} request from Angel apis, ${utils.inspect(error, {depth: 4, colors: true, })}`
            );
        }
    }

    async refreshToken(
        request: GenerateTokenDto,
        jwtToken: string
    ): Promise<GenerateTokenResponseDto> {
        try {
            this.logger.verbose( `Inside refreshToken method: ${ AngelRequestHandler.name }, route ${utils.inspect(request, {depth: 4, colors: true, })}`);

            const http: AxiosInstance = this.axiosFactory.getAxiosInstanceByApiType(ApiType.others);

            const response: AxiosResponse<AngelAPIResponse<GenerateTokenResponseDto>> =
                await http.post( AngelConstant.ANGEL_REFRESH_TOKEN_URL, request,
                {
                    headers: {
                        [GlobalConstant.Authorization]: `Bearer ${jwtToken}`
                    }
                }
            );

            this.logger.verbose( `${ AngelRequestHandler.name }: ${ this.refreshToken.name } => response received: ${ response.data.data }`, `data: ${utils.inspect(request, {depth: 4, colors: true, })}` );

            return response.data.data;
        } catch (error) {
            this.logger.error(
                `Error occured while generating the refreshtoken request from Angel apis`,
                `${utils.inspect(error, {depth: 4, colors: true, })}`
            );
        }
    }

    // @Cron(CronExpression.EVERY_30_MINUTES)
    async serviceTester() {
        const webHookUrl =
            "https://webhook.site/61274f5c-9719-4fff-8ff8-f278080432e5";
        const http: AxiosInstance = this.axiosFactory.getAxiosInstanceByApiType(
            ApiType.others
        );

        const response: AxiosResponse<string> = await http.post(webHookUrl, {
            message: "service is working well"
        });

        this.logger.verbose(
            `response received from periodic webhook`,
            response.data
        );
    }
}
