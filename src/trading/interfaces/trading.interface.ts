import Strategy from "src/common/strategies";
import OrderResponseDTO from "../dtos/order.response.dto";

export default interface TradingInterface {
    placeStopLossOrders(
        accessToken: string,
        strategy: Strategy[]
    ): Promise<OrderResponseDTO[]>;
    getAllHoldings(accessToken): Promise<any[]>;
    placeOrders(accessToken): Promise<any>;
}
