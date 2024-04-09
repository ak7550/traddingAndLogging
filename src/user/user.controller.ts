import {
    Body,
    Controller,
    Get,
    Headers,
    HttpException,
    HttpStatus,
    Post,
    Req,
} from "@nestjs/common";
import { HttpStatusCode } from "axios";
import { Request } from "express";
import CreateBrokerDto from "./dto/create-broker.dto";
import { CreateCredentialDto } from "./dto/create-credential.dto";
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

    @Post("credential")
    async createCredential(
        @Body() CreateCredentialDto: CreateCredentialDto,
    ): Promise<HttpStatus> {
        try {
            await this.userService.createCredential(CreateCredentialDto);
            return HttpStatus.ACCEPTED;
        } catch (error) {
            throw new HttpException(
                HttpStatusCode.Forbidden.toString(),
                HttpStatus.FORBIDDEN,
            );
        }
    }

    @Post("demat")
    async createUserBrokerRelationShip(
        @Body()
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

    @Post("tradingview")
    async tradingviewAlert(
        @Req() request: Request,
        @Headers("content-type") contentType: string,
    ) {
        const payload = await this.getRawBody(request);
        console.log(`${payload}`);
        console.log(contentType);
        console.log(payload);
        console.log(`${JSON.stringify(payload)}`);
        return "thanks";
    }

    private async getRawBody(rawContent: any): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let buffer: Buffer = Buffer.from("");
            rawContent.on("data", (chunk: Buffer) => {
                buffer = Buffer.concat([buffer, chunk]);
            });
            rawContent.on("end", () => {
                resolve(buffer.toString("utf-8"));
            });
            rawContent.on("error", (err: any) => {
                reject(err);
            });
        });
    }
}
