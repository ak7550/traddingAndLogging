import { Controller, Param, Put } from '@nestjs/common';
import AngelScheduler from './scheduler.service';
import { DematService } from '../../entities/demat/demat.service';
import { DematAccount } from '../../entities/demat/entities/demat-account.entity';

@Controller('angel')
export class AngelController {
    constructor(
        private readonly schedularService : AngelScheduler,
        private readonly dematService: DematService
    ){}

    //TODO: REMOVE any from return type
    @Put("/orders/sl/daily")
    async placeDailyStopLossOrders(): Promise<any> {
        return await this.schedularService.placeDailyStopLossOrders([]);
    }

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
