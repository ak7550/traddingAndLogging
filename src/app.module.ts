import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { DataSource } from "typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DataBaseModule } from "./database/database.module";
import { SheetModule } from "./sheet/sheet.module";
import TradingModule from "./trading/trading.module";
import { EntityModule } from "./entities/entity.module";

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
        EntityModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
