import OrderResponseDTO from "../dtos/order.response.dto";

export default interface TradingInterface {
    placeDailyStopLossOrders(): Promise<OrderResponseDTO[]>;
    getAllHoldings (): Promise<any[]>;
    placeOrders(): Promise<any>;
}
