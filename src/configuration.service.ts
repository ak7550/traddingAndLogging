// configuration.service.ts
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
// import { KeyVaultService } from "./keyVault.service";



@Injectable()
export class ConfigurationService {
    private isProduction: boolean;

    constructor(
        private readonly configService: ConfigService,
        // private readonly keyVaultService: KeyVaultService,
    ) {
        this.isProduction = process.env.NODE_ENV === "prod";
    }

    async getOrThrow(keyName: string): Promise<string> {
        try {
            if (this.isProduction) {
                // return await this.keyVaultService.getSecret(keyName);
            } else {
                return this.configService.getOrThrow<string>(keyName);
            }
        } catch ( error ) { }
        return undefined;
    }

    // Add similar methods for other secrets
}
