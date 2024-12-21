import { DurationType, OrderType, OrderVariety, ProductType, TransactionType } from "../globalConstants.constant";
import Strategy from "../strategies";

export const add10PercentEveryDay: Strategy = {
    name: 'Adding 10% every day',
    description: 'Every day I will add 10% of the existing holding, only if profit is more than 6%',
    mustConditions: [
        {
            filter: ({ holdingDetails: { percentagePnl } }) => percentagePnl > 6,
            description: `holding percentage must be more than 6%`
        }
    ],
    mightConditionLimit: 1,
    mightConditions: [
        {
            filter: ({ current: { dayCandle: { isGreen } } }) => isGreen,
            description: 'current candle must be green'
        },
        {
            description: 'body percentage is less than 40%',
            filter: ({ current: { dayCandle: { bodyPercentage } } }) => bodyPercentage < 40
        }
    ],
    orderDetails: {
        decidingFactor: undefined,
        orderType: OrderType.MARKET,
        productType: ProductType.DELIVERY,
        variety: OrderVariety.NORMAL,
        duration: DurationType.DAY,
        quantity: totalQuantity => Math.floor(totalQuantity * 0.1), // I will sell half of my existing quantity
        transactionType: TransactionType.BUY
    }
}