import { Injectable } from "@nestjs/common";
import axios, { AxiosInstance } from "axios";
import axiosRateLimit from "axios-rate-limit";
import GlobalConstant from "src/common/globalConstants.constant";
import { AngelConstant, ApiType } from "./config/angel.constant";
import { ConfigService } from "@nestjs/config";

@Injectable()
export default class AxiosFactory {
    private orderApi: AxiosInstance;
    private gttApi: AxiosInstance;
    private historicalApi: AxiosInstance;
    private otherApi: AxiosInstance;

    public getAxiosInstanceByMaxRPS(maxRequests: number): AxiosInstance {
        return axiosRateLimit(
            axios.create({
                baseURL: this.configService.getOrThrow<string>("ANGEL_BASE_URL"),
                headers: {
                    [GlobalConstant.CONTENT_TYPE]:
                        GlobalConstant.APPLICATION_JSON, // not necessary though
                    [AngelConstant.X_USER_TYPE]: AngelConstant.USER,
                    [AngelConstant.X_SOURCE_ID]: AngelConstant.WEB,
                    [AngelConstant.X_PRIVATE_KEY]: this.configService.getOrThrow<string>("ANGEL_API_KEY"),
                    [AngelConstant.X_MACAddress]: "process.env.MAC_ADDRESS",
                },
            }),
            {
                maxRequests,
            },
        );
    }

    constructor (
        private readonly configService: ConfigService
    ) {
        this.orderApi = this.getAxiosInstanceByMaxRPS(20);
        this.gttApi = this.getAxiosInstanceByMaxRPS(10);
        this.historicalApi = this.getAxiosInstanceByMaxRPS(3);
        this.otherApi = this.getAxiosInstanceByMaxRPS(1);
    }

    public getAxiosInstanceByApiType(apiType: ApiType): AxiosInstance {
        switch (apiType) {
            case ApiType.order:
                return this.orderApi;
            case ApiType.gtt:
                return this.gttApi;
            case ApiType.historical:
                return this.historicalApi;
            case ApiType.others:
                return this.otherApi;
            default:
                break;
        }
        return axios;
    }
}
