import { Injectable } from '@nestjs/common';
import HoldingInfoDTO from './dtos/holding-info.dto';
import { UserService } from '../entities/user/user.service';
import { DematAccount } from '../entities/demat/entities/demat-account.entity';
import { from, lastValueFrom, mergeMap, Observable, toArray } from 'rxjs';
import TradingInterface from './interfaces/trading.interface';
import TradingFactoryService from './trading-factory.service';
import _ from 'lodash';

@Injectable()
export class TradingService {
    constructor ( private readonly userService: UserService,
        private readonly tradingFactory: TradingFactoryService
    ) { }

    //docs: https://rxjs.dev/deprecations/to-promise
    async getHoldings ( userId: number, broker: string ): Promise<HoldingInfoDTO[]> {
        let demats: DematAccount[] = await this.userService.findDemat( userId )
        if ( broker !== undefined ) {
            demats = demats.filter( d => d.broker.name === broker );
        }
        const dematObservable : Observable<HoldingInfoDTO[][]> = from( demats ).pipe(
            mergeMap( this.getHolding, 10 ), // 10 is the concurrency value
            toArray()
        );

        return await lastValueFrom(dematObservable).then(res => _.flatten(res));
    }

    async getHolding ( demat: DematAccount ) : Promise<HoldingInfoDTO[]> {
        const tradingService: TradingInterface = this.tradingFactory.getInstance( demat.broker.name );
        return await tradingService.getHolding( demat );
    }
}
