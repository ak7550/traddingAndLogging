import { Body, Controller, Get, HttpException, HttpStatus, Post } from "@nestjs/common";
import CreateUserDto from "./dto/create-user.dto";
import { UserService } from "./user.service";
import CreateBrokerDto from "./dto/create-broker.dto";
import { HttpStatusCode } from "axios";

@Controller("user")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    createUser(@Body() createUserDTO: CreateUserDto) {}

    @Get("ping")
    ping(): string {
        return "ping from user controller";
    }

    //todo: need code to handle error like scenarios, if there's any problem, the server is not supposed to stop, but handle it properly with an error response
    // @Post("broker")
    async createBroker ( @Body() createBrokerDTO: CreateBrokerDto ): Promise<CreateBrokerDto | HttpException> {
        try {
            await this.userService.createBroker( createBrokerDTO );
            return createBrokerDTO;
        } catch (error) {
            throw new HttpException(HttpStatusCode.Forbidden.toString(), HttpStatus.FORBIDDEN);
        }
    }
}
