import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CustomLogger } from "../custom-logger.service";
import { EntityModule } from "../entities/entity.module";
import { StockDataModule } from "../stock-data/stock-data.module";
import AngelModule from "./angel/angel.module";
import DhaanModule from "./dhaan/dhaan.module";
import TradingFactoryService from "./trading-factory.service";
import TradingController from "./trading.controller";
import { TradingService } from "./trading.service";
import { VaultModule } from "../vault/vault.module";

@Module({
    providers: [TradingFactoryService, TradingService, CustomLogger],
    controllers: [TradingController],
    imports: [
        // ConfigModule.forRoot({
        //     cache: true
        // }),
        DhaanModule,
        AngelModule,
        EntityModule,
        StockDataModule,
        VaultModule
    ],
    exports: [CustomLogger]
})
export default class TradingModule {}