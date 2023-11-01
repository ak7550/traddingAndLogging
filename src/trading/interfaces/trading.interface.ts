import OrderInfoDTO from "../dtos/order-info.dto";
import { StockInfoDTO } from "../dtos/stock-info.dto";

export interface TradingInterface {
    placeDailyStopLossOrders(): Promise<OrderInfoDTO[]>;
    getAllHoldings (): Promise<StockInfoDTO[]>;
    placeOrders(): Promise<any>;
}
