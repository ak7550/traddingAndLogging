import { ExchangeType, OrderStatus, OrderType, TransactionType } from "src/common/globalConstants.constant";
import { DematAccount } from "src/entities/demat/entities/demat-account.entity";
import { Order } from "../order.entity";

export class CreateOrderDTO {
    orderStatus: OrderStatus;
    message: string;
    stockSymbol: string;
    exchange: ExchangeType;
    transactionType: TransactionType;
    orderType: OrderType;
    quantity: number;
    price: number;
    triggerPrice: number;
    marketplaceOrderId: string;
    account: DematAccount;
    strategyName: string;

    constructor(data: Partial<Order>){
        Object.assign(this, data);
    }
}