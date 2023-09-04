import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";
import axiosRateLimit from "axios-rate-limit";
import { DhaanConstants } from "./config/dhaanConstants.constant";
import { APPLICATION_JSON } from "src/config/common/globalConstants.constant";
import { AxiosInstance } from "axios";
import { AxiosResponse } from "axios";
import { Observable, catchError, from, firstValueFrom } from "rxjs";
import { AxiosError } from "axios";

@Injectable()
export default class DhaanRequestHandler {
    private readonly http: AxiosInstance;
    private readonly logger: Logger = new Logger(DhaanRequestHandler.name);

    constructor() {
        this.http = axiosRateLimit(
            axios.create({
                baseURL: process.env.DHAAN_BASE_URL,
                headers: {
                    [DhaanConstants.ACCESS_TOKEN]:
                        process.env.DHAAN_ACCESS_TOKEN,
                    "Content-Type": APPLICATION_JSON, // not necessary though
                },
            }),
            {
                //docs: https://dhanhq.co/docs/v1/
                maxRequests: 100, // this is for dhaan's non trading apis, as we are using it only to get the holding information, i have no problem using it, for orders and to get historical data from dhaan, we will be neding seperate class with seperate axios instance
            },
        );
    }

    /**
     * executeGetRequest
     */
    public async executeGetRequest<Type> ( route: string ): Promise<Type> {
        this.logger.log(`Inside executeGetRequest method: ${route}`);

        // Make the Axios request and handle it using from and catchError
        const observableRequest: Observable<AxiosResponse<Type>> = from(
            this.http.get<Type>(route),
        ).pipe(
            catchError((error: AxiosError) => {
                this.logger.error("error that we faced just now", error);
                throw new Error("An error happened!");
            }),
        );

        const resposne: AxiosResponse<Type> = await firstValueFrom(observableRequest);
        return resposne.data;
    }
}
