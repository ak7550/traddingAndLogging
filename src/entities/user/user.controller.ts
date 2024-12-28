import {
    Body,
    Controller,
    Get,
    Headers,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Put,
    Req
} from "@nestjs/common";
import { HttpStatusCode } from "axios";
import { Request } from "express";
import CreateUserDto from "./dto/create-user.dto";
import UpdateUserDto from "./dto/update-user.dto";
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

    @Get(':id')
    async getUser(@Param('id') id:number) {
        return await this.userService.findOne(id);
    }

    @Put(':id')
    async updateUser(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto): Promise<HttpStatus>{
       await this.userService.update(id, updateUserDto);
       return  HttpStatus.ACCEPTED;
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

    //TODO: remove any
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
