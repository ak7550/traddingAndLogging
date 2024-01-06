import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { SheetModule } from "./sheet/sheet.module";
import TradingModule from "./trading/trading.module";
import { ScheduleModule } from "@nestjs/schedule";
import { DataSource } from "typeorm";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Credential } from "./credential/entities/credential.entity";
import { CredentialModule } from "./credential/credential.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            cache: true,
            isGlobal: true,
        }),
        SheetModule,
        TradingModule,
        ScheduleModule.forRoot(),
        TypeOrmModule.forRootAsync({
            useFactory: () => ({
                type: "mysql",
                host: process.env.DB_HOST,
                port: parseInt(process.env.DB_PORT) || 3306,
                username: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                entities: [Credential],
                synchronize: false,
            }),
        }),
        CredentialModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
    constructor(private readonly dataSource: DataSource) {}
}
