import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { CustomConfigService as ConfigService } from "../../vault/custom-config.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { redisStore } from "cache-manager-redis-yet";
import { CustomLogger } from "../../custom-logger.service";
import { DematModule } from "../demat/demat.module";
import { CredentialController } from "./credential.controller";
import { Credential } from "./credential.entity";
import { CredentialService } from "./credential.service";
import { VaultModule } from "../../vault/vault.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Credential]),
        DematModule,
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
        // })
    ],
    controllers: [CredentialController],
    providers: [CredentialService, CustomLogger], // inject in side the same module
    exports: [CredentialService, TypeOrmModule] // inject outside of the module, where the module has been imported
})
export class CredentialModule {}
