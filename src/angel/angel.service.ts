import { Injectable } from "@nestjs/common";
import OrderInfoDTO from "src/trading/dtos/order-info.dto";
import { StockInfoDTO } from "src/trading/dtos/stock-info.dto";
import { TradingInterface } from "src/trading/interfaces/trading.interface";

@Injectable()
export class AngelService implements TradingInterface{
    placeDailyStopLossOrders(): Promise<OrderInfoDTO[]> {
        throw new Error("Method not implemented.");
    }
    getAllHoldings(): Promise<StockInfoDTO[]> {
        throw new Error("Method not implemented.");
    }
    placeOrders(): Promise<any> {
        throw new Error("Method not implemented.");
    }
}