import Strategy, { OrderDetails } from "src/common/strategies";
import OrderResponseDTO from "../dtos/order.response.dto";
import { DematAccount } from "src/entities/demat/entities/demat-account.entity";
import HoldingInfoDTO from "../dtos/holding-info.dto";
import { StockInfoHistorical, StockInfoMarket } from "src/stock-data/entities/stock-data.entity";

export default interface TradingInterface {
    getHolding(demat: DematAccount): Promise<HoldingInfoDTO[]>;
    placeOrder(
        orderDetail: OrderDetails,
        holding: HoldingInfoDTO,
        demat: DematAccount,
        current: StockInfoMarket,
        historical: StockInfoHistorical
    ): Promise<OrderResponseDTO>;
}
