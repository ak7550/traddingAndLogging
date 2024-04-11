import OrderResponseDTO from "../dtos/order.response.dto";

export default interface TradingInterface {
    placeStopLossOrders(
        accessToken: string,
        conditions: Function[]
    ): Promise<OrderResponseDTO[]>;
    getAllHoldings(accessToken): Promise<any[]>;
    placeOrders(accessToken): Promise<any>;
}
