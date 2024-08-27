export default class DhaanHistoricalDataRequest {

    private _symbol: string;

    public get symbol (): string {
        return this._symbol;
    }
    public set symbol ( value: string ) {
        this._symbol = value;
    }

    private _exchangeSegment: string;

    public get exchangeSegment (): string {
        return this._exchangeSegment;
    }
    public set exchangeSegment ( value: string ) {
        this._exchangeSegment = value;
    }

    private _instrument: string;

    public get instrument (): string {
        return this._instrument;
    }
    public set instrument ( value: string ) {
        this._instrument = value;
    }

    private _expiryCode: number;

    public get expiryCode (): number {
        return this._expiryCode;
    }
    public set expiryCode ( value: number ) {
        this._expiryCode = value;
    }

    private _fromDate: string;

    public get fromDate (): string {
        return this._fromDate;
    }
    public set fromDate ( value: string ) {
        this._fromDate = value;
    }

    private _toDate: string;
    
    public get toDate (): string {
        return this._toDate;
    }
    public set toDate ( value: string ) {
        this._toDate = value;
    }
};
