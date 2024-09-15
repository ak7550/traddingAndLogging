import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import axiosRateLimit from 'axios-rate-limit';
import GlobalConstant from '../common/globalConstants.constant';
import { Credential } from '../entities/credential/credential.entity';
import { CredentialService } from '../entities/credential/credential.service';
import { FYERS_ACCESS_TOKEN, Resolution } from './config/stock-data.constant';
import { FyersApiResponseDTO } from './dto/fyers-api-response.dto';
import { FyersHistoricalDataDTO } from './dto/fyers-historical-response.dto';
import { RefreshTokenResponseDTO } from './dto/refresh-token-response.dto';
import { RefreshTokenRequestDTO } from './dto/refresh-token.request.dto';

@Injectable()
export class RequestHandlerService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger = new Logger( RequestHandlerService.name ),
    @Inject( CACHE_MANAGER ) private readonly cacheManager: Cache,
    private readonly credentialService: CredentialService
  ) {}

  getAxiosInstanceByMaxRPS(maxRequests: number): AxiosInstance {
        return axiosRateLimit(
            axios.create({
                // baseURL: this.configService.getOrThrow<string>("FYERS_BASE_URL"), // base url is not needed here => check the docs
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

  private async getAccessToken (): Promise<string> {
    let fyersAccessToken: string = await this.cacheManager.get<string>( FYERS_ACCESS_TOKEN );
    if ( fyersAccessToken !== undefined ) {
      return fyersAccessToken;
    }

    this.logger.log( `data is not available in the cache, refresh the codes` );
    fyersAccessToken = await this.refreshToken();
    await this.cacheManager.set( FYERS_ACCESS_TOKEN, fyersAccessToken, 24*3600*1000 );
    return fyersAccessToken;
  }

  private async refreshToken (): Promise<string> {
    const fyersAppId: string = this.configService.getOrThrow<string>( 'FYERS_APP_ID' );
    const fyersAppSecret = this.configService.getOrThrow<string>( 'FYERS_APP_SECRET' );
    const http: AxiosInstance = this.getAxiosInstanceByMaxRPS( 3 );
    const url: string = `https://api-t1.fyers.in/api/v3/validate-refresh-token`;
    const refreshToken: Credential = await this.credentialService.findCredentialByDematId( 2, GlobalConstant.REFRESH_TOKEN );
    const pin: Credential = await this.credentialService.findCredentialByDematId( 2, 'pin' );
    const accessToken: Credential = await this.credentialService.findCredentialByDematId(2, GlobalConstant.ACCESS_TOKEN)

    return await http.post( url,
      new RefreshTokenRequestDTO( refreshToken.keyValue, pin.keyValue, fyersAppId, fyersAppSecret ) )
      .then( ( response: AxiosResponse<RefreshTokenResponseDTO> ) => {
        const { access_token: accT } = response.data;
        accessToken.keyValue = accT;
        this.credentialService.save( [accessToken ] );
        return response.data.access_token;
      } );
  }

  async getData ( stockName: string, resolution: Resolution, rangeTo: string, rangeFrom: string ) :Promise<FyersHistoricalDataDTO[]> {
    const route: string = `https://api-t1.fyers.in/data/history?symbol=${ stockName }&resolution=${ resolution }&date_format=1&range_from=${ rangeFrom }&range_to=${ rangeTo }&oi_flag=1`;
    const fyersAppId: string = this.configService.getOrThrow<string>('FYERS_APP_ID');
    const accessToken: string = await this.getAccessToken();

    this.logger.log(`Inside execute method: ${RequestHandlerService.name}, route ${route}`);
    const http: AxiosInstance = this.getAxiosInstanceByMaxRPS( 3 );

    return await http.get( route, {
      headers: {
        [ GlobalConstant.Authorization ]: `${fyersAppId}:${accessToken}`
      },
    }).then((res: AxiosResponse<FyersApiResponseDTO<FyersHistoricalDataDTO>>) => res.data.candles)
  }

}
