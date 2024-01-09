import { Body, Controller, Get, Post } from "@nestjs/common";
import CreateUserDto from "./dto/create-user.dto";
import { UserService } from "./user.service";
import CreateBrokerDto from "./dto/create-broker.dto";

@Controller("user")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    createUser(@Body() createUserDTO: CreateUserDto) {}

    @Get("ping")
    ping(): string {
        return "ping from user controller";
    }

    @Post("broker")
    createBroker(@Body() createBrokerDTO: CreateBrokerDto) {
        this.userService.createBroker(createBrokerDTO);
    }
}
