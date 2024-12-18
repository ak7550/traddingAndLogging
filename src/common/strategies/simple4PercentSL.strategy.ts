import { DurationType, OrderType, OrderVariety, ProductType, TransactionType } from "../globalConstants.constant";
import Strategy from "../strategies";

export const simple4PercentSL: Strategy = {
    name: 'minimum 4% stop loss',
    description: 'Put a simple 4% sl from the avg cost price of the holding stock',
    mustConditions: [],
    mightConditions: [],
    mightConditionLimit: 0,
    orderDetails: {
        quantity: q => Math.floor(q * 1), // will buy 100% of the existing stock
        decidingFactor: ({holdingDetails: {avgCostPrice}}) => {
            const triggerPrice = avgCostPrice * 0.96;
            const slPrice = avgCostPrice * 0.95;
            return {
                triggerPrice,
                price: slPrice
            }
        },
        orderType: OrderType.STOPLOSS_LIMIT,
        productType: ProductType.DELIVERY,
        variety: OrderVariety.NORMAL,
        duration: DurationType.DAY,
        transactionType: TransactionType.SELL
    }
}
