
/**
 * docs: https://docs.nestjs.com/techniques/serialization
 * docs: https://docs.nestjs.com/techniques/validation
 */
export default class OrderResponseDTO{
    tradingSymbol: string;
    orderType: string;
    orderId: number;
    price: string;
    transactionType: string;
    broker: string;
    isin: string;
    status: string;
    reason: string;
    symboltoken: string;
}