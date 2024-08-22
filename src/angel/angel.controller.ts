import { Controller, Get, HttpStatus, Param, Put, Res } from '@nestjs/common';
import AngelScheduler from './scheduler.service';
import { UserService } from 'src/entities/user/user.service';
import { DematAccount } from 'src/entities/demat/entities/demat-account.entity';
import { DematService } from 'src/entities/demat/demat.service';

@Controller('angel')
export class AngelController {
    constructor(
        private readonly schedularService : AngelScheduler,
        private readonly dematService: DematService,
    ){}

    @Put('refresh-token')
    async refreshTokenForAllUser(){
        await this.schedularService.updateCredentials();
    }


    @Put('refresh-token/:id')
    async refreshToken(@Param('id') dematAccountId: number){
        const demat: DematAccount = await this.dematService.findOne(dematAccountId);
        await this.schedularService.updateCredential(demat);
    }
}
