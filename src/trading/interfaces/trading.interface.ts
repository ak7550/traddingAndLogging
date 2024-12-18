
import OrderResponseDTO from "../dtos/order.response.dto";

import HoldingInfoDTO from "../dtos/holding-info.dto";


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
