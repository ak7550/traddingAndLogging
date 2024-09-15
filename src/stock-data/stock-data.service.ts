import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import moment from 'moment';
import { CreateStockDatumDto } from './dto/create-stock-datum.dto';
import { UpdateStockDatumDto } from './dto/update-stock-datum.dto';
import { OhlcvDataDTO, StockInfoHistorical, TimeWiseData } from './entities/stock-data.entity';
import { RequestHandlerService } from './request-handler.service';
import { FyersHistoricalDataDTO } from './dto/fyers-historical-response.dto';

@Injectable()
export class StockDataService {
  constructor (
    @Inject( CACHE_MANAGER ) private readonly cacheManager: Cache,
    private readonly logger: Logger = new Logger( StockDataService.name ),
    private readonly requestHandler: RequestHandlerService
  ) {
    console.log( `StockDataService initialised`, this);
}

  async getHistoricalData ( stockName: string ): Promise<StockInfoHistorical> {
    return await this.useCaching( stockName, this._getHistoricalData );
  }

  /**
   * this method will get the tiem wise data individually and create the ultimate response
   */
  private async _getHistoricalData ( stockName: string, instance: StockDataService ): Promise<StockInfoHistorical>{
    const dailyData: Promise<FyersHistoricalDataDTO[]> = instance.requestHandler.getData( stockName, '1D',
      moment().format( 'YYYY-MM-DD' ),
      moment().subtract( 100, 'days' ).format( 'YYYY-MM-DD' ) );

    //todo: think how can we get monthly and weekly candle information
    return await Promise.all([dailyData])
      .then( ([dailyOHLCData]) => {
        const dailyOHLCV: OhlcvDataDTO[] = dailyOHLCData.map(
          ( [ timestamp, open, high, low, close, volume ]: FyersHistoricalDataDTO ) =>
            new OhlcvDataDTO( timestamp, open, high, low, close, volume ) );

        const dailyTimeWiseData: TimeWiseData = new TimeWiseData(dailyOHLCV);
        const stockInfoHistorical: StockInfoHistorical = new StockInfoHistorical(dailyTimeWiseData);
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
