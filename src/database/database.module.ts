import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Broker } from "../entities/broker/entities/broker.entity";
import { Credential } from "../entities/credential/credential.entity";
import { DematAccount } from "../entities/demat/entities/demat-account.entity";
import { User } from "../entities/user/entities/user.entity";

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            //@ts-ignore => just to avoid userFactory type error
            useFactory: (configService: ConfigService) => ({
                type: configService.getOrThrow<string>(`DB_TYPE`),
                host: configService.getOrThrow<string>(`DB_HOST`),
                port: parseInt(configService.getOrThrow<string>(`DB_PORT`, "3306")),
                username: configService.getOrThrow<string>(`DB_USER`),
                password: configService.getOrThrow<string>(`DB_PASSWORD`),
                database: configService.getOrThrow<string>(`DB_NAME`),
                entities: [Credential, User, DematAccount, Broker],
                autoLoadEntities: true,
                synchronize: configService.getOrThrow(`DB_SYNCHRONIZE`),
                retryAttempts: 5,
                retryDelay: 1000,
                logging: [
                    "error",
                    "info",
                    "log",
                    "query",
                    "schema",
                    "warn",
                    "migration"
                ],
                maxQueryExecutionTime: 5000 //5 secs
            }),
            inject: [ConfigService]
        })
    ]
})
export class DataBaseModule {}
