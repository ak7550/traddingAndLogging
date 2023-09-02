import { Get, Controller, Query, Inject } from "@nestjs/common";
import { TradingInterface } from "./interfaces/trading.interface";
import { TradingFactoryService } from "src/trading/trading-factory.service";

@Controller("trading")
export class TradingController {
    constructor(private readonly tradingFactory: TradingFactoryService) {}

    @Get("holdings")
    getAllHoldings(@Query() broker: string): any {
        const tradingService: TradingInterface =
            this.tradingFactory.getInstance(broker);
        return tradingService.getAllHoldings();
    }
}
