
import { OhlcvDataDTO } from "../../stock-data/entities/stock-data.entity";
import { DurationType, OrderType, OrderVariety, ProductType, TransactionType } from "../globalConstants.constant";
import Strategy from "../strategies";
import { findBigDaddyCandle, getCandleData, isBigDaddy } from "../strategy-util";

//PERFECT: need to run this strategy every hour at 30 min (9:30, 10:30, 11:30 ....)
export const sellconfirmationMorning: Strategy = {
    name: "Open high sell strategy for morning",
    description: "Today's 1 hour candle is breaking recent big daddy candle's low",
    mightConditionLimit: 3,
    mightConditions: [
        {
            filter: ({ historical }) => historical.oneDay.rsi[0] > 55,
            description: "Daily RSI value needs to be more than 55"
        },
        {
            filter: ({ historical }) => historical.oneWeek.rsi[0] > 60,
            description: "Weekly RSI value needs to be more than 60"
        },
        {
            filter: ({ historical }) => historical.oneMonth.rsi[0] > 60,
            description: "Monthly RSI value needs to be more than 60"
        },
        {
            description: `Previous candle was a big body`,
            filter: ({ historical: { oneDay: { candleInfo } } }) => isBigDaddy(candleInfo[candleInfo.length - 1])
        },
        {
            description: `Previous candle was a red candle.`,
            filter: ({ historical: { oneDay: { candleInfo } } }) => !candleInfo[candleInfo.length - 1].isGreen,
        },
        {
            description: `Previous 15 min candle was also below previous day candle's low`,
            filter: ({ historical: { oneDay }, current: { fifteenMinutes: { candleInfo } } }) => candleInfo[candleInfo.length - 2].close < oneDay.candleInfo[oneDay.candleInfo.length - 1].low
        },
        // {
        //     description: `recent 15 min candle is below 1 hour vwap`,
        //     filter: ({ current: { fifteenMinutes: { candleInfo }, oneHour: { vwap } } }) => getCandleData(candleInfo, 1, 'close') < vwap[0]
        // }
    ],
    mustConditions: [
        {
            description: `Today's 1 hour candle has given a close below recent big daddy candle's low`,
            filter: ({ current: { oneHour }, historical: { oneDay: { candleInfo } } }) => {
                const recentBigDaddyCandle: OhlcvDataDTO = findBigDaddyCandle(candleInfo, 30);
                if (recentBigDaddyCandle === null) {
                    return false;
                }
                const lastOneHourCandle: OhlcvDataDTO = oneHour.candleInfo[oneHour.candleInfo.length - 2];
                return lastOneHourCandle.close < recentBigDaddyCandle.low;
            }
        },
        {
            description: `recent 15 min candle is breaking the low of previous 15 min candle`,
            filter: ({ current: { fifteenMinutes: { candleInfo } } }) => getCandleData(candleInfo, 1, 'close') < getCandleData(candleInfo, 2, 'low')
        }
        // body percentage of last 2 15 min candles are more than 65.
    ],
    orderDetails: {
        decidingFactor: undefined,
        orderType: OrderType.MARKET,
        productType: ProductType.DELIVERY,
        variety: OrderVariety.NORMAL,
        duration: DurationType.DAY,
        quantity: totalQuantity => Math.floor(totalQuantity / 2), // I will sell half of my existing quantity
        transactionType: TransactionType.SELL
    }
}