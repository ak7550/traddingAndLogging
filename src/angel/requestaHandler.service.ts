import { Injectable, Logger, RequestMethod } from "@nestjs/common";
import { ApiType } from "./config/angel.constant";
import { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import { Observable, catchError, from, firstValueFrom } from "rxjs";
import { AngelAPIResponse } from "./dto/generic.response.dto";
import { AxiosFactory } from "./axios-factory.service";


@Injectable()
export class AngelRequestHandler {
    private readonly logger: Logger = new Logger( AngelRequestHandler.name );

    constructor(private readonly axiosFactory: AxiosFactory){}

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
    ): Promise<Type> {
        try {
            this.logger.log(
                `Inside execute method: ${AngelRequestHandler.name}, route ${route}`,
            );
            const http: AxiosInstance = this.axiosFactory.getAxiosInstanceByApiType( apiType );
            let promise: Promise<AxiosResponse<AngelAPIResponse<Type>>>;

            switch (requestMethod) {
                case RequestMethod.GET:
                    promise = http.get<AngelAPIResponse<Type>>(route);
                    break;
                case RequestMethod.POST:
                    promise = http.post<AngelAPIResponse<Type>>(route,requestBody);
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

            const observableRequest: Observable<AxiosResponse<AngelAPIResponse<Type>>> = from(promise).pipe(
                catchError((error: AxiosError) => {
                    this.logger.error("error that we faced just now", error);
                    throw new Error("An error happened!");
                }),
            );

            const resposne: AxiosResponse<AngelAPIResponse<Type>> = await firstValueFrom(observableRequest);
            return resposne.data.$data;
        } catch (error) {
            this.logger.error(`Error occured while hitting the ${route} request from Dhaan apis`,error,);
        }
    }
}
