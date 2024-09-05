import Strategy from "src/common/strategies";
import OrderResponseDTO from "../dtos/order.response.dto";
import { DematAccount } from "src/entities/demat/entities/demat-account.entity";

export default interface TradingInterface {
    placeStopLossOrders(
        demat: DematAccount,
        strategy: Strategy[]
    ): Promise<OrderResponseDTO[]>;
    getAllHoldings(accessToken): Promise<any[]>;
    placeOrders(accessToken): Promise<any>;
}
