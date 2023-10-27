import OrderInfoDTO from "../dtos/order-info.dto";
import { StockInfoDTO } from "../dtos/stock-info.dto";

export interface TradingInterface {
    placeStopLossOrders(): Promise<OrderInfoDTO[]>;
    getAllHoldings(): Promise<StockInfoDTO[]>;
}
