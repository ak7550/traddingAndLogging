import { Controller, Get, HttpStatus, Param, Put, Res } from '@nestjs/common';
import AngelScheduler from './scheduler.service';
import { UserService } from 'src/user/user.service';
import { DematAccount } from 'src/user/entities/demat-account.entity';
import { IntegratedBroker } from 'src/common/globalConstants.constant';
import { Broker } from 'src/user/entities/broker.entity';

@Controller('angel')
export class AngelController {
    constructor(
        private readonly schedularService : AngelScheduler,
        private readonly userService: UserService,
    ){}

    @Put('refresh-token')
    async refreshTokenForAllUser(){
        await this.schedularService.updateCredentials();
    }


    @Put('refresh-token/:id')
    async refreshToken(@Param('id') dematAccountId: number){
        const demat: DematAccount = await this.userService.findDemat(dematAccountId);
        await this.schedularService.updateCredential(demat);
    }
}
