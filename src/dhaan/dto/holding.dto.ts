import { ApiProperty } from "@nestjs/swagger";

//docs: https://dhanhq.co/docs/v1/portfolio/
export class DhaanHoldingDTO {
    @ApiProperty({
        type: String,
    })
    exchange: string;

    @ApiProperty({
        type: String,
        description: "Name of the stock.",
        examples: ["IDFC", "VENUSPIPES"],
    })
    tradingSymbol: string;

    @ApiProperty({
        type: Number,
    })
    securityId: Number;

    @ApiProperty({
        type: String,
        description:
            "This is an unique code that helps to indentify a company which is listed in the Indian stock market.",
        example: "INE480C01020",
    })
    isin: string;

    @ApiProperty( {
        type: Number
    } )
    totalQty: number;

    @ApiProperty( {
        type: Number
    } )
    dpQty: number;

    @ApiProperty( {
        type: Number
    } )
    t1Qty: number;

    @ApiProperty( {
        type: Number
    } )
    availableQty: number;

    @ApiProperty( {
        type: Number
    } )
    collateralQty: number;

    @ApiProperty( {
        type: Number
    } )
    avgCostPrice: number;
}