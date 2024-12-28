import { Module } from "@nestjs/common";
import { AngelController } from "./angel.controller";
import AngelService from "./angel.service";
import AxiosFactory from "./axios-factory.service";
import AngelRequestHandler from "./request-handler.service";
import AngelScheduler from "./scheduler.service";
import { EntityModule } from "../../entities/entity.module";
import { CustomLogger } from "../../custom-logger.service";
import { CacheModule } from "@nestjs/cache-manager";
import { CustomConfigService as ConfigService, CustomConfigService } from "../../vault/custom-config.service";
import { redisStore } from "cache-manager-redis-yet";
import { VaultModule } from "../../vault/vault.module";

@Module({
    imports: [
        EntityModule,
        // CacheModule.registerAsync({
        //     imports: [VaultModule],
        //     useFactory: async (configService: ConfigService) => {
        //         const [host, port] = await Promise.all([
        //             configService.getOrThrow<string>("REDIS_HOST"),
        //             configService.getOrThrow<number>("REDIS_PORT")
        //         ]);

        //         return {
        //             store: await redisStore({
        //                 socket: {
        //                     host,
        //                     port // this redis will only store the daily stock info for caching purpose and delete after one day of use, security is not a major concern, we are saving only that data which is publicly available
        //                 }
        //             }),
        //             ttl: 7 * 3600,
        //             max: 3000 // maximum number of items that can be stored in cache
        //         };
        //     },
        //     inject: [ConfigService]
        // } ),
        VaultModule
    ],
    // providers are the classes that can be Injected into this module.
    providers: [
        AngelService,
        AngelScheduler,
        AngelRequestHandler,
        AxiosFactory,
        CustomLogger
    ],
    // exports are the classes, which are part of this module, can be imported to some other module
    exports: [AngelService],
    controllers: [AngelController]
})
export default class AngelModule {}
