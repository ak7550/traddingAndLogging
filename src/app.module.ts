import { CacheModule } from "@nestjs/cache-manager";
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
import { VaultModule } from "./vault/vault.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            cache: true,
            isGlobal: true,
            envFilePath: `.env.${process.env.NODE_ENV}`
        }),
        CacheModule.register( {
            isGlobal: true,
            ttl: 7 * 3600 * 1000
        }),
        SheetModule,
        TradingModule,
        ScheduleModule.forRoot(),
        DataBaseModule,
        EntityModule,
        VaultModule,
        StockDataModule
        // RedisModule
    ],
    controllers: [AppController],
    providers: [AppService, CustomLogger]
})
export class AppModule {}
