import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Broker } from "src/entities/broker/entities/broker.entity";
import { Credential } from "src/entities/credential/credential.entity";
import { DematAccount } from "src/entities/demat/entities/demat-account.entity";
import { User } from "src/entities/user/entities/user.entity";

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            //@ts-ignore => just to avoid userFactory type error
            useFactory: (configService: ConfigService) => ({
                type: configService.getOrThrow(`DB_TYPE`),
                host: configService.getOrThrow(`DB_HOST`),
                port: parseInt(configService.getOrThrow(`DB_PORT`)) || 3306,
                username: configService.getOrThrow(`DB_USER`),
                password: configService.getOrThrow(`DB_PASSWORD`),
                database: configService.getOrThrow(`DB_NAME`),
                entities: [Credential, User, DematAccount, Broker],
                autoLoadEntities: true,
                synchronize: configService.getOrThrow(`DB_SYNCHRONIZE`),
                retryAttempts: 5,
                retryDelay: 1000,
            }),
            inject: [ConfigService],
        }),
    ],
})
export class DataBaseModule {}
