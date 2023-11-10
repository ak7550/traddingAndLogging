import { ApiProperty } from "@nestjs/swagger";


/**
 *docs: [Angel portfolio docs](https://smartapi.angelbroking.com/docs/Portfolio)
 */
export default class AngelHoldingDTO {
    @ApiProperty({
        type: String,
    })
    exchange: string;

    @ApiProperty({
        type: String,
        description: "Name of the stock.",
        examples: ["IDFC-EQ", "VENUSPIPES-EQ"],
    })
    tradingsymbol: string;

    @ApiProperty({
        type: String,
        description:
            "This is an unique code that helps to indentify a company which is listed in the Indian stock market.",
        example: "INE480C01020",
    })
    isin: string;

    @ApiProperty( {
        type: Number,
    } )
    private _t1quantity: number;
    public get t1quantity (): number {
        return this._t1quantity;
    }
    public set t1quantity ( value: number ) {
        this._t1quantity = value;
    }

    realisedquantity: number;

    quantity: number;

    authorisedquantity: number;

    product: string;

    collateralquantity: number;

    collateraltype: number;

    haircut: number;

    averageprice: number;

    ltp: number;

    private _symboltoken: string;
    public get symboltoken (): string {
        return this._symboltoken;
    }
    public set symboltoken ( value: string ) {
        this._symboltoken = value;
    }

    close: number;

    profitandloss: number;

    pnlpercentage: number;
}