import { DurationType, OrderType, OrderVariety, ProductType, TransactionType } from "../globalConstants.constant";
import Strategy from "../strategies";
import { getCandleData, percentageChange } from "../strategy-util";

//PERFECT
export const daily21EMARetestBuy: Strategy = {
    name: "",
    description:
        "Add more and more stocks at daily 21 EMA, for an winning trade",
    mustConditions: [
        {
            filter: ({ holdingDetails: { percentagePnl } }) =>
                percentagePnl > 4,
            description:
                "Stock should not be a lagard, total return should be more than 4%"
        },
        {
            filter: ({ current }) => current.dayCandle.isGreen,
            description: "Candle must be a green candle."
        },
        {
            filter: ({ current: { dayCandle } }) =>
                dayCandle.wickPercentage < 20,
            description:
                "Upside wick should not be more than 20% of the whole candle"
        },
        {
            filter: ({
                historical: {
                    oneDay: { ema21, candleInfo }
                }
            }) =>
                percentageChange(
                    getCandleData(candleInfo, 1, "low"),
                    ema21[0]
                ) < 1,
            description: "Candle's low is in 1% range of the 21 EMA"
        },
        {
            filter: ({
                current: {
                    fiveMinutes: { candleInfo }
                }
            }) => candleInfo[candleInfo.length - 1].isGreen,
            description: "last 5 min candle needs be green candle"
        },
        {
            filter: ({
                current: {
                    fiveMinutes: { candleInfo }
                }
            }) => candleInfo[candleInfo.length - 2].isGreen,
            description: "2nd last 5 min candle needs be green candle"
        },
        {
            filter: ({ current: { fiveMinutes } }) =>
                getCandleData(fiveMinutes.candleInfo, 1, "close") >
                getCandleData(fiveMinutes.candleInfo, 2, "close"),
            description: "Current closing should be more than previous closing"
        }
    ],

    orderDetails: {
        quantity: q => Math.floor(q * 0.3), // will buy 30% of the existing stock
        decidingFactor: undefined,
        orderType: OrderType.MARKET,
        productType: ProductType.DELIVERY,
        variety: OrderVariety.NORMAL,
        duration: DurationType.DAY,
        transactionType: TransactionType.BUY
    }
};
