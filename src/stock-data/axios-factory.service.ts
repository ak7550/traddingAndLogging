import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { ApiType } from './config/stock-data.constant';
import axiosRateLimit from 'axios-rate-limit';
import GlobalConstant from 'src/common/globalConstants.constant';

@Injectable()
export class AxiosFactoryService {
    private historicalApi: AxiosInstance;

    constructor (
        private readonly configService: ConfigService
    ) {
        this.historicalApi = this.getAxiosInstanceByMaxRPS(3);
    }

    public getAxiosInstanceByApiType(apiType: ApiType): AxiosInstance {
        switch (apiType) {
            case ApiType.historical:
                return this.historicalApi;
            default:
                break;
        }
        return axios;
    }

    public getAxiosInstanceByMaxRPS(maxRequests: number): AxiosInstance {
        return axiosRateLimit(
            axios.create({
                baseURL: this.configService.getOrThrow<string>("FYERS_BASE_URL"),
                headers: {
                    [GlobalConstant.CONTENT_TYPE]:
                        GlobalConstant.APPLICATION_JSON, // not necessary though
                },
            }),
            {
                maxRequests,
            },
        );
    }
}
