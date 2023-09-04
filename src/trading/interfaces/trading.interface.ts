import { StockInfo } from "../dtos/stock-info.dto";

export interface TradingInterface {
    getAllHoldings (): Promise<StockInfo[]>;
}
