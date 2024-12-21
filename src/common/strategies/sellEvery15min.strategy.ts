import { OhlcvDataDTO } from "src/stock-data/entities/stock-data.entity";
import Strategy from "../strategies";
import { findBigDaddyCandle, getCandleData, percentageChange } from "../strategy-util";
import { DurationType, OrderType, OrderVariety, ProductType, TransactionType } from "../globalConstants.constant";

export const sellEvery15min: Strategy = {
    name: "Sell Every 15 min",
    description: "If stock is breaking the low of recent big daddy candle, sell it",
    mightConditionLimit: 1,
    mightConditions: [
        {
            filter: ({ historical: { oneDay: { candleInfo } }, current: { fifteenMinutes: { candleInfo: fifteenMinuteCandles } } }) => {
                const bigDaddyCandle: OhlcvDataDTO = findBigDaddyCandle(candleInfo, 60);
                return bigDaddyCandle !== null && getCandleData(fifteenMinuteCandles, 2, 'close') < bigDaddyCandle.low;
            },
            description: 'if the stock is breaking recent big daddy candles low in 15 min time frame'
        },
        {
            filter: ({ historical: { oneDay: { candleInfo } }, current: { fifteenMinutes: { candleInfo: fifteenMinuteCandles } } }) =>
                getCandleData(candleInfo, 1, 'close') > getCandleData(fifteenMinuteCandles, 2, 'close'),
            description: 'if the stock is breaking previous day close'
        }
    ],
    mustConditions: [
        {
            // vwap funcation is not giving proper data
            filter: ({ current: { fifteenMinutes: { candleInfo }, oneHour: { ema9: vwap } } }) =>
                getCandleData(candleInfo, 2, 'close') < vwap[0],
            description: 'previous 15 min candle is below 1 hour vwap'
        },
        {
            // vwap funcation is not giving proper data
            filter: ({ current: { fifteenMinutes: { candleInfo }, oneHour: { ema9:vwap } } }) =>
                getCandleData(candleInfo, 1, 'close') < vwap[0],
            description: 'current 15 min candle is below 1 hour vwap'
        },
        {
            filter: ({ current: { fifteenMinutes: { candleInfo } } }) =>
                getCandleData(candleInfo, 1, 'close') < getCandleData(candleInfo, 2, 'close'),
            description: 'curent 15 min close is lesser than previous 15 min low'
        },
        {
            filter: ({ current: { fifteenMinutes: { candleInfo } } }) =>
                !candleInfo[candleInfo.length - 1].isGreen,
            description: 'curent candle is a red candle'
        },
        {
            filter: ({ current: { fifteenMinutes: { candleInfo } } }) =>
                !candleInfo[candleInfo.length - 2].isGreen,
            description: 'previous candle is a red candle'
        },
        {
            filter: ({ current: { fifteenMinutes: { candleInfo } } }) =>
                candleInfo[candleInfo.length - 1].bodyPercentage > 70,
            description: 'current candle body percentage is more than 70'
        },
        {
            filter: ({ current: { fifteenMinutes: { candleInfo } } }) =>
                candleInfo[candleInfo.length - 2].bodyPercentage > 70,
            description: 'previous candle body percentage is more than 70'
        },
        {
            filter: ({ current: { fifteenMinutes: { rsi } } }) => rsi[0] < 75,
            description: '15 min rsi is below 75'
        },
        {
            filter: ({ current: { fifteenMinutes: { candleInfo } }, historical: { oneDay: { ema9, ema21 } } }) => {
                const lastCandle: OhlcvDataDTO = candleInfo[candleInfo.length - 1];
                return percentageChange(lastCandle.low, ema9[0]) > 5 ||
                    percentageChange(lastCandle.low, ema21[0]) > 5 ||
                    percentageChange(lastCandle.low, ema9[0]) < -5 ||
                    percentageChange(lastCandle.low, ema21[0]) < -5;
            },
            description: 'distance from 9, 21 ema is more than 5%'
        }
    ],
    orderDetails: {
        decidingFactor: undefined,
        orderType: OrderType.MARKET,
        productType: ProductType.DELIVERY,
        variety: OrderVariety.NORMAL,
        duration: DurationType.DAY,
        quantity: totalQuantity => Math.floor(totalQuantity), // I will sell full of my existing quantity
        transactionType: TransactionType.SELL
    }
}