import { ApiProperty } from "@nestjs/swagger";

export class AngelHoldingDTO {
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

    @ApiProperty({
        type: Number,
    })
    t1quantity: number;

    realisedquantity: number;

    quantity: number;

    authorisedquantity: number;

    product: string;

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