import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import AngelModule from "src/trading/angel/angel.module";
import DhaanModule from "src/trading/dhaan/dhaan.module";
import TradingFactoryService from "src/trading/trading-factory.service";
import TradingController from "./trading.controller";
import { EntityModule } from "src/entities/entity.module";

@Module({
    providers: [TradingFactoryService],
    controllers: [TradingController],
    imports: [
        ConfigModule.forRoot({
            cache: true,
        }),
        DhaanModule,
        AngelModule,
        EntityModule
    ],
})
export default class TradingModule {}