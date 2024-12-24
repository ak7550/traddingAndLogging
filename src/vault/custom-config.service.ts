import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { VaultService } from "./vault.service";

@Injectable()
export class CustomConfigService {
    private isProduction: boolean;

    constructor(
        private readonly configService: ConfigService,
        private readonly vaultService: VaultService
    ) {
        this.isProduction = process.env.NODE_ENV === "local";
    }

    async getOrThrow<T> ( keyName: string ): Promise<T> {
        const shouldNotCache: string[] = [
            "REDIS_HOST",
            "REDIS_PORT",
            "DB_HOST",
            "DB_PORT",
            "DB_PASSWORD",
            "DB_NAME",
            "DB_USER",
            "DB_SYNCHRONIZE"
        ];
        try {
            if (this.isProduction) {
                const data: T =
                    await this.vaultService.getSecret<T>(keyName, !shouldNotCache.includes(keyName));
                return data;
            } else {
                return this.configService.getOrThrow<T>(keyName);
            }
        } catch (error) {}
        return undefined;
    }
}
