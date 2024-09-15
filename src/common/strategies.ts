import { OhlcvDataDTO } from "../stock-data/entities/stock-data.entity";
import { DurationType, OrderType, OrderVariety, ProductType, TransactionType } from "./globalConstants.constant";
import { getCandleData, isGapUp, percentageChange } from "./strategy-util";

export interface MinifiedStrategy {
    name: string;
    desc: string;
    transactionType: TransactionType;
}

export interface OrderDetails extends MinifiedStrategy{
    orderType: OrderType;
    price?: number;
    triggerPrice?: number;
    productType: ProductType;
    variety: OrderVariety;
    duration: DurationType;
    quantity: (totalQuantity: number) => number | number;
}

export default interface Strategy extends OrderDetails {
    conditions: Array<{
        filter: (ohlcData: OhlcvDataDTO[]) => boolean | number;
        description: string;
    }>,

    // deciding factor is to decide at which price, we need to set the order
    decidingFactor: Function
}

export const openHighSell: Strategy = {
    name: "open high sell strategy",
    desc: "Sell triggers when today's candle is red openhigh opens above previous day high",
    transactionType: "SELL",
    quantity: totalQuantity => Math.floor(totalQuantity / 2), // I will sell half of my existing quantity
    conditions: [
        {
            filter: (ohlc: OhlcvDataDTO[]): boolean => isGapUp(ohlc, 2),
            description: `1. day ago open greater than 2 days ago high`
        },

        {
            filter: (ohlcData: OhlcvDataDTO[]): boolean => {
                const low: number = getCandleData(ohlcData, 2, "low"), open: number = getCandleData(ohlcData, 2, "open");
                return low !== open;
            },
            description: `2. 1 day ago low != 1 day age open`,
        },

        {
            description: `3. 1 day age open greater than 2 days ago close`,
            filter: (ohlc: OhlcvDataDTO[]): boolean => {
                const length = ohlc.length;
                return ohlc[length - 2].open > ohlc[length - 3].close;
            },
        },

        {
            description: `4. 1 day ago open greater than 1 day ago close => red candle`,
            filter: (ohlc: OhlcvDataDTO[]): boolean => !ohlc[ohlc.length - 2].isGreen,
        },

        {
            description: `5. 1 day ago %change less than -0.5%`,
            filter: (ohlc: OhlcvDataDTO[]): boolean => {
                const previousClose: number = getCandleData(ohlc, 3, "close"), todayClose: number = getCandleData(ohlc, 2, "close");
                const percentChange: number = percentageChange(
                    todayClose,
                    previousClose
                );
                return percentChange < -0.5;
            }
        },

        {
            description: `6. daily change is less than -0.5%`,
            filter: (ohlc: OhlcvDataDTO[]): boolean => getCandleData(ohlc, 1, "bodyPercentage") > 0.5,
        },

        {
            description: `7. daily close less than 1 day age close`,
            filter: (ohlc: OhlcvDataDTO[]): boolean => {
                const todayClose: number = getCandleData(ohlc, 1, "close");
                const previousClose: number = getCandleData(ohlc, 2, "close");
                return todayClose < previousClose;
            }
        }
    ],

    // deciding factor is when the price hits below half of 1st day candle
    decidingFactor: (ohlc: OhlcvDataDTO[]) => {
        const high = getCandleData(ohlc, 1, "high"), low = getCandleData(ohlc, 1, "low");
        const sellingPoint = low + (high - low)/2;
        return sellingPoint * 0.99; // 1% lower than the actual selling point
    },

    orderType: "STOPLOSS_MARKET",
    productType: "DELIVERY",
    variety: "NORMAL",
    duration: "DAY"
};

// export const emaRetraceBuy: Strategy = {

// }


//TODO: define the proper strategies with proper conditions, try to optimise the code as much as possible, use function currying

//TODO: think how to traverse through all of the json codes work accordingly.
