import { IsAlphanumeric, IsNotEmpty, Min, ValidateIf } from "class-validator";
import { DhaanConstants } from "../dhaan/config/dhaan.constant";
import { AngelConstant } from "../angel/config/angel.constant";
import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

export default class StockInfoDTO {
    constructor(data: Partial<StockInfoDTO>) {
    }

    @ApiProperty({
        type: String,
        description: "Name of the stock.",
        examples: ["IDFC", "VENUSPIPES"],
    })
    @IsAlphanumeric()
    @IsNotEmpty({
        message: "Trading symbol should not be empty",
    })
    @ValidateIf((symbol: string): boolean => {
        let flag: boolean = false;
        switch (symbol) {
            case DhaanConstants.brokerName:
            case "zerodha":
            case "fyers":
            case AngelConstant.brokerName:
                flag = true;
                break;
            default:
                break;
        }
        return flag;
    })
    @Expose()
    private _tradingSymbol!: string;

    public get tradingSymbol(): string {
        return this._tradingSymbol;
    }
    public set tradingSymbol(value: string) {
        this._tradingSymbol = value;
    }

    @ApiProperty({
        type: String,
        description:
            "This is an unique code that helps to indentify a company which is listed in the Indian stock market.",
        example: "INE480C01020",
    })
    private _isin!: string; // this value uniquely indentifies all the shares

    public get isin(): string {
        return this._isin;
    }
    public set isin(value: string) {
        this._isin = value;
    }

    @ApiProperty({
        type: Number,
    })
    @Min(1, {
        message:
            "total closing prioce of any holding stock cannot be less than 1",
    })
    @Exclude()
    private _closingPrice!: number;

    public get closingPrice(): number {
        return this._closingPrice;
    }
    public set closingPrice(value: number) {
        this._closingPrice = value;
    }
}