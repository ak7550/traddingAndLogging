import { CacheModule } from '@nestjs/cache-manager';
import { Logger, Module } from '@nestjs/common';
import { redisStore } from 'cache-manager-redis-yet';
import { StockDataController } from './stock-data.controller';
import { StockDataService } from './stock-data.service';

@Module({
  imports: [
    CacheModule.registerAsync({  
      useFactory: async () => ({  
        store: await redisStore({  
          socket: {  
            host: 'localhost',  
            port: 6379 // this redis will only store the daily stock info for caching purpose and delete after one day of use, security is not a major concern, we are saving only that data which is publicly available
          },        
        }),
        ttl: 7 * 3600,
        max: 3000 // maximum number of items that can be stored in cache      
      }),   
    })
  ],
  controllers: [StockDataController],
  providers: [StockDataService, Logger],
})
export class StockDataModule {}
