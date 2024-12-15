import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Param,
    Post,
    Put
} from "@nestjs/common";
import { DematService } from "../demat/demat.service";
import { Credential } from "./credential.entity";
import { CredentialService } from "./credential.service";
import { CreateCredentialDto } from "./dto/create-credential.dto";
import { UpdateCredentialDto } from "./dto/update-credential.dto";

@Controller("credential")
export class CredentialController {
    constructor(
        private readonly credentialService: CredentialService,
        private readonly dematService: DematService
    ) {}

    @Get("")
    async getAll() {
        return await this.credentialService.getAll();
    }

    @Post()
    async createCredential(@Body() credential: CreateCredentialDto){
        return await this.credentialService.create(credential);
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
        return await this.credentialService.findCredentialById( id );
    }

    //TEST
    @Delete(":id")
    async deleteCredentials(@Param("id") demataccountId: number) {
        await this.credentialService.deleteCredentials(demataccountId);
        return HttpStatus.ACCEPTED;
    }
}
