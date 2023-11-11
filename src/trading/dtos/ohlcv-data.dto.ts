export default class OhlcvDataDTO{
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;

    constructor ( o: number, high: number, l: number, c: number, vol: number ) {
        this.open = o;
        this.high = high;
        this.low = l;
        this.close = c;
        this.volume = vol;
    }
}