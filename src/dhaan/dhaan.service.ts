import { Injectable } from "@nestjs/common";
import { TradingInterface } from "src/trading/interfaces/trading.interface";

@Injectable()
export class DhaanService implements TradingInterface {
    getAllHoldings(): any[] {
        throw new Error("Method not implemented.");
    }
}
