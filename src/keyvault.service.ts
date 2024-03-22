// keyvault.service.ts
import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class KeyVaultService {
    private secretClient: SecretClient;

    constructor(private readonly configService: ConfigService) {
        this.secretClient = new SecretClient(
            this.configService.getOrThrow<string>("AZURE_KEY_VAULT_URL"),
            new DefaultAzureCredential(),
        );
    }

    async getSecret(secretName: string): Promise<string> {
        const secret = await this.secretClient.getSecret(secretName);
        return secret.value;
    }
}
