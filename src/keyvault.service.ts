// keyvault.service.ts
import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class KeyVaultService {
    private secretClient: SecretClient;

    constructor(vaultUrl: string) {
        this.secretClient = new SecretClient(
            vaultUrl,
            new DefaultAzureCredential(),
        );
    }

    async getSecret(secretName: string): Promise<string> {
        const secret = await this.secretClient.getSecret(secretName);
        return secret.value;
    }
}
