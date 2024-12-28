import { ExchangeType, IntegratedBroker, OrderStatus, OrderType, TransactionType } from "../../common/globalConstants.constant";
import { DematAccount } from "../../entities/demat/entities/demat-account.entity";
export default class OrderResponseDTO {
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
}