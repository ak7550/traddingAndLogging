import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsAlphanumeric, IsNotEmpty, Min, ValidateIf } from "class-validator";
import { AngelConstant } from "../angel/config/angel.constant";
import { DhaanConstants } from "../dhaan/config/dhaan.constant";

export default class StockInfoDTO {
    @ApiProperty({
        type: String,
        description: "Name of the stock.",
        examples: ["IDFC", "VENUSPIPES"],
    })
    @IsAlphanumeric()
    @IsNotEmpty({
        message: "Trading symbol should not be empty",
    })
    // @ValidateIf((symbol: string): boolean => {
    //     let flag: boolean = false;
    //     switch (symbol) {
    //         case DhaanConstants.brokerName:
    //         case "zerodha":
    //         case "fyers":
    //         case AngelConstant.brokerName:
    //             flag = true;
    //             break;
    //         default:
    //             break;
    //     }
    //     return flag;
    // })
    @Expose()
    tradingsymbol: string;

    @ApiProperty({
        type: String,
        description:
            "This is an unique code that helps to indentify a company which is listed in the Indian stock market.",
        example: "INE480C01020",
    })
    isin!: string; // this value uniquely indentifies all the shares

    @ApiProperty({
        type: Number,
    })
    @Min(1, {
        message:
            "total closing prioce of any holding stock cannot be less than 1",
    })
    @Expose()
    closingPrice!: number;
}