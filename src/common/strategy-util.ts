import _ from 'lodash';
import { BollingerBands, RSI, VWAP } from 'technicalindicators';
import { BollingerBandsOutput } from 'technicalindicators/declarations/volatility/BollingerBands.js';
import { OhlcvDataDTO } from '../stock-data/entities/stock-data.entity.js';


export const isGapUp = (ohlcdata: OhlcvDataDTO[], candle: number): boolean => {
    const high: number = getCandleData(ohlcdata, candle + 1, "high"),
        open: number = getCandleData(ohlcdata, candle, "open");
    return high > open;
};

export const findBigDaddyCandle = (candleInfo: OhlcvDataDTO[], days: number) : OhlcvDataDTO => {
    for (let index = 1; index < days; index++) {
        const currentCandle = candleInfo[candleInfo.length - index];
        if(isBigDaddy(currentCandle)){
            return currentCandle;
        } 
    }
    return null;
}

export const isBigDaddy = ({high, low, bodyPercentage}: OhlcvDataDTO) => {
    const percentUp = percentageChange(high, low);
    return percentUp > 5 && bodyPercentage > 80;
}

export const percentageChange = (a: number, b: number): number => (a / b - 1) * 100;

type CandlePropertyType = 'open' | 'high' | 'close' | 'low' | 'volume' | 'timeStamp' | 'bodyPercentage' | 'wickPercentage' | 'tailPercentage';

export const getCandleData = (ohlc: OhlcvDataDTO[], index: number, data: CandlePropertyType): number  =>
    ohlc[ohlc.length - index][data];

/**
 * method that helps to find the RSI value from historical data
 * @param period length of rsi
 * @param historicalData array of historical ohlc data
 * @returns array of consequtive rsi values
 */
export const getRSI = ( period: number, data: OhlcvDataDTO[], candleData: CandlePropertyType = 'close' ): number[] => {
    const historicalData: number[] = data.flatMap( d => d[ candleData ] );
    const rsi: number[] = RSI.calculate( { period, values: historicalData } ); // ultimate data, do not change
    return rsi.reverse();
};

/**
 * this method is responsible to find the ema value from the historical data
 * docs: [Technical analysis with R](https://bookdown.org/kochiuyu/technical-analysis-with-r-second-edition/exponential-moving-average-ema.html)
 * @param emaLength the actual length of EMA indicator
 * @param historicalData an array of historicalData objects, contains the details related to ohlc volume
 * @param CandlePropertyType which candle property needs to be taken to calculate the value of this indicator, @default close
 * @returns ema value of last day as per the emalength
 */
export const getEmaValue = (
    emaLength: number,
    data: OhlcvDataDTO[],
    candleProperty: CandlePropertyType = 'close'
): number[] => {
    const ema: number[] = new Array( data.length ).fill( 0 );
    const historicalData: number[] = data.flatMap( ( d => d[ candleProperty ] ) );

    // Calculate initial EMA
    ema[emaLength - 1] =
        historicalData
            .slice(0, emaLength)
            .reduce((sum, val) => sum + val, 0) / emaLength;

    const beta: number = 2 / (emaLength + 1);

    // Calculate EMA for the remaining values
    for ( let i = emaLength; i < historicalData.length; i++ ) {
        ema[ i ] = beta * historicalData[ i ] + ( 1 - beta ) * ema[ i - 1 ];
    }

    return ema.reverse();
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

    const vwapPack: number[] = VWAP.calculate( {
        close: _.flatMap(data, "close"),
        high: _.flatMap(data, "high"),
        low: _.flatMap(data, "low"),
        volume: _.flatMap(data, "volume")
    })
    return vwapArray.reverse();
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

export const getSMA = (
    smaLength: number,
    data: OhlcvDataDTO[],
    candleProperty: CandlePropertyType = 'close'
): number[] => calculateSMA( data.flatMap( d => d[ candleProperty ] ), smaLength );

// Function to calculate Simple Moving Average (SMA)
// Function to calculate Simple Moving Average (SMA)
function calculateSMA(price: number[], n: number): (number | null)[] {
  const sma: (number | null)[] = Array(n - 1).fill(null); // Fill first n-1 elements with null
  for (let i = n - 1; i < price.length; i++) {
    const window = price.slice(i - n + 1, i + 1); // Get the current window of n elements
    const average = window.reduce((acc, val) => acc + val, 0) / n; // Calculate the average
    sma.push(average); // Add the SMA value
  }
  return sma.reverse();
}

export type BollingerBand = {
    bbUpper: number;
    bbLower: number;
    bbMA: number;
    bbPercentage: number
}
// Function to calculate Bollinger Bands
export function getBollingerBandData ( ohlc: OhlcvDataDTO[], dataType: CandlePropertyType = 'close', n: number = 13, sd: number = 2 ): BollingerBand[] {
    const bbPackage: BollingerBandsOutput[] = BollingerBands.calculate( { period: n, stdDev: sd, values: _.flatMap( ohlc, "close" ) } );

    return bbPackage.reverse().map( ( {lower, middle, pb, upper }: BollingerBandsOutput ): BollingerBand => {
        return {
            bbUpper: upper,
            bbPercentage: pb,
            bbLower: lower,
            bbMA: middle
        }
    });
};
