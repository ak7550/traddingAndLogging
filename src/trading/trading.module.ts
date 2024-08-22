import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import AngelModule from "src/angel/angel.module";
import DhaanModule from "src/dhaan/dhaan.module";
import TradingFactoryService from "src/trading/trading-factory.service";
import TradingController from "./trading.controller";

@Module({
    providers: [TradingFactoryService],
    controllers: [TradingController],
    imports: [
        ConfigModule.forRoot({
            cache: true,
        }),
        DhaanModule,
        AngelModule
    ],
})
export default class TradingModule {}