import { Get, Controller, Query, DefaultValuePipe } from "@nestjs/common";
import { TradingInterface } from "./interfaces/trading.interface";
import { TradingFactoryService } from "src/trading/trading-factory.service";
import { StockInfoDTO } from "./dtos/stock-info.dto";

@Controller("trading")
export class TradingController {
    constructor(private readonly tradingFactory: TradingFactoryService) {}

    @Get("holdings")
    async getAllHoldings(
        @Query("broker", new DefaultValuePipe("dhaan")) broker: string,
    ): Promise<StockInfoDTO[]> {
        const tradingService: TradingInterface =
            this.tradingFactory.getInstance(broker);
        return await tradingService.getAllHoldings();
    }

    @Get("hi")
    public sayhi(): string {
        return "hello";
    }

    @Get("stoplos-orders")
    async placeOrders(
        @Query("broker", new DefaultValuePipe("dhaan")) broker: string,
    ): Promise<any> {
        const tradingService: TradingInterface =
            this.tradingFactory.getInstance(broker);
        return await tradingService.placeStopLossOrders();
    }
}
