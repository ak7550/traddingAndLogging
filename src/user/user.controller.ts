import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Post
} from "@nestjs/common";
import { HttpStatusCode } from "axios";
import CreateBrokerDto from "./dto/create-broker.dto";
import CreateDematAccountDto from "./dto/create-demat-account.dto";
import CreateUserDto from "./dto/create-user.dto";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    async createUser(
        @Body() createUserDTO: CreateUserDto,
    ): Promise<CreateUserDto> {
        try {
            return await this.userService.createUser(createUserDTO);
        } catch (error) {
            throw new HttpException(
                HttpStatusCode.Forbidden.toString(),
                HttpStatus.FORBIDDEN,
            );
        }
    }

    @Post("demat")
    async createUserBrokerRelationShip(@Body()
        dematAccountDto: CreateDematAccountDto,
    ): Promise<CreateDematAccountDto> {
        try {
            return await this.userService.createDemat(dematAccountDto);
        } catch (error) {
            throw new HttpException(
                HttpStatusCode.Forbidden.toString(),
                HttpStatus.FORBIDDEN,
            );
        }
    }

    @Get("ping")
    ping(): string {
        return "ping from user controller";
    }

    //todo: need code to handle error like scenarios, if there's any problem, the server is not supposed to stop, but handle it properly with an error response
    // @Post("broker")
    async createBroker(
        @Body() createBrokerDTO: CreateBrokerDto,
    ): Promise<CreateBrokerDto | HttpException> {
        try {
            await this.userService.createBroker(createBrokerDTO);
            return createBrokerDTO;
        } catch (error) {
            throw new HttpException(
                HttpStatusCode.Forbidden.toString(),
                HttpStatus.FORBIDDEN,
            );
        }
    }
}
