import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { SheetModule } from "./sheet/sheet.module";
import TradingModule from "./trading/trading.module";
import { ScheduleModule } from "@nestjs/schedule";
import { DataSource } from "typeorm";
import { CredentialModule } from "./credential/credential.module";
import { DataBaseModule } from "./database/database.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            cache: true,
            isGlobal: true,
        }),
        SheetModule,
        TradingModule,
        ScheduleModule.forRoot(),
        DataBaseModule,
        CredentialModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
    constructor(private readonly dataSource: DataSource) {}
}
