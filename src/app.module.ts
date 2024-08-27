import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DataBaseModule } from "./database/database.module";
import { EntityModule } from "./entities/entity.module";
import { SheetModule } from "./sheet/sheet.module";
import { VaultModule } from './vault/vault.module';
import TradingModule from "./trading/trading.module";
import { KeyVaultService } from "./keyvault.service";

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
        VaultModule
    ],
    controllers: [AppController],
    providers: [AppService, KeyVaultService],
})
export class AppModule {
}
