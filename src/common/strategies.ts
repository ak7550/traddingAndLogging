import HoldingInfoDTO from "src/trading/dtos/holding-info.dto";
import {
    OhlcvDataDTO,
    StockInfoHistorical,
    StockInfoMarket
} from "../stock-data/entities/stock-data.entity";
import {
    DurationType,
    OrderType,
    OrderVariety,
    ProductType,
    TransactionType
} from "./globalConstants.constant";
import { findBigDaddyCandle, getCandleData, getEmaValue, isBigDaddy, percentageChange } from "./strategy-util";

type FilterType = {
    historical: StockInfoHistorical;
    current: StockInfoMarket;
    holdingDetails: HoldingInfoDTO;
};

export interface OrderDetails {
    orderType: OrderType;
    productType: ProductType;
    variety: OrderVariety;
    duration: DurationType;
    quantity: (totalQuantity: number) => number;
    transactionType: TransactionType;

    //deciding factor is to decide at which price, we need to set the order, in case of LIMIT orders
    // If decidingFactor is undefined, just execute the trade at MARKET price.
    decidingFactor?: (data: HoldingInfoDTO) => {
        price?: number;
        triggerPrice?: number;
    };
}

export default interface Strategy {
    name: string;
    description: string;
    // all of these conditions must satisfy
    mustConditions?: Array<{
        filter: (conditions: FilterType) => boolean | number;
        description: string;
    }>;

    // it's ok, if all of these conditions do not satisfy, but
    mightConditions?: Array<{
        filter: (conditions: FilterType) => boolean | number;
        description: string;
    }>;

    //this is the minimum number that needs to be satisfied
    mightConditionLimit?: number;

    orderDetails: OrderDetails;
}

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
        {
            filter: ({ current: { dayCandle }, historical }) =>
                getCandleData(historical.oneDay.candleInfo, 1, "close") <
                dayCandle.open,
            description: "Daily open should be higher than previous day close"
        },
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
                "Daily candle's body should be more than 45% of the whole candle size."
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
        },
        {
            filter: ({
                current: { dayCandle },
                historical: {
                    oneDay: { ema21 }
                }
            }) => percentageChange(dayCandle.close, ema21[0]) > 5,
            description:
                "Daily candle's close shoudl be more than 5% than 21 EMA."
        }
    ],

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

export const openHighSellconfirmationMorning: Strategy = {
    name: "Open high sell strategy for morning",
    description: "Previous candle is open high, today's 1 hour candle is breaking previuos day",
    mustConditions: [
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
            description: `Previous candle was a red candle with big body`,
            filter: ({historical: {oneDay : {candleInfo}}}) => isBigDaddy(candleInfo[candleInfo.length - 1])
        },
        {
            description: `Previous candle was a red candle.`,
            filter: ({historical: {oneDay : {candleInfo}}}) => !candleInfo[candleInfo.length - 1].isGreen,
        },
        {
            description: `Today's 1 hour candle has given a close below previous 1 day candle's low`,
            filter: ({current: {dayCandle} , historical: {oneDay : {candleInfo}}}) => candleInfo[candleInfo.length-1].low > dayCandle.close
        },
        {
            description: `Previous 15 min candle was also below previous day candle's low`,
            filter: ({ historical: {oneDay}, current: {fifteenMinutes: {candleInfo}}}) => candleInfo[candleInfo.length - 2].close < oneDay.candleInfo[oneDay.candleInfo.length - 1].low
        }
    ],
    orderDetails: {
        decidingFactor: undefined,
        orderType: OrderType.MARKET,
        productType: ProductType.DELIVERY,
        variety: OrderVariety.NORMAL,
        duration: DurationType.DAY,
        quantity: totalQuantity => Math.floor( totalQuantity / 2 ), // I will sell half of my existing quantity
        transactionType: TransactionType.SELL
    }
}

