import OhlcvDataDTO from "src/trading/dtos/ohlcv-data.dto";
import { DurationType, OrderType, OrderVariety, ProductType, TransactionType } from "./globalConstants.constant";

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
}

export default interface Strategy extends OrderDetails {
    conditions: Array<{
        filter: (ohlcData: OhlcvDataDTO[]) => boolean | number;
        description: string;
    }>,

    // deciding factor is the final method, which will decide at which price, we need to set the order
    decidingFactor: Function
}

const isGapUp = (ohlcdata: OhlcvDataDTO[], candle: number): boolean => {
    const high: number = getCandleData(ohlcdata, candle + 1, "high"),
        open: number = getCandleData(ohlcdata, candle, "open");
    return high > open;
};

const percentageChange = (a: number, b: number): number => (a / b - 1) * 100;

const getCandleData = (ohlc: OhlcvDataDTO[], index: number, data: string): number =>
    ohlc[ohlc.length - index][data];

export const openHighSell: Strategy = {
    name: "open high sell strategy",
    desc: "",
    transactionType: "SELL",
    conditions: [
        {
            filter: (ohlc: OhlcvDataDTO[]): boolean => isGapUp(ohlc, 2),
            description: `1 day ago open greater than 2 days ago high`
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

const s2: Strategy[] = [];

//todo: define the proper strategies with proper conditions, try to optimise the code as much as possible, use function currying

//todo: think how to traverse through all of the json codes work accordingly.
