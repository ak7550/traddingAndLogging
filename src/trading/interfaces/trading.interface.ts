import OrderResponseDTO from "../dtos/order.response.dto";

export default interface TradingInterface {
    placeDailyStopLossOrders(accessToken: string): Promise<OrderResponseDTO[]>;
    getAllHoldings (accessToken): Promise<any[]>;
    placeOrders(accessToken): Promise<any>;
}
