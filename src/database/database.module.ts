import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Broker } from "src/user/entities/broker.entity";
import { Credential } from "src/user/entities/credential.entity";
import { User } from "src/user/entities/user.entity";
import { UserBroker } from "src/user/entities/userBroker.entity";

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                type: "mysql",
                host: configService.getOrThrow(`DB_HOST`),
                port: parseInt(configService.getOrThrow(`DB_PORT`)) || 3306,
                username: configService.getOrThrow(`DB_USER`),
                password: configService.getOrThrow(`DB_PASSWORD`),
                database: configService.getOrThrow(`DB_NAME`),
                entities: [ Credential, User, UserBroker, Broker ],
                autoLoadEntities: true,
                synchronize: configService.getOrThrow(`DB_SYNCHRONIZE`),
            } ),
            inject: [ConfigService]
        }),
    ],
})
export class DataBaseModule {}