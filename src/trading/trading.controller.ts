import { Controller, DefaultValuePipe, Get, Post, Query } from "@nestjs/common";
import { TradingFactoryService } from "src/trading/trading-factory.service";
import { StockInfoDTO } from "./dtos/stock-info.dto";
import { TradingInterface } from "./interfaces/trading.interface";
import { AngelConstant } from "src/angel/config/angel.constant";
import GlobalConstant from "src/common/globalConstants.constant";

@Controller("trading")
export class TradingController {
    constructor(private readonly tradingFactory: TradingFactoryService) {}

    @Get("holdings")
    async getAllHoldings(@Query(GlobalConstant.BROKER, new DefaultValuePipe(AngelConstant.brokerName)) broker: string): Promise<StockInfoDTO[]> {
        const tradingService: TradingInterface =
            this.tradingFactory.getInstance(broker);
        return await tradingService.getAllHoldings();
    }

    @Get("hi")
    public sayhi(): string {
        return "hello";
    }

    @Post("/orders/sl/daily")
    async placeDailyStopLossOrders (@Query( GlobalConstant.BROKER, new DefaultValuePipe(AngelConstant.brokerName) ) broker: string,): Promise<any> {
        const tradingService: TradingInterface = this.tradingFactory.getInstance( broker );
        return await tradingService.placeDailyStopLossOrders();
    }

    @Get( "placeOrders" )
    async placeOrders (@Query(GlobalConstant.BROKER , new DefaultValuePipe(AngelConstant.brokerName)) broker:string): Promise<any> {
        const tradingService: TradingInterface = this.tradingFactory.getInstance(broker);
        return await tradingService.placeOrders();
    }
}
