import {
    Body,
    Controller,
    Delete,
    Get,
    Headers,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Req,
} from "@nestjs/common";
import { HttpStatusCode } from "axios";
import { Request } from "express";
import CreateBrokerDto from "../broker/dto/create-broker.dto";
import { CreateCredentialDto } from "../credential/dto/create-credential.dto";
import CreateDematAccountDto from "../demat/dto/create-demat-account.dto";
import CreateUserDto from "./dto/create-user.dto";
import { UserService } from "./user.service";
import { DematAccount } from "../demat/entities/demat-account.entity";

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

    

    @Get("ping")
    ping(): string {
        return "ping from user controller";
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
