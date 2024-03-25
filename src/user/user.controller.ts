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
import { CreateCredentialDto } from "./dto/create-credential.dto";
import { Http2ServerResponse } from "http2";

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

    @Post( "credential" )
    async createCredential ( @Body() CreateCredentialDto: CreateCredentialDto ): Promise<HttpStatus> {
        try {
            await this.userService.createCredential( CreateCredentialDto );
            return HttpStatus.ACCEPTED;
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
    //todo: create some middlewares who'll be checking if this routes should be open or not dynamically as per the environments
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
