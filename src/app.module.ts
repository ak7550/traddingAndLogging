import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CustomLogger } from "./custom-logger.service";
import { DataBaseModule } from "./database/database.module";
import { EntityModule } from "./entities/entity.module";
import { SheetModule } from "./sheet/sheet.module";
import { StockDataModule } from "./stock-data/stock-data.module";
import TradingModule from "./trading/trading.module";
import { CustomConfigService } from "./vault/custom-config.service";
import { VaultModule } from "./vault/vault.module";
import { RedisModule } from "./database/redis.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            cache: true,
            isGlobal: true,
            envFilePath: `.env.${process.env.NODE_ENV}`
        }),
        SheetModule,
        TradingModule,
        ScheduleModule.forRoot(),
        DataBaseModule,
        EntityModule,
        VaultModule,
        StockDataModule,
        RedisModule
    ],
    controllers: [AppController],
    providers: [AppService, CustomLogger]
})
export class AppModule {}
