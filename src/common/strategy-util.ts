import _ from 'lodash';
import { OhlcvDataDTO } from '../stock-data/entities/stock-data.entity';
import Strategy, { OrderDetails } from "./strategies";

export const isGapUp = (ohlcdata: OhlcvDataDTO[], candle: number): boolean => {
    const high: number = getCandleData(ohlcdata, candle + 1, "high"),
        open: number = getCandleData(ohlcdata, candle, "open");
    return high > open;
};

export const percentageChange = (a: number, b: number): number => (a / b - 1) * 100;

type CandlePropertyType = 'open' | 'high' | 'close' | 'low' | 'volume' | 'timeStamp' | 'bodyPercentage' | 'wickPercentage' | 'tailPercentage';

export const getCandleData = (ohlc: OhlcvDataDTO[], index: number, data: CandlePropertyType): number  =>
    ohlc[ohlc.length - index][data];

/**
 * todo: not working as expected
 * method that helps to find the RSI value from historical data
 * docs: [technical analysis with R](https://bookdown.org/kochiuyu/technical-analysis-with-r-second-edition/relative-strength-index-rsi.html)
 * @param period length of rsi
 * @param historicalData array of historical ohlc data
 * @returns array of consequtive rsi values
 */
export const getRSI = ( period: number, data: OhlcvDataDTO[], candleData: CandlePropertyType = 'close' ): number[] => {
    const historicalData: number[] = data.flatMap( d => d[ candleData ] );
    const N: number = historicalData.length;
    const U: number[] = new Array(N).fill(0);
    const D: number[] = new Array(N).fill(0);
    const rsi: number[] = new Array( N ).fill( NaN );
    const Lprice: number[] = historicalData.map((_, i) => (i > 0 ? historicalData[i - 1] : NaN));

    for (let i = 2; i < N; i++) {
        if (historicalData[i] >= Lprice[i - 1]) {
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
    return rsi.reverse();
};

// Helper function to lag the prices (shift array by 1 position)
function lag(price: number[]): number[] {
  const lagged = [NaN, ...price.slice(0, price.length - 1)];
  return lagged;
}
//todo: this method is not giving accurate RSI value
export function myRSI ( n: number, data: OhlcvDataDTO[], candleData: CandlePropertyType = 'close' ): number[] {
    const price: number[] = data.flatMap( d => d[ candleData ] );
  const N = price.length;
  const U = new Array(N).fill(0); // Ups
  const D = new Array(N).fill(0); // Downs
  const rsi = new Array(N).fill(null); // RSI initialized with null (equivalent to NA in R)
  const Lprice = lag(price); // Lagged price

  for (let i = 1; i < N; i++) {
    if (price[i] >= Lprice[i]) {
      U[i] = 1;
    } else {
      D[i] = 1;
    }

    if (i >= n) {
      const AvgUp = U.slice(i - n + 1, i + 1).reduce((acc, val) => acc + val, 0) / n;
      const AvgDn = D.slice(i - n + 1, i + 1).reduce((acc, val) => acc + val, 0) / n;

      rsi[i] = AvgUp / (AvgUp + AvgDn) * 100; // RSI calculation
    }
  }

  return rsi.reverse();
}

/**
 * this method is responsible to find the ema value from the historical data
 * docs: [Technical analysis with R](https://bookdown.org/kochiuyu/technical-analysis-with-r-second-edition/exponential-moving-average-ema.html)
 * @param emaLength the actual length of EMA indicator
 * @param historicalData an array of historicalData objects, contains the details related to ohlc volume
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
    for (let i = emaLength; i < historicalData.length; i++) {
        ema[i] = beta * historicalData[i] + (1 - beta) * ema[i - 1];
    }
    console.log(`ema is: ${ema}`);

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
                if(typeof(result) === 'number'){
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

function std(window: number[]): number {
  const avg = _.mean(window);

  const variance = window.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / window.length;

  return Math.sqrt(variance); // Standard deviation is the square root of the variance
}

// Function to calculate rolling standard deviation
function calculateRollingStd(price: number[], windowSize: number): number[] {
  let sdev = [];
  for (let i = 0; i < price.length; i++) {
    if (i < windowSize - 1) {
      sdev.push(NaN); // Not enough data to calculate standard deviation
    } else {
      const window = price.slice(i - windowSize + 1, i + 1);
      sdev.push(std(window)); // Standard deviation of the window
    }
  }
  return sdev;
}

export type BollingerBandData = {
    bbUpper: number[];
    bbLower: number[];
    bbMA: number[];
    bbPercentage: number[]
}
// Function to calculate Bollinger Bands
export function getBollingerBandData ( ohlc: OhlcvDataDTO[], dataType: CandlePropertyType = 'close', n: number = 13, sd: number = 2 ): BollingerBandData {
    const price: number[] = ohlc.flatMap(d => d[dataType])
  const mavg = calculateSMA(price, n); // Simple moving average
  const sdev = calculateRollingStd(price, n); // Rolling standard deviation

  const up: number[] = [];
  const dn: number[] = [];
  const pctB: number[] = [];

  for (let i = 0; i < price.length; i++) {
    if (isNaN(mavg[i]) || isNaN(sdev[i])) {
      up.push(NaN);
      dn.push(NaN);
      pctB.push(NaN);
    } else {
      up.push(mavg[i] + sd * sdev[i]); // Upper band
      dn.push(mavg[i] - sd * sdev[i]); // Lower band
      pctB.push((price[i] - dn[i]) / (up[i] - dn[i])); // %B calculation
    }
  }

  // Return results as an object
  return {
    bbLower: dn.reverse(),
    bbMA: mavg.reverse(),
    bbUpper: up.reverse(),
    bbPercentage: pctB.reverse()
  };
}
