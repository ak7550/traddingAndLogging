import { Logger, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Broker } from "./entities/broker.entity";
import { Credential } from "./entities/credential.entity";
import { User } from "./entities/user.entity";
import { DematAccount } from "./entities/demat-account";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature( [ Credential, User, Broker, DematAccount ] ),
    ],
    controllers: [UserController],
    providers: [UserService, Logger],
})
export class UserModule {}
