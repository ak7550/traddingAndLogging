export default class AngelAPIResponse<Type> {
    private _status: string;
    public get status (): string {
        return this._status;
    }
    public set status ( value: string ) {
        this._status = value;
    }

    private _message: string;
    public get message (): string {
        return this._message;
    }
    public set message ( value: string ) {
        this._message = value;
    }

    private _errorcode: string;
    public get errorcode (): string {
        return this._errorcode;
    }
    public set errorcode ( value: string ) {
        this._errorcode = value;
    }

    private _data: Type;
    public get data (): Type {
        return this._data;
    }
    public set data ( value: Type ) {
        this._data = value;
    }
}