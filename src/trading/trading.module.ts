import { Module } from "@nestjs/common";
import { TradingController } from "./trading.controller";
import { DhaanModule } from "src/dhaan/dhaan.module";
import { ConfigModule } from "@nestjs/config";
import { TradingFactoryService } from "src/trading/trading-factory.service";

@Module({
    providers: [TradingFactoryService],
    controllers: [TradingController],
    imports: [
        ConfigModule.forRoot({
            cache: true,
        }),
        DhaanModule,
    ],
})
export class TradingModule {}
