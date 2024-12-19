import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { redisStore } from "cache-manager-redis-yet";
import { CustomLogger } from "../../custom-logger.service";
import { DematModule } from "../demat/demat.module";
import { CredentialController } from "./credential.controller";
import { Credential } from "./credential.entity";
import { CredentialService } from "./credential.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Credential]),
        DematModule,
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
    controllers: [CredentialController],
    providers: [CredentialService, CustomLogger], // inject in side the same module
    exports: [CredentialService, TypeOrmModule] // inject outside of the module, where the module has been imported
})
export class CredentialModule {}
