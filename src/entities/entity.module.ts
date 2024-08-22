import { Module } from "@nestjs/common";
import { DematModule } from "./demat/demat.module";
import { BrokerModule } from "./broker/broker.module";
import { CredentialModule } from "./credential/credential.module";
import { UserModule } from "./user/user.module";

@Module({
    imports: [BrokerModule, DematModule, CredentialModule, UserModule]
})
export class EntityModule {}
