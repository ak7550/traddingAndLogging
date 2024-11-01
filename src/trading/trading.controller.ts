import {
    Controller,
    DefaultValuePipe,
    Get,
    Param,
    Post,
    Put,
    Query
} from "@nestjs/common";
import HoldingInfoDTO from "./dtos/holding-info.dto";
import TradingInterface from "./interfaces/trading.interface";
import TradingFactoryService from "./trading-factory.service";
import { DematService } from "../entities/demat/demat.service";
import { DematAccount } from "../entities/demat/entities/demat-account.entity";
import GlobalConstant from "../common/globalConstants.constant";
import { AngelConstant } from "./angel/config/angel.constant";
import { TradingService } from './trading.service';
import AngelService from './angel/angel.service';

//docs: [how to handle exception and exception filters in Nest](https://docs.nestjs.com/exception-filters)
@Controller("trading")
export default class TradingController {
    constructor(
        private readonly tradingFactory: TradingFactoryService,
        private readonly dematService: DematService,
        private readonly tradingService: TradingService,
        private readonly angelService: AngelService
    ) { }


    @Get("holdings/:id")
    @Get("holdings/user/:userId")
    async getAllHoldings(
        @Param( 'userId' ) userId: number,
        @Query(GlobalConstant.BROKER)
        broker: string
    ): Promise<HoldingInfoDTO[]> {
        return await this.tradingService.getHoldings( userId, broker );
    }

    @Put("update-credentials")
    async updateCredentials(): Promise<string> {
        // await this.schedular.updateCredentials();
        return "credentials updated successfully for all the existing users of Angel";
    }

    @Get("hi")
    public sayhi(): string {
        return "hello";
    }

    //TODO: REMOVE any from return type
    @Post("/orders/sl/daily")
    async placeDailyStopLossOrders(
        @Query(
            GlobalConstant.BROKER,
            new DefaultValuePipe(AngelConstant.brokerName)
        )
        broker: string
    ): Promise<any> {
        const tradingService: TradingInterface =
            this.tradingFactory.getInstance(broker);
        return await this.angelService.placeStopLossOrders(new DematAccount({}), []);
    }

    //TODO: REMOVE any from return type
    @Get("placeOrders")
    async placeOrders(
        @Query(
            GlobalConstant.BROKER,
            new DefaultValuePipe(AngelConstant.brokerName)
        )
        broker: string
    ): Promise<any> {
        const tradingService: TradingInterface =
            this.tradingFactory.getInstance(broker);
        return await this.angelService.placeOrders("");
    }
}
