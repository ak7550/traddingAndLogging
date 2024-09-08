import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import TradingController from "./trading.controller";
import TradingFactoryService from "./trading-factory.service";
import DhaanModule from "./dhaan/dhaan.module";
import AngelModule from "./angel/angel.module";
import { EntityModule } from "../entities/entity.module";

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