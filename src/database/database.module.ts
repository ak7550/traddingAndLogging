import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CustomConfigService as ConfigService } from "../vault/custom-config.service";
import { VaultModule } from "../vault/vault.module";

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [VaultModule],
            //@ts-ignore => just to avoid userFactory type error
            useFactory: async (configService: ConfigService) => {
                const [host, port, username, password, database] =
                    await Promise.all([
                        configService.getOrThrow<string>(`DB_HOST`),
                        configService.getOrThrow<string>(`DB_PORT`, "3306"),
                        configService.getOrThrow<string>(`DB_USER`),
                        configService.getOrThrow<string>(`DB_PASSWORD`),
                        configService.getOrThrow<string>(`DB_NAME`)
                    ]);
                return {
                    type: "mysql",
                    host,
                    port,
                    username,
                    password,
                    database,
                    autoLoadEntities: true,
                    synchronize: false,
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
