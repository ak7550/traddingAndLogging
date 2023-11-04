import OrderInfoDTO from "../dtos/order-info.dto";
import { StockInfoDTO } from "../dtos/stock-info.dto";

export interface TradingInterface {
    placeDailyStopLossOrders(): Promise<OrderInfoDTO[]>;
    getAllHoldings (): Promise<any[]>;
    placeOrders(): Promise<any>;
}
