import { Module } from '@nestjs/common';
import { StockDataService } from './stock-data.service';
import { StockDataController } from './stock-data.controller';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    CacheModule.registerAsync({  
      useFactory: async () => ({  
        store: await redisStore({  
          socket: {  
            host: 'localhost',  
            port: 6379,  
          },        
        }),      
      }),    
    })
  ],
  controllers: [StockDataController],
  providers: [StockDataService],
})
export class StockDataModule {}
