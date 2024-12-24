import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { redisStore } from "cache-manager-redis-yet";
import { CustomConfigService as ConfigService } from "../vault/custom-config.service";
import { VaultModule } from "../vault/vault.module";

@Module({
    imports: [
        CacheModule.registerAsync({
            imports: [VaultModule],
            useFactory: async ( configService: ConfigService ) => {
                const [host, port] = await Promise.all([
                    configService.getOrThrow<string>("REDIS_HOST"),
                    configService.getOrThrow<number>("REDIS_PORT")
                ] );
                
                return {
                    store: await redisStore({
                        socket: {
                            host,
                            port  // this redis will only store the daily stock info for caching purpose and delete after one day of use, security is not a major concern, we are saving only that data which is publicly available
                        }
                    }),
                    ttl: 7 * 3600,
                    max: 3000 // maximum number of items that can be stored in cache
                };
            },
            inject: [ConfigService]
        })
    ]
})
export class RedisModule {}
