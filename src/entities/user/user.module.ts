import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { CustomLogger } from "../../custom-logger.service";

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [UserService, CustomLogger],
    controllers: [UserController],
    exports: [UserService]
})
export class UserModule {}
