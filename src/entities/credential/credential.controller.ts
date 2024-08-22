import { Body, Controller, Delete, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { HttpStatusCode } from 'axios';
import { CredentialService } from './credential.service';

@Controller('credential')
export class CredentialController {

    constructor(private readonly credentialService: CredentialService) {}

    //TEST
    @Post()
    async createCredential(
        @Body() createCredentialDto: CreateCredentialDto,
    ): Promise<HttpStatus> {
        try {
            await this.credentialService.create(createCredentialDto);
            return HttpStatus.ACCEPTED;
        } catch (error) {
            throw new HttpException(
                HttpStatusCode.Forbidden.toString(),
                HttpStatus.FORBIDDEN,
            );
        }
    }

    //TEST
    @Delete(":id")
    async deleteCredentials(@Param('id') demataccountId: number){
        await this.credentialService.deleteCredentials(demataccountId);
        return HttpStatus.ACCEPTED;
    }
}
