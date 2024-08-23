import OhlcvDataDTO from "src/trading/dtos/ohlcv-data.dto";
import Strategy, { OrderDetails } from "./strategies";
import _ from "lodash";

export const isGapUp = (ohlcdata: OhlcvDataDTO[], candle: number): boolean => {
    const high: number = getCandleData(ohlcdata, candle + 1, "high"),
        open: number = getCandleData(ohlcdata, candle, "open");
    return high > open;
};

export const percentageChange = (a: number, b: number): number => (a / b - 1) * 100;

export const getCandleData = (ohlc: OhlcvDataDTO[], index: number, data: string): number =>
    ohlc[ohlc.length - index][data];

/**
 * method that helps to find the RSI value from historical data
 * docs: [technical analysis with R](https://bookdown.org/kochiuyu/technical-analysis-with-r-second-edition/relative-strength-index-rsi.html)
 * @param period length of rsi
 * @param historicalData array of historical ohlc data
 * @returns array of consequtive rsi values
 */
export const getRSI = (period: number, historicalData: OhlcvDataDTO[]): number[] => {
    const N: number = historicalData.length;
    const U: number[] = new Array(N).fill(0);
    const D: number[] = new Array(N).fill(0);
    const rsi: number[] = new Array( N ).fill( NaN );
    const Lprice: number[] = historicalData.map((_, i) => (i > 0 ? historicalData[i - 1].close : NaN));

    for (let i = 2; i < N; i++) {
        if (historicalData[i].close >= Lprice[i - 1]) {
            U[i] = 1;
        } else {
            D[i] = 1;
        }

        if (i > period) {
            const AvgUp: number = U.slice( i - period + 1, i + 1 )
                .reduce((sum, val) => sum + val,0) / period;

            const AvgDn: number = D.slice( i - period + 1, i + 1 )
                .reduce( ( sum, val ) => sum + val, 0 ) / period;

            rsi[i] = (AvgUp / (AvgUp + AvgDn)) * 100;
        }
    }

    console.table( rsi );
    return rsi;
};

/**
 * this method is responsible to find the ema value from the historical data
 * docs: [Technical analysis with R](https://bookdown.org/kochiuyu/technical-analysis-with-r-second-edition/exponential-moving-average-ema.html)
 * @param emaLength the actual length of EMA indicator
 * @param historicalData an array of historicalData objects, contains the details related to ohlc volume
 * @returns ema value of last day as per the emalength
 */
export const getEmaValue = (
    emaLength: number,
    historicalData: OhlcvDataDTO[],
): number[] => {
    const ema: number[] = new Array(historicalData.length).fill(0);

    // Calculate initial EMA
    ema[emaLength - 1] =
        historicalData
            .slice(0, emaLength)
            .reduce((sum, val) => sum + val.close, 0) / emaLength;

    const beta: number = 2 / (emaLength + 1);

    // Calculate EMA for the remaining values
    for (let i = emaLength; i < historicalData.length; i++) {
        ema[i] = beta * historicalData[i].close + (1 - beta) * ema[i - 1];
    }
    console.log(`ema is: ${ema}`);

    return ema;
};

export const getVwap = ( data: OhlcvDataDTO[] ): number[] => {
    const vwapArray: number[] = [];

    let cumulativeSumPriceVolume = 0;
    let cumulativeSumVolume = 0;

    for (const item of data) {
        const typicalPrice = (item.high + item.low + item.close) / 3;
        const priceVolume = typicalPrice * item.volume;

        cumulativeSumPriceVolume += priceVolume;
        cumulativeSumVolume += item.volume;

        const vwap = cumulativeSumPriceVolume / cumulativeSumVolume;
        vwapArray.push(vwap);
    }

    return vwapArray;
}

export const getBaseStopLoss = (
    previousClose: number,
    avgCostPrice: number,
): string => {
    const pnl: number = (previousClose / avgCostPrice - 1) * 100;
    let sl: number;
    if (pnl < 10) {
        sl = getSl(4, avgCostPrice);
    } else if (pnl < 30) {
        sl = getSl(3, previousClose);
    } else if (pnl < 30) {
        sl = getSl(4, previousClose);
    } else if (pnl < 30) {
        sl = getSl(5, previousClose);
    } else {
        sl = getSl(7, previousClose);
    }

    return sl.toFixed(2);
};

export const getSl = (percent: number, valueFrom: number): number =>
    valueFrom * (1 - percent / 100);

export const getTriggerPrice = (slValue: number, percent: number): number =>
    slValue * (1 + percent / 100);

//TODO ==> this is the ultimate section, where i need to put the logic to find the exact stop loss value
export const getTrailingStopLoss = (
    previousClose: number,
    baseStopLoss: number,
    historicalData?: OhlcvDataDTO[],
): number[] => {
    const ema9: number[] = getEmaValue(9, historicalData);
    const ema21: number[] = getEmaValue(21, historicalData);
    const dailyRSI: number[] = getRSI(14, historicalData);
    // check for open high system ==> if the 1st hour candle is open high, and the second candle is breaking the low of the previous open-high candle => sell triggers
    //TODO: need to implement all the hi-fi logic here, which will find the stop loss value every single day

    return [baseStopLoss, getTriggerPrice(baseStopLoss, 0.5)];
};

//TODO
export const getStopLoss = (
    historicalData: OhlcvDataDTO[],
    strategies: Strategy[]
): OrderDetails[] => {
    const orderDetails: OrderDetails[] = [];
    for (let index = 0; index < strategies.length; index++) {
        const strategy: Strategy = strategies[index];
        let applicable: boolean = true;
        const data: number[] = [];
        const { conditions, decidingFactor, ...rest } = strategy;
        for (let i2 = 0; i2 < conditions.length; i2++) {
            const {filter: method, description } = strategy.conditions[i2];
            const result : number | boolean = method(historicalData);
            if(result == false){
                applicable = false;
                break;
            }else{
                console.log(description);
                if(_.isNumber(result)){
                    data.push(result);
                }
            }
        }

        if(applicable){
            orderDetails.push({
                ...rest,
                price: decidingFactor(historicalData, data)
            });
        }
    }
    return orderDetails;
}
