import { Module } from "@nestjs/common";
import { AngelController } from "./angel.controller";
import AngelService from "./angel.service";
import AxiosFactory from "./axios-factory.service";
import AngelRequestHandler from "./request-handler.service";
import AngelScheduler from "./scheduler.service";
import { EntityModule } from "../../entities/entity.module";
import { CustomLogger } from "../../custom-logger.service";
import { CacheModule } from "@nestjs/cache-manager";
import { ConfigService } from "@nestjs/config";
import { redisStore } from "cache-manager-redis-yet";

@Module({
    imports: [
        EntityModule,
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
        })
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
