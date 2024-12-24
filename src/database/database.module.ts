import { Module, Post } from "@nestjs/common";
import { CustomConfigService as ConfigService } from "../vault/custom-config.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Broker } from "../entities/broker/entities/broker.entity";
import { Credential } from "../entities/credential/credential.entity";
import { DematAccount } from "../entities/demat/entities/demat-account.entity";
import { User } from "../entities/user/entities/user.entity";
import { VaultModule } from "../vault/vault.module";

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [VaultModule],
            //@ts-ignore => just to avoid userFactory type error
            useFactory: async (configService: ConfigService) => {
                const [host, port, username, password, database, synchronize] =
                    await Promise.all([
                        configService.getOrThrow<string>(`DB_HOST`),
                        configService.getOrThrow<string>(`DB_PORT`, "3306"),
                        configService.getOrThrow<string>(`DB_USER`),
                        configService.getOrThrow<string>(`DB_PASSWORD`),
                        configService.getOrThrow<string>(`DB_NAME`),
                        configService.getOrThrow(`DB_SYNCHRONIZE`)
                    ]);
                return {
                    type: "mysql",
                    host,
                    port,
                    username,
                    password,
                    database,
                    entities: [Credential, User, DematAccount, Broker],
                    autoLoadEntities: true,
                    synchronize,
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
                };
            },
            inject: [ConfigService]
        })
    ]
})
export class DataBaseModule {}
