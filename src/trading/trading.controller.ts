import { Get, Controller, Query, DefaultValuePipe } from "@nestjs/common";
import { TradingInterface } from "./interfaces/trading.interface";
import { TradingFactoryService } from "src/trading/trading-factory.service";
import { StockInfo } from "./dtos/stock-info.dto";

@Controller("trading")
export class TradingController {
    constructor(private readonly tradingFactory: TradingFactoryService) {}

    @Get("holdings")
    async getAllHoldings(@Query('broker', new DefaultValuePipe('dhaan')) broker: string): Promise<StockInfo[]> {
        const tradingService: TradingInterface = this.tradingFactory.getInstance(broker);
        return await tradingService.getAllHoldings();
    }

    @Get( "hi" )
    public sayhi (): string{
        return "hello";
    }

    @Get( "placeOrders" )
    async placeOrders (@Query('broker', new DefaultValuePipe('dhaan')) broker:string): Promise<any> {
        return null;
    }
}
