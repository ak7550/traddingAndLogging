export default class OhlcDTO {
    private _open: number[];

    public get open (): number[] {
        return this._open;
    }
    public set open ( value: number[] ) {
        this._open = value;
    }

    private _high: number[];

    public get high (): number[] {
        return this._high;
    }
    public set high ( value: number[] ) {
        this._high = value;
    }

    private _low: number[];

    public get low (): number[] {
        return this._low;
    }
    public set low ( value: number[] ) {
        this._low = value;
    }

    private _close: number[];

    public get close (): number[] {
        return this._close;
    }
    public set close ( value: number[] ) {
        this._close = value;
    }
};