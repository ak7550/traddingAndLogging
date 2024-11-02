import { Logger, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EntityModule } from "../entities/entity.module";
import { UserModule } from "../entities/user/user.module";
import { StockDataModule } from "../stock-data/stock-data.module";
import AngelModule from "./angel/angel.module";
import DhaanModule from "./dhaan/dhaan.module";
import TradingFactoryService from "./trading-factory.service";
import TradingController from "./trading.controller";
import { TradingService } from './trading.service';

@Module({
    providers: [TradingFactoryService, TradingService, Logger],
    controllers: [TradingController],
    imports: [
        ConfigModule.forRoot({
            cache: true,
        }),
        DhaanModule,
        AngelModule,
        EntityModule,
        UserModule,
        StockDataModule
    ],
})
export default class TradingModule {}