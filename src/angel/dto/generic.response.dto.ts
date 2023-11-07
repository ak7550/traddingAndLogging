export class AngelAPIResponse<Type> {
    public status: string;
    public message: string;
    public errorcode: string;
    private _data: Type;
    public get data (): Type {
        return this._data;
    }
    public set data ( value: Type ) {
        this._data = value;
    }
}