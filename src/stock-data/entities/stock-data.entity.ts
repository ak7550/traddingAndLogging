import moment from "moment-timezone";
import { BollingerBand, getBollingerBandData, getEmaValue, getRSI, getVwap, percentageChange } from '../../common/strategy-util';
import _ from "lodash";

export class OhlcvDataDTO {
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
    timeStr: string;

    constructor ( t: number, o: number, high: number, l: number, c: number, vol: number ) {
        this.timeStamp = t;
        this.open = o;
        this.high = high;
        this.low = l;
        this.close = c;
        this.volume = vol;
        this.timeStr = moment.unix(this.timeStamp).format('YYYY-MM-DD HH:mm');

        const totalCandleSize: number = Math.abs( this.high - this.low );
        const body: number = Math.abs( this.close - this.open );
        this.bodyPercentage = body * 100 / totalCandleSize;
        this.wickPercentage = Math.abs( this.high - Math.max( this.open, this.close ) ) * 100 / body;
        this.tailPercentage = Math.abs( this.low - Math.min( this.open, this.close ) ) * 100 / body;
        this.isGreen = this.open < this.close;
        this.isOpenHigh = percentageChange(this.high, this.open) < 0.5;
        this.isOpenLow = percentageChange(this.open, this.low) < 0.5;
        this.isWholeBody = this.bodyPercentage >= 80;
    }
}

export class TimeWiseData {
    candleInfo: OhlcvDataDTO[];
    ema9: number[];
    ema21: number[];
    ema51: number[];
    ema200?: number[];
    rsi: number[];
    vwap?: number[];
    bbData: BollingerBand[];

    constructor ( c: OhlcvDataDTO[] ) {
        this.candleInfo = c;
        this.ema9 = getEmaValue( 9, c );
        this.ema21 = getEmaValue( 21, c );
        this.ema51 = getEmaValue( 51, c );
        this.rsi = getRSI( 14, c );
        this.vwap = getVwap( c );
        this.bbData = getBollingerBandData( c, 'close' );
    }
}

export class StockInfoHistorical {
    oneDay: TimeWiseData;
    oneWeek: TimeWiseData;
    oneMonth: TimeWiseData;
    constructor ( day: TimeWiseData, week: TimeWiseData, month: TimeWiseData ) {
        this.oneDay = day;
        this.oneWeek = week;
        this.oneMonth = month;
    }
}

export class StockInfoMarket {
    fiveMinutes: TimeWiseData;
    fifteenMinutes: TimeWiseData;
    oneHour: TimeWiseData;
    dayCandle: OhlcvDataDTO

    constructor( five: TimeWiseData, fifteen: TimeWiseData, oneHour: TimeWiseData){
        this.fifteenMinutes = fifteen;
        this.fiveMinutes = five;
        this.oneHour = oneHour;
        this.dayCandle = composeDailyData(this.fiveMinutes.candleInfo);
    }
}

export const composeDailyData = ( data: OhlcvDataDTO[] ): OhlcvDataDTO => {
    const { timeStamp, open } = _.minBy( data, 'timeStamp' );
    const close: number = _.maxBy( data, 'timeStamp' ).close;
    const volume: number = _.sumBy( data, 'volume' );
    const high: number = _.maxBy( data, "high" ).high;
    const low: number = _.minBy( data, 'low' ).low;
    return new OhlcvDataDTO( timeStamp, open, high, low, close, volume );
};