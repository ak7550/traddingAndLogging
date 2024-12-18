import { DurationType, OrderType, OrderVariety, ProductType, TransactionType } from "../globalConstants.constant";
import Strategy from "../strategies";
import { getCandleData, getEmaValue, percentageChange } from "../strategy-util";

//PERFECT
export const openHighSellClosingHour: Strategy = {
    name: "open high sell strategy",
    description:
        "Sell triggers when there's a high volume candle. Candle body is big and become a selling candle after a good gap up.",
    mustConditions: [
        {
            filter: ({ current: { dayCandle } }) =>
                dayCandle.close !== dayCandle.open,
            description: "Daily Close should not be equals to daily open"
        },
        {
            filter: ({ current: { dayCandle } }) => !dayCandle.isOpenLow,
            description: "Daily candle should not be open low"
        },
        {
            filter: ({ current: { dayCandle } }) => !dayCandle.isGreen,
            description: "Daily candle must be a red candle"
        },
        // {
        //     filter: ({ historical }) => historical.oneDay.rsi[0] > 55,
        //     description: "Daily RSI value needs to be more than 55"
        // },
        // {
        //     filter: ({ historical }) => historical.oneWeek.rsi[0] > 60,
        //     description: "Weekly RSI value needs to be more than 60"
        // },
        // {
        //     filter: ({ historical }) => historical.oneMonth.rsi[0] > 60,
        //     description: "Monthly RSI value needs to be more than 60"
        // },
        {
            filter: ({
                current: {
                    dayCandle: { volume }
                },
                historical
            }) =>
                volume >
                getCandleData(historical.oneDay.candleInfo, 1, "volume") ||
                volume >
                getEmaValue(10, historical.oneDay.candleInfo, "volume")[0],
            description:
                "Daily volume should either be more than previous day volume or it should be higher than 10 day volume EMA"
        },
        {
            filter: ({ current: { dayCandle } }) =>
                dayCandle.bodyPercentage > 51,
            description:
                "Daily candle's body should be more than 51% of the whole candle size."
        },
        {
            filter: ({
                current: { dayCandle },
                historical: {
                    oneDay: { ema21, ema9 }
                }
            }) => percentageChange(dayCandle.close, ema21[0]) > 5 || percentageChange(dayCandle.close, ema9[0]) > 5,
            description:
                "Daily candle's close shoudl be more than 5% than 21 EMA or 9 EMA"
        }
    ],

    mightConditions: [
        {
            filter: ({ current: { dayCandle }, historical }) =>
                getCandleData(historical.oneDay.candleInfo, 1, "close") <
                dayCandle.open,
            description: "Daily open should be higher than previous day close"
        },
        {
            filter: ({
                current: { dayCandle },
                historical: {
                    oneDay: { candleInfo }
                }
            }) =>
                percentageChange(
                    dayCandle.open,
                    getCandleData(candleInfo, 1, "close")
                ) > 2,
            description:
                "Daily candle's open should be more than 2% gap up from previous day close."
        }
    ],

    mightConditionLimit: 0,

    orderDetails: {
        decidingFactor: undefined,
        orderType: OrderType.STOPLOSS_MARKET,
        productType: ProductType.DELIVERY,
        variety: OrderVariety.NORMAL,
        duration: DurationType.DAY,
        quantity: totalQuantity => Math.floor(totalQuantity / 2), // I will sell half of my existing quantity,
        transactionType: TransactionType.SELL
    }
};
