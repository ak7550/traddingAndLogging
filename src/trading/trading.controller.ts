import {
    Controller,
    Get,
    Param,
    Post,
    Put,
    Query
} from "@nestjs/common";
import GlobalConstant from "../common/globalConstants.constant";
import HoldingInfoDTO from "./dtos/holding-info.dto";
import { TradingService } from './trading.service';
import OrderResponseDTO from "./dtos/order.response.dto";
import Strategy, { daily21EMARetestBuy } from "../common/strategies";

//docs: [how to handle exception and exception filters in Nest](https://docs.nestjs.com/exception-filters)
@Controller("trading")
export default class TradingController {
    constructor(
        private readonly tradingService: TradingService
    ) { }

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

    @Post( "order" )
    public async placeOrder (
        @Query( 'user' ) userId: number,
        @Query('broker') broker: string
    ): Promise<OrderResponseDTO[]> {
        const strategy: Strategy[] = [daily21EMARetestBuy]
        return await this.tradingService.placeOrders(strategy);
    }

}
