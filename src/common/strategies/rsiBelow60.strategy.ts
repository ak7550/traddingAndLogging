import { DurationType, OrderType, OrderVariety, ProductType, TransactionType } from "../globalConstants.constant";
import Strategy from "../strategies";
import { getCandleData } from "../strategy-util";

// this needs more research, some strong stocks are giving false SELL trigger
export const dailyRSIBelow60: Strategy = {
    name: "Daily RSI is below 60",
    description:
        "SELL strategy when daily RSI is below 60 for consequtive 3 days.",
    mustConditions: [
        {
            filter: ({
                historical: {
                    oneDay: { rsi }
                }
            }) => rsi[0] < 60 && rsi[1] < 60 && rsi[2] < 60,
            description: "RSI is below 60 for last 3 days"
        },
        {
            filter: ({
                historical: {
                    oneDay: { candleInfo, ema9 }
                }
            }) => getCandleData(candleInfo, 1, "close") < ema9[0],
            description: "previous day closing was below 9EMA"
        },
        {
            filter: ({
                current,
                historical: {
                    oneDay: { candleInfo }
                }
            }) =>
                current.dayCandle.close < getCandleData(candleInfo, 1, "close"),
            description: "today's closing is less than previous day close."
        }
    ],

    orderDetails: {
        decidingFactor: undefined,
        orderType: OrderType.MARKET,
        productType: ProductType.DELIVERY,
        variety: OrderVariety.NORMAL,
        duration: DurationType.DAY,
        transactionType: TransactionType.SELL,
        quantity: q => q // sell 100% of the existing portfolio
    }
};