export default class AngelOHLCHistoricalRequestDTO{
    exchange: string;
    symboltoken: string;
    interval: string;
    fromdate: string;
    todate: string;

    constructor ( e: string, st: string, interval: string, from: string, to: string ) {
        this.exchange = e;
        this.symboltoken = st;
        this.interval = interval;
        this.fromdate = from;
        this.todate = to;
    }
}