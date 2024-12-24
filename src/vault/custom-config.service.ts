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

    async getOrThrow<T>(keyName: string): Promise<T> {
        try {
            if (this.isProduction) {
                const data: T =
                    await this.vaultService.getSecret<T>(keyName);
                return data;
            } else {
                return this.configService.getOrThrow<T>(keyName);
            }
        } catch (error) {}
        return undefined;
    }
}
