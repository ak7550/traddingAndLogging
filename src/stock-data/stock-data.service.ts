import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import _ from 'lodash';
import moment from 'moment';
import { CreateStockDatumDto } from './dto/create-stock-datum.dto';
import { FyersHistoricalDataDTO } from './dto/fyers-historical-response.dto';
import { UpdateStockDatumDto } from './dto/update-stock-datum.dto';
import { composeDailyData, OhlcvDataDTO, StockInfoHistorical, StockInfoMarket, TimeWiseData } from './entities/stock-data.entity';
import { RequestHandlerService } from './request-handler.service';

@Injectable()
export class StockDataService {
  constructor (
    @Inject( CACHE_MANAGER ) private readonly cacheManager: Cache,
    private readonly logger: Logger = new Logger( StockDataService.name ),
    private readonly requestHandler: RequestHandlerService
  ) {
    console.log( `StockDataService initialised`, this);
  }

  async getCurrentData ( stockName: string ): Promise<StockInfoMarket>{
    return null;
  }

  async getHistoricalData ( stockName: string ): Promise<StockInfoHistorical> {
    return await this.useCaching( stockName, this._getHistoricalData );
  }

  /**
   * this method will get the tiem wise data individually and create the ultimate response
   * to get monthly indicator values, we will pull out daily data from last 4 years and then calculate monthly indicator values
   * Fyers is providing daily data of last 366 days in a single api call
   */
  private async _getHistoricalData ( stockName: string, instance: StockDataService ): Promise<StockInfoHistorical>{
    const today = moment();
    const oneYrBefore = moment(today).subtract( 365, 'days' );
    const twoYrBefore = moment(oneYrBefore).subtract( 366, 'days' );
    const threeYrBefore = moment(twoYrBefore).subtract( 366, 'days' );
    const fourYrBefore = moment(threeYrBefore).subtract( 366, 'days' );

    const last1yrData: Promise<FyersHistoricalDataDTO[]> = instance.requestHandler.getData( stockName, '1D',
      oneYrBefore.format( 'YYYY-MM-DD' ), today.format( 'YYYY-MM-DD' ));

    const last2yrData: Promise<FyersHistoricalDataDTO[]> = instance.requestHandler.getData( stockName, '1D',
      twoYrBefore.format( 'YYYY-MM-DD' ), oneYrBefore.subtract(1, 'day').format( 'YYYY-MM-DD' ));

    const last3yrData: Promise<FyersHistoricalDataDTO[]> = instance.requestHandler.getData( stockName, '1D',
      threeYrBefore.format('YYYY-MM-DD'), twoYrBefore.subtract(1, 'day').format('YYYY-MM-DD'));

    const last4yrData: Promise<FyersHistoricalDataDTO[]> = instance.requestHandler.getData( stockName, '1D',
      fourYrBefore.format('YYYY-MM-DD'), threeYrBefore.subtract(1, 'day').format('YYYY-MM-DD'));

    return await Promise.all([last1yrData, last2yrData, last3yrData, last4yrData])
      .then( ( [ oneYrData, twoYrData, threeYrData, fourYrData ] ) => {
        const dailyOHLCV: OhlcvDataDTO[] = fourYrData.concat( threeYrData, twoYrData, oneYrData ).map(
          ( [ timestamp, open, high, low, close, volume ]: FyersHistoricalDataDTO ) =>
            new OhlcvDataDTO( timestamp, open, high, low, close, volume ) );

        const weeks: OhlcvDataDTO[] = _.chain( dailyOHLCV )
          .groupBy(
            ( { timeStamp } ) => `${ moment.unix( timeStamp ).isoWeek() }-${ moment.unix( timeStamp ).year() }` )
          .values()
          .map(composeDailyData)
          .value();

        const months: OhlcvDataDTO[] = _.chain( dailyOHLCV )
          .groupBy(
            ( { timeStamp } ) => `${ moment.unix( timeStamp ).month() }-${ moment.unix( timeStamp ).year() }` )
          .values()
          .map(composeDailyData)
          .value();

        console.log( weeks );
        const stockInfoHistorical: StockInfoHistorical = new StockInfoHistorical(new TimeWiseData(dailyOHLCV), new TimeWiseData(weeks), new TimeWiseData(months));
        return stockInfoHistorical;
      } );
  }

  create(createStockDatumDto: CreateStockDatumDto) {
    return 'This action adds a new stockDatum';
  }

  findAll() {
    return `This action returns all stockData`;
  }

  async findOne(stockName: string): Promise<StockInfoHistorical> {
    return this.useCaching<StockInfoHistorical>(stockName, this.getStockInfoHistorical);
  }

  private getStockInfoHistorical = (stockName: string, instance: StockDataService) : Promise<StockInfoHistorical> => {
    return null;
  }

  private async useCaching<T>(keyName: string, method: (name: string, instance: StockDataService) => Promise<T>): Promise<T> {
    let  value: T = await this.cacheManager.get(keyName);
    if(value !== undefined){
      this.logger.log(`found ${keyName} in cache`);
      return value;
    }
    value = await method(keyName,this);
    this.cacheManager.set(keyName, value, 7 * 3600 * 1000);
    return value;
  }



  update(id: number, updateStockDatumDto: UpdateStockDatumDto) {
    return `This action updates a #${id} stockDatum`;
  }

  remove(id: number) {
    return `This action removes a #${id} stockDatum`;
  }
}
