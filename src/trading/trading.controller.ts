import {
    Controller,
    DefaultValuePipe,
    Get,
    Param,
    Post,
    Put,
    Query
} from "@nestjs/common";
import { AngelConstant } from "src/trading/angel/config/angel.constant";
import GlobalConstant from "src/common/globalConstants.constant";
import TradingFactoryService from "src/trading/trading-factory.service";
import HoldingInfoDTO from "./dtos/holding-info.dto";
import TradingInterface from "./interfaces/trading.interface";
import { DematAccount } from "src/entities/demat/entities/demat-account.entity";
import { DematService } from "src/entities/demat/demat.service";
import { CredentialService } from "src/entities/credential/credential.service";
import { Credential } from "src/entities/credential/credential.entity";
import AngelHoldingDTO from "./angel/dto/holding.dto";
import { mapToHoldingDTO } from "./angel/config/angel.utils";
import { Broker } from "src/entities/broker/entities/broker.entity";

//docs: [how to handle exception and exception filters in Nest](https://docs.nestjs.com/exception-filters)
@Controller("trading")
export default class TradingController {
    constructor(
        private readonly tradingFactory: TradingFactoryService, // private readonly schedular: AngelScheduler,
        private readonly dematService: DematService,
    ) {}

    @Get("holdings/:id")
    async getAllHoldings(
        @Param('id') dematAccountId: number
    ): Promise<HoldingInfoDTO[]> {
        return await this.dematService.findOne(dematAccountId)
        .then((demat: DematAccount) => Promise.resolve(this.tradingFactory.getInstance(demat.broker.name)))
        .then((tradingService: TradingInterface) => tradingService.getAllHoldings(demat))
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
        return await tradingService.placeStopLossOrders(new DematAccount({}), []);
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
function demat(value: DematAccount): DematAccount | PromiseLike<DematAccount> {
    throw new Error("Function not implemented.");
}

