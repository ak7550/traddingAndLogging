export default class OhlcvDataDTO{
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
    timeStamp: string; // this will hold the data of the candle time, in ISO format. Tells u when exactly this candle was made.

    //TODO: apply a criteria to find the what is the candle type (doji, dragonfly-doji, hammer, pin bar, whole-body)

    constructor ( t: string, o: number, high: number, l: number, c: number, vol: number ) {
        this.timeStamp = t;
        this.open = o;
        this.high = high;
        this.low = l;
        this.close = c;
        this.volume = vol;

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