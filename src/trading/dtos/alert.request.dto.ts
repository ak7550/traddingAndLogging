import { Transform, Type } from "class-transformer";
import { IsArray, IsNumber, IsString } from "class-validator";

export default class AlertRequestDTO {
    @IsString()
    @Transform(({ value }) => value.toLowerCase())
    exchange: string;
    
    @IsString()
    @Transform(({ value }) => value.toLowerCase())
    ticker: string;

    @IsNumber()
    @Type(() => Number)
    close: number;

    @IsNumber()
    @Type(() => Number)
    open: number;

    @IsNumber()
    @Type(() => Number)
    high: number;

    @IsNumber()
    @Type(() => Number)
    low: number;
     
    @IsNumber()
    @Type(() => Number)
    volume: number;
    
    @IsNumber()
    @Type(() => Number)
    price: number;
    
    @IsArray()
    @Type(() => Number)
    strategyNumber: number[]; // strtegy to decide which strategy to pick
}