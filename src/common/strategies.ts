import OhlcvDataDTO from "src/trading/dtos/ohlcv-data.dto";
import { DurationType, OrderType, OrderVariety, ProductType, TransactionType } from "./globalConstants.constant";

export interface MinifiedStrategy{
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

export default interface Strategy extends MinifiedStrategy{
    conditions: Array<(ohlcData: OhlcvDataDTO[]) => boolean | number>;
}

const isGapUp = (ohlcdata: OhlcvDataDTO[], candle: number): boolean => {
    const high: number = getCandle(ohlcdata, candle + 1, "high"),
        open: number = getCandle(ohlcdata, candle, "open");
    return high > open;
};

const percentageChange = (a: number, b: number): number => (a / b - 1) * 100;

const getCandle = (ohlc: OhlcvDataDTO[], index: number, data: string): number =>
    ohlc[ohlc.length - index][data];

export const openHighSell: Strategy = {
    name: "open high sell strategy",
    desc: "",
    transactionType: "SELL",
    conditions: [
        //1. 1 day ago open greater than 2 days ago high
        (ohlc: OhlcvDataDTO[]): boolean => isGapUp(ohlc, 2),

        //2. 1 day ago low != 1 day age open
        (ohlcData: OhlcvDataDTO[]): boolean => {
            const low: number = getCandle(ohlcData, 2, "low"),
                open: number = getCandle(ohlcData, 2, "open");
            return low !== open;
        },

        // 3. 1 day age open greater than 2 days ago close
        (ohlc: OhlcvDataDTO[]): boolean => {
            const length = ohlc.length;
            return ohlc[length - 2].open > ohlc[length - 3].close;
        },

        // 4. 1 day ago open greater than 1 day ago close => red candle
        (ohlc: OhlcvDataDTO[]): boolean => !ohlc[ohlc.length - 2].isGreen,

        //5. 1 day ago %change less than -0.5%
        (ohlc: OhlcvDataDTO[]): boolean => {
            const previousClose: number = getCandle(ohlc, 3, "close"),
                todayClose: number = getCandle(ohlc, 2, "close");
            const percentChange: number = percentageChange(
                todayClose,
                previousClose
            );
            return percentChange < -0.5;
        },

        //6. daily change is less than -0.5%
        (ohlc: OhlcvDataDTO[]): boolean =>
            getCandle(ohlc, 1, "bodyPercentage") > 0.5,

        //7. daily close less than 1 day age close
        (ohlc: OhlcvDataDTO[]): boolean => {
            const todayClose: number = getCandle(ohlc, 1, "close");
            const previousClose: number = getCandle(ohlc, 2, "close");
            return todayClose < previousClose;
        }
    ]
};

const s2: Strategy[] = [];

//todo: define the proper strategies with proper conditions, try to optimise the code as much as possible, use function currying

//todo: think how to traverse through all of the json codes work accordingly.
