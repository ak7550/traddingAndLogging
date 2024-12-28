import { Module } from "@nestjs/common";
import { DematModule } from "./demat/demat.module";
import { BrokerModule } from "./broker/broker.module";
import { CredentialModule } from "./credential/credential.module";
import { UserModule } from "./user/user.module";
import { OrderModule } from './order/order.module';

@Module({
    imports: [BrokerModule, DematModule, CredentialModule, UserModule, OrderModule],
    exports: [BrokerModule, DematModule, CredentialModule, UserModule, OrderModule]
})
export class EntityModule {}
