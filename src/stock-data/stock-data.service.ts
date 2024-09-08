import { Inject, Injectable, Logger} from '@nestjs/common';
import { CreateStockDatumDto } from './dto/create-stock-datum.dto';
import { UpdateStockDatumDto } from './dto/update-stock-datum.dto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { StockInfo } from './entities/stock-data.entity';

@Injectable()
export class StockDataService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  private readonly logger: Logger = new Logger(StockDataService.name)
){}

  create(createStockDatumDto: CreateStockDatumDto) {
    return 'This action adds a new stockDatum';
  }

  findAll() {
    return `This action returns all stockData`;
  }

  async findOne(stockName: string): Promise<StockInfo> {
    return this.useCaching<StockInfo>(stockName, this.getStockInfo);
  }

  private getStockInfo = (stockName: string) : Promise<StockInfo> => {
    return null;
  }

  private async useCaching<T>(keyName: string, method: (name: string) => Promise<T>): Promise<T> {
    let  value: T = await this.cacheManager.get(keyName);
    if(value === null || value === undefined){
      this.logger.log(`found ${keyName} in cache`);
      return value;
    }
    value = await method(keyName);
    this.cacheManager.set(keyName, value, 7*3600);
    return value;
  }



  update(id: number, updateStockDatumDto: UpdateStockDatumDto) {
    return `This action updates a #${id} stockDatum`;
  }

  remove(id: number) {
    return `This action removes a #${id} stockDatum`;
  }
}
