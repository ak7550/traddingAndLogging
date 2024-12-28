import { ApiProperty } from "@nestjs/swagger";
import { IsAlphanumeric, IsNotEmpty } from "class-validator";
import { ExchangeType, ProductType } from '../../../common/globalConstants.constant';


/**
 *docs: [Angel portfolio docs](https://smartapi.angelbroking.com/docs/Portfolio)
 */
export default class AngelHoldingDTO {
    @ApiProperty({
        type: String,
    })
    exchange: ExchangeType;

    @ApiProperty({
        type: String,
        description: "Name of the stock.",
        examples: ["IDFC-EQ", "VENUSPIPES-EQ"],
    })
    @IsAlphanumeric()
    @IsNotEmpty({
        message: "Trading symbol should not be empty",
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
    t1quantity: number;

    realisedquantity: number;

    quantity: number;

    authorisedquantity: number;

    product: ProductType;

    collateralquantity: number;

    collateraltype: number;

    haircut: number;

    averageprice: number;

    ltp: number;

    symboltoken: string;

    close: number;

    profitandloss: number;

    pnlpercentage: number;
}