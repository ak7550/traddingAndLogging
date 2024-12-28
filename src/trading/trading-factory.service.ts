import { Injectable } from "@nestjs/common";
import DhaanService from "./dhaan/dhaan.service";
import AngelService from "./angel/angel.service";
import TradingInterface from "./interfaces/trading.interface";
import { DhaanConstants } from "./dhaan/config/dhaan.constant";
import { AngelConstant } from "./angel/config/angel.constant";

@Injectable()
export default class TradingFactoryService {
    //@Inject is doing the constructor dependency injection
    constructor(
        private readonly dhaanService: DhaanService, 
        private readonly angelService: AngelService
    ) {}

    public getInstance(broker: string): TradingInterface {
        let tradingService: TradingInterface;
        switch (broker) {
            case DhaanConstants.brokerName:
                tradingService = this.dhaanService;
                break;
            case AngelConstant.brokerName:
                tradingService = this.angelService;
                break;
            default:
                break;
        }
        return tradingService;
    }
}
