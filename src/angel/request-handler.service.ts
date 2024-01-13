import { Injectable, Logger, RequestMethod } from "@nestjs/common";
import { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { Observable, catchError, firstValueFrom, from } from "rxjs";
import AxiosFactory from "./axios-factory.service";
import { AngelConstant, ApiType } from "./config/angel.constant";
import AngelAPIResponse from "./dto/generic.response.dto";
import GenerateTokenDto from "./dto/generate-token.request.dto.";
import GenerateTokenResponseDto from "./dto/generate-token.response.dto";
import { ConfigService } from "@nestjs/config";

@Injectable()
export default class AngelRequestHandler {
    constructor(
        private readonly configService: ConfigService,
        private readonly axiosFactory: AxiosFactory,
        private readonly logger: Logger = new Logger(AngelRequestHandler.name),
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
        jwtToken?: string,
    ): Promise<Type> {
        try {
            this.logger.log(
                `Inside execute method: ${AngelRequestHandler.name}, route ${route}`,
            );
            const http: AxiosInstance =
                this.axiosFactory.getAxiosInstanceByApiType(apiType);
            let promise: Promise<AxiosResponse<AngelAPIResponse<Type>>>;

            switch (requestMethod) {
                case RequestMethod.GET:
                    promise = http.get<AngelAPIResponse<Type>>(route, {
                        headers: {
                            [AngelConstant.ACCESS_TOKEN]: `Bearer ${jwtToken}`,
                        },
                    });
                    break;
                case RequestMethod.POST:
                    promise = http.post<AngelAPIResponse<Type>>(
                        route,
                        requestBody,
                        {
                            headers: {
                                [AngelConstant.ACCESS_TOKEN]: `Bearer ${jwtToken}`,
                            },
                        },
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

            const observableRequest: Observable<AxiosResponse<any>> = from(
                promise,
            ).pipe(
                catchError((error: AxiosError) => {
                    this.logger.error("error that we faced just now", error);
                    throw new Error("An error happened!");
                }),
            );

            const response: AxiosResponse<AngelAPIResponse<Type>> =
                await firstValueFrom(observableRequest);

            this.logger.log(
                `${AngelRequestHandler.name}: ${this.execute.name} => response received:
                            ${response.data.data}`,
                `route: ${route}`,
            );
            return response.data.data;
        } catch (error) {
            this.logger.error(
                `Error occured while hitting the ${route} request from Angel apis`,
                error,
            );
        }
    }

    async refreshToken(
        request: GenerateTokenDto,
    ): Promise<GenerateTokenResponseDto> {
        try {
            this.logger.log(
                `Inside refreshToken method: ${AngelRequestHandler.name}, route ${request}`,
            );
            const http: AxiosInstance =
                this.axiosFactory.getAxiosInstanceByApiType(ApiType.others);

            const response: AxiosResponse<
                AngelAPIResponse<GenerateTokenResponseDto>
            > = await http.post(this.configService.getOrThrow<string>("ANGEL_REFRESH_TOKEN_URL"), request);

            this.logger.log(
                `${AngelRequestHandler.name}: ${this.refreshToken.name} => response received:
                            ${response.data.data}`,
                `data: ${request}`,
            );
            return response.data.data;
        } catch (error) {
            this.logger.error(
                `Error occured while generating the refreshtoken request from Angel apis`,
                error,
            );
        }
    }
}
