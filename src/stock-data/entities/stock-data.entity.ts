import moment from "moment";
import { BollingerBandData, getBollingerBandData, getEmaValue, getRSI, getVwap, myRSI } from '../../common/strategy-util';
export class OhlcvDataDTO{
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    bodyPercentage: number;
    wickPercentage: number;
    tailPercentage: number;
    isGreen: boolean;
    isOpenLow: boolean;
    isOpenHigh: boolean;
    isWholeBody: boolean;
    timeStamp: number; // epoch format
    candleType?: 'DOJI' | 'DRAGON-FLY-DOJI' | 'HAMMER' | 'PIN-BAR' | 'MARUBOZU'; // todo => create a method to determine the candle type
    timeStr: string;

    //TODO: apply a criteria to find the what is the candle type (doji, dragonfly-doji, hammer, pin bar, whole-body)

    constructor ( t: number, o: number, high: number, l: number, c: number, vol: number ) {
        this.timeStamp = t;
        this.open = o;
        this.high = high;
        this.low = l;
        this.close = c;
        this.volume = vol;
        this.timeStr = moment.unix( this.timeStamp ).format( 'YYYY-MM-DD' );

        const totalCandleSize: number = Math.abs( this.high - this.low );
        const body: number = Math.abs( this.close - this.open );
        this.bodyPercentage = body * 100 / totalCandleSize;
        this.wickPercentage = Math.abs( this.high - Math.max( this.open, this.close ) ) * 100 / body;
        this.tailPercentage = Math.abs( this.low - Math.min( this.open, this.close ) ) * 100 / body;
        this.isGreen = this.open <= this.close;
        this.isOpenHigh = this.open === this.high;
        this.isOpenLow = this.open === this.low;
        this.isWholeBody = this.bodyPercentage === 100;
    }
}

export class TimeWiseData {
    candleInfo: OhlcvDataDTO[];
    ema9: number[];
    ema21: number[];
    ema51: number[];
    ema200?: number[];
    rsi: number[];
    vwap: number[];
    bbData: BollingerBandData;

    constructor ( c: OhlcvDataDTO[] ) {
        this.candleInfo = c;
        this.ema9 = getEmaValue( 9, c );
        this.ema21 = getEmaValue( 21, c );
        this.ema51 = getEmaValue( 51, c );
        this.rsi = myRSI( 14, c );
        this.vwap = getVwap( c );
        this.bbData = getBollingerBandData( c, 'close' );
    }
}

export class StockInfoHistorical {
    oneDay: TimeWiseData;
    oneWeek?: TimeWiseData;
    oneMonth?: TimeWiseData;
    constructor ( day: TimeWiseData, week?: TimeWiseData, month?: TimeWiseData ) {
        this.oneDay = day;
        this.oneWeek = week;
        this.oneMonth = month;
    }
}

export interface StockInfoMarket {
    fiveMinutes: TimeWiseData;
    fifteenMinutes: TimeWiseData;
    oneHour: TimeWiseData;
}