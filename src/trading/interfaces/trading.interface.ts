
import OrderResponseDTO from "../dtos/order.response.dto";

import HoldingInfoDTO from "../dtos/holding-info.dto";
import { StrategyDetails } from "../../common/strategies";
import { DematAccount } from "../../entities/demat/entities/demat-account.entity";
import { StockInfoHistorical, StockInfoMarket } from "../../stock-data/entities/stock-data.entity";


export default interface TradingInterface {
    getHolding(demat: DematAccount): Promise<HoldingInfoDTO[]>;
    placeOrder(
        orderDetail: StrategyDetails,
        holding: HoldingInfoDTO,
        demat: DematAccount,
        current: StockInfoMarket,
        historical: StockInfoHistorical
    ): Promise<OrderResponseDTO>;
}
