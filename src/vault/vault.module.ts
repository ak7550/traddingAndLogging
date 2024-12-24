import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { redisStore } from "cache-manager-redis-yet";
import { CustomConfigService } from "./custom-config.service";
import { VaultService } from "./vault.service";
import { CustomLogger } from "../custom-logger.service";

@Module({
    imports: [ ConfigModule,
        CacheModule.registerAsync({
            useFactory: async (configService: ConfigService) => ({
                store: await redisStore({
                    socket: {
                        host: configService.getOrThrow<string>("REDIS_HOST"),
                        port: configService.getOrThrow<number>("REDIS_PORT")
                    }
                }),
                ttl: 7 * 3600,
                max: 3000 // maximum number of items that can be stored in cache
            }),
            inject: [ConfigService]
        }),
    ],
    providers: [VaultService, CustomLogger, CustomConfigService],
    exports: [CustomConfigService]
})
export class VaultModule {}
