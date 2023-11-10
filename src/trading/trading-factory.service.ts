import { Injectable } from "@nestjs/common";
import AngelService from "src/angel/angel.service";
import { AngelConstant } from "src/angel/config/angel.constant";
import { DhaanConstants } from "src/dhaan/config/dhaan.constant";
import DhaanService from "src/dhaan/dhaan.service";
import TradingInterface from "src/trading/interfaces/trading.interface";

@Injectable()
export default class TradingFactoryService {
    //@Inject is doing the constructor dependency injection
    constructor(private readonly dhaanService: DhaanService, private readonly angelService: AngelService) {}

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
