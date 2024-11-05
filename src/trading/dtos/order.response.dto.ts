import { IntegratedBroker, OrderType, TransactionType } from "../../common/globalConstants.constant";

/**
 * docs: https://docs.nestjs.com/techniques/serialization
 * docs: https://docs.nestjs.com/techniques/validation
 */
export default class OrderResponseDTO{
    tradingSymbol: string;
    orderType: OrderType;
    orderId: string;
    price: string;
    transactionType: TransactionType;
    broker: IntegratedBroker;
    isin?: string;
    status: string;
    reason: string;

}