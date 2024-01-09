import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Broker } from "./entities/broker.entity";
import { Credential } from "./entities/credential.entity";
import { User } from "./entities/user.entity";
import { UserBroker } from "./entities/userBroker.entity";
import { UserService } from "./user.service";

@Module({
    imports: [TypeOrmModule.forFeature([Credential, User, Broker, UserBroker])],
    controllers: [],
    providers: [UserService],
})
export class UserModule {}
