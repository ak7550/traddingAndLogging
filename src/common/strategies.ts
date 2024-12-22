
import {
    OhlcvDataDTO,
    StockInfoHistorical,
    StockInfoMarket
} from "../stock-data/entities/stock-data.entity";
import HoldingInfoDTO from "../trading/dtos/holding-info.dto";
import {
    DurationType,
    OrderType,
    OrderVariety,
    ProductType,
    TransactionType
} from "./globalConstants.constant";
import { daily21EMARetestBuy } from "./strategies/daily21EMARetestBuy.strategy";
import { openHighSellClosingHour } from "./strategies/openHighSellClosingHour.strategy";
import { dailyRSIBelow60 } from "./strategies/rsiBelow60.strategy";
import { sellEvery15min } from "./strategies/sellEvery15min.strategy";
import { sellconfirmationMorning } from "./strategies/sellInMorning.strategy";
import { simple4PercentSL } from "./strategies/simple4PercentSL.strategy";
import { findBigDaddyCandle, getCandleData, percentageChange } from "./strategy-util";

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
    decidingFactor?: (conditions: FilterType) => {
        price?: number;
        triggerPrice?: number;
    };
}

export interface StrategyDetails {
    name: string;
    description: string;
    orderDetails: OrderDetails;
}

interface StrategyConditions {
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
}

export default interface Strategy extends StrategyDetails, StrategyConditions{}

// needs more research
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
        quantity: totalQuantity => Math.floor(totalQuantity / 2), // I will sell half of my existing quantity
        transactionType: TransactionType.SELL
    }
};

// this strategy will tell u at the end of market hours, that should we sell the stock or not
/* how to identify a big daddy candle:
    1. it will be a huge gap up candle, more than 5% upside than previous day close
    2. 80% is the body of the candle
*/
export const bigCandleBreakDown: Strategy = {
    name: 'Big candle break down sell strategy',
    description: 'If today\'s candle breaks the low of recent big daddy candle, we will sell it. We need to test this script at the last trading hours',
    mustConditions: [
        {
            filter: ({ historical: { oneDay: { candleInfo } }, current }) => {
                const bigDaddyCandle: OhlcvDataDTO = findBigDaddyCandle(candleInfo, 60);
                return bigDaddyCandle !== null && current.dayCandle.close < bigDaddyCandle.low * 0.99;
                // current daily candle's low is lesser than low of big daddy candle
            },
            description: 'Today\'s candle is breaking the low of recent big daddy CandleData.'
        },
        {
            filter: ({ current }) => !current.dayCandle.isGreen,
            description: "Candle must be a red candle."
        },
        {
            description: `last 15 min candle is below the low big daddy candle's low`,
            filter: ({ historical: { oneDay: { candleInfo } }, current }) => {
                const bigDaddyCandle: OhlcvDataDTO = findBigDaddyCandle(candleInfo, 60);
                return bigDaddyCandle !== null
                    && current.fifteenMinutes.candleInfo[candleInfo.length - 1].close < bigDaddyCandle.low * 0.99;
                // current daily candle's low is lesser than low of big daddy candle
            },
        }
    ],
    mightConditionLimit: 0,
    mightConditions: [
        {

            description: `recent 15 min candle is below 1 hour vwap`,
            filter: ({ current: { fifteenMinutes: { candleInfo }, oneHour: { vwap } } }) => getCandleData(candleInfo, 1, 'close') < vwap[0]

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
}

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

export const lastHourStreategies: Strategy[] = [bigCandleBreakDown, dailyRSIBelow60, ageOldLoosingTrade, daily21EMARetestBuy, openHighSellClosingHour];
export const strategies: Strategy[] = [openHighSellClosingHour, sellconfirmationMorning, openHighSellMorning, daily21EMARetestBuy, simple4PercentSL, bigCandleBreakDown, dailyRSIBelow60, ageOldLoosingTrade, sellEvery15min];