import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { CustomConfigService as ConfigService } from "../vault/custom-config.service";
import { redisStore } from "cache-manager-redis-yet";
import { CustomLogger } from "../custom-logger.service";
import { CredentialModule } from "../entities/credential/credential.module";
import { DematModule } from "../entities/demat/demat.module";
import { VaultModule } from "../vault/vault.module";
import { RequestHandlerService } from "./request-handler.service";
import { StockDataController } from "./stock-data.controller";
import { StockDataService } from "./stock-data.service";

@Module({
    imports: [
        // CacheModule.registerAsync( {
        //     imports: [VaultModule],
        //     useFactory: async (configService: ConfigService) => ({
        //         store: await redisStore({
        //             socket: {
        //                 host: await configService.getOrThrow<string>("REDIS_HOST"),
        //                 port: await configService.getOrThrow<number>("REDIS_PORT") // this redis will only store the daily stock info for caching purpose and delete after one day of use, security is not a major concern, we are saving only that data which is publicly available
        //             }
        //         }),
        //         ttl: 7 * 3600,
        //         max: 3000 // maximum number of items that can be stored in cache
        //     }),
        //     inject: [ConfigService]
        // }),
        CredentialModule,
        DematModule,
        VaultModule
    ],
    controllers: [StockDataController],
    providers: [StockDataService, CustomLogger, RequestHandlerService],
    exports: [StockDataService]
})
export class StockDataModule {}