export const openHighSellMorning: Strategy = {
    name: "Open high sell strategy for morning",
    description:
        "Sell triggers if today's candle is open high and 1st 2 candles are consequtive red.",
    mustConditions: [
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
            filter: ({ historical, current }) =>
                percentageChange(
                    current.dayCandle.high,
                    getCandleData(historical.oneDay.candleInfo, 1, "close")
                ) > 2,
            description: "today's open is 2% gap up than previous close"
        },
        {
            filter: ({
                historical,
                current: {
                    fiveMinutes: { candleInfo }
                }
            }) =>
                percentageChange(
                    getCandleData(candleInfo, 1, "close"),
                    historical.oneDay.ema9[0]
                ) > 5,
            description:
                "Five min candle's close should be more than 5% of the 21 EMA"
        },
        {
            filter: ({
                current: {
                    fiveMinutes: { candleInfo }
                }
            }) => !candleInfo[candleInfo.length - 1].isGreen,
            description: "last 5 min candle needs be red candle"
        },
        {
            filter: ({
                current: {
                    fiveMinutes: { candleInfo }
                }
            }) => !candleInfo[candleInfo.length - 2].isGreen,
            description: "2nd last 5 min candle needs be red candle"
        },
        {
            filter: ({ current: { fiveMinutes } }) =>
                getCandleData(fiveMinutes.candleInfo, 1, "close") <
                getCandleData(fiveMinutes.candleInfo, 2, "close"),
            description: "Current closing should be lower than previous closing"
        },
        {
            filter: ({ current: { fiveMinutes } }) =>
                getCandleData(fiveMinutes.candleInfo, 1, "volume") >
                getCandleData(fiveMinutes.candleInfo, 2, "volume"),
            description: "Current volume should be more than previous volume"
        }
    ],
    orderDetails: {
        decidingFactor: undefined,
        orderType: OrderType.MARKET,
        productType: ProductType.DELIVERY,
        variety: OrderVariety.NORMAL,
        duration: DurationType.DAY,
        quantity: totalQuantity => Math.floor( totalQuantity / 2 ), // I will sell half of my existing quantity
        transactionType: TransactionType.SELL
    }
};

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

//needs more research
export const minimum4PercentSL: Strategy = {
    name: 'minimum 4% stop loss',
    description: 'Idea is each day for safety I will calculate the 4% SL from buying price',
    mustConditions: [],
    mightConditions: [],
    orderDetails: {
        quantity: q => Math.floor(q * 1 ), // will buy 30% of the existing stock
        decidingFactor: ({avgCostPrice}: HoldingInfoDTO) => {
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

// this strategy will tell u at the end of market hours, that should we sell the stock or not
/* how to identify a big daddy candle: 
    1. it will be a huge gap up candle, more than 5% upside than previous day close
    2. 80% is the body of the candle
*/
export const bigCandleBreakDown: Strategy = {
    name: 'Big candle break down sell strategy',
    description: 'If today\'s candle breaks the low of recent big daddy candle, we will sell it',
    mustConditions: [
        {
            filter: ({historical: {oneDay: { candleInfo }}, current}) => {
                const bigDaddyCandle : OhlcvDataDTO = findBigDaddyCandle(candleInfo, 60);
                return bigDaddyCandle !== null && current.dayCandle.close < bigDaddyCandle.low * 0.99; 
                // current daily candle's low is lesser than low of big daddy candle
            },
            description: 'Today\'s candle is breaking the low of recent big daddy CandleData.'
        },
        {
            filter: ({ current }) => !current.dayCandle.isGreen,
            description: "Candle must be a red candle."
        },
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
}

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

//TODO: incomplete
export const ageOldLoosingTrade: Strategy = {
    mustConditions: [
        {
            filter: ({ holdingDetails }) => holdingDetails.percentagePnl < 4,
            description: "Returns is less than 4%"
        }
        // need 1 more condition that says, what is the age of the trade, from when I am holding this trade.
    ],

    orderDetails: {
        orderType: OrderType.MARKET,
        productType: ProductType.DELIVERY,
        variety: OrderVariety.NORMAL,
        duration: DurationType.DAY,
        transactionType: TransactionType.SELL,
        quantity: q => q
    },
    name: "AgeOldLoosing Trade",
    description:
        "cutting down the age old looinsg trades, which are not giving returns for last 2 weeks.",
};

// INTRADAY STRATEGY: 5min RSI >60, price above 21 ema 5mins, buy in every retest and hold till RSI comes below 60 or price comes below 21 EMA
// this IDEA looks strong, if there's 51,21 crossover in 5 min chart.


export const strategies: Strategy[] = [openHighSellClosingHour, openHighSellconfirmationMorning, openHighSellMorning, daily21EMARetestBuy, minimum4PercentSL, bigCandleBreakDown, dailyRSIBelow60, ageOldLoosingTrade];