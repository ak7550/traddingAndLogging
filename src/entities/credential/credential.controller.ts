import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Put
} from "@nestjs/common";
import { HttpStatusCode } from "axios";
import { DematService } from "../demat/demat.service";
import { DematAccount } from "../demat/entities/demat-account.entity";
import { Credential } from "./credential.entity";
import { CredentialService } from "./credential.service";
import { CreateCredentialDto } from "./dto/create-credential.dto";
import { UpdateCredentialDto } from "./dto/update-credential.dto";
import { AngelConstant } from "../../trading/angel/config/angel.constant";

@Controller("credential")
export class CredentialController {
    constructor(
        private readonly credentialService: CredentialService,
        private readonly dematService: DematService
    ) {}

    //TEST
    @Post()
    async createCredential(
        @Body() createCredentialDto: CreateCredentialDto
    ): Promise<HttpStatus> {
        try {
            await this.credentialService.create(createCredentialDto);
            return HttpStatus.ACCEPTED;
        } catch (error) {
            throw new HttpException(
                HttpStatusCode.Forbidden.toString(),
                HttpStatus.FORBIDDEN
            );
        }
    }

    @Get("")
    async getAll() {
        return await this.credentialService.getAll();
    }

    @Put(":id")
    async updateCredential(
        @Param("id") id: number,
        @Body() updateCredentialDTO: UpdateCredentialDto
    ): Promise<HttpStatus> {
        this.credentialService.updateCredential(id, updateCredentialDTO);
        return HttpStatus.ACCEPTED;
    }

    @Get(":id")
    async findCredntial(@Param("id") id: number): Promise<Credential> {
        return await this.dematService
            .findOne(id)
            .then((demat: DematAccount) =>
                this.credentialService.findCredential(
                    demat,
                    AngelConstant.AUTH_TOKEN
                )
            );
    }

    //TEST
    @Delete(":id")
    async deleteCredentials(@Param("id") demataccountId: number) {
        await this.credentialService.deleteCredentials(demataccountId);
        return HttpStatus.ACCEPTED;
    }
}
