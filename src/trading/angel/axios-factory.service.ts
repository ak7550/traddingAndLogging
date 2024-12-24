import { Injectable } from "@nestjs/common";
import axios, { AxiosInstance } from "axios";
import axiosRateLimit from "axios-rate-limit";
import { AngelConstant, ApiType } from "./config/angel.constant";
import { CustomConfigService as ConfigService } from "../../vault/custom-config.service";
import GlobalConstant from "../../common/globalConstants.constant";
import axiosRetry from "axios-retry";

@Injectable()
export default class AxiosFactory {
    private orderApi: AxiosInstance;
    private gttApi: AxiosInstance;
    private historicalApi: AxiosInstance;
    private otherApi: AxiosInstance;

    public async getAxiosInstanceByMaxRPS(maxRequests: number): Promise<AxiosInstance> {
        const client: AxiosInstance = axiosRateLimit(
            axios.create({
                baseURL: AngelConstant.ANGEL_BASE_URL,
                headers: {
                    [GlobalConstant.CONTENT_TYPE]:
                        GlobalConstant.APPLICATION_JSON, // not necessary though
                    [AngelConstant.X_USER_TYPE]: AngelConstant.USER,
                    [AngelConstant.X_SOURCE_ID]: AngelConstant.WEB,
                    [AngelConstant.X_PRIVATE_KEY]:
                        await this.configService.getOrThrow<string>("ANGEL_API_KEY"),
                    [AngelConstant.X_MACAddress]: "process.env.MAC_ADDRESS"
                }
            }),
            {
                maxRequests
            }
        );

        axiosRetry(client, {retries: 3, retryDelay: axiosRetry.exponentialDelay });

        return client;
    }

    constructor (
        private readonly configService: ConfigService
    ) {
        this.getAxiosInstanceByMaxRPS(20).then(val => this.orderApi = val);
        this.getAxiosInstanceByMaxRPS(10).then(val => this.gttApi = val);
        this.getAxiosInstanceByMaxRPS(3).then(val => this.historicalApi = val);
        this.getAxiosInstanceByMaxRPS(1).then(val => this.otherApi = val);
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
