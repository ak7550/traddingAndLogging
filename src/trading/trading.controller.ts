import {
    Controller,
    DefaultValuePipe,
    Get,
    Post,
    Put,
    Query
} from "@nestjs/common";
import { AngelConstant } from "src/trading/angel/config/angel.constant";
import GlobalConstant from "src/common/globalConstants.constant";
import TradingFactoryService from "src/trading/trading-factory.service";
import HoldingInfoDTO from "./dtos/holding-info.dto";
import TradingInterface from "./interfaces/trading.interface";

//docs: [how to handle exception and exception filters in Nest](https://docs.nestjs.com/exception-filters)
@Controller("trading")
export default class TradingController {
    constructor(
        private readonly tradingFactory: TradingFactoryService // private readonly schedular: AngelScheduler,
    ) {}

    @Get("holdings")
    async getAllHoldings(
        @Query(
            GlobalConstant.BROKER,
            new DefaultValuePipe(AngelConstant.brokerName)
        )
        broker: string
    ): Promise<HoldingInfoDTO[]> {
        const tradingService: TradingInterface =
            this.tradingFactory.getInstance(broker);
        return await tradingService.getAllHoldings("");
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
        return await tradingService.placeStopLossOrders("", []);
    }

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
        return await tradingService.placeOrders("");
    }
}
