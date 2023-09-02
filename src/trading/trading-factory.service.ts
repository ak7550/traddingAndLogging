import { Injectable } from "@nestjs/common";
import { DhaanService } from "src/dhaan/dhaan.service";
import { TradingInterface } from "src/trading/interfaces/trading.interface";

@Injectable()
export class TradingFactoryService {
    //@Inject is doing the constructor dependency injection
    constructor(private readonly dhaanService: DhaanService) {}

    public getInstance(broker: string): TradingInterface {
        let tradingService: TradingInterface;
        switch (broker) {
            case "dhaan":
                tradingService = this.dhaanService;
                break;
            default:
                break;
        }
        return tradingService;
    }
}
