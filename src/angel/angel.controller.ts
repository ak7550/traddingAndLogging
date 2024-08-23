import { Controller, Param, Put } from '@nestjs/common';
import { DematService } from 'src/entities/demat/demat.service';
import { DematAccount } from 'src/entities/demat/entities/demat-account.entity';
import AngelScheduler from './scheduler.service';

@Controller('angel')
export class AngelController {
    constructor(
        private readonly schedularService : AngelScheduler,
        private readonly dematService: DematService
    ){}

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
