import { Transform, Type } from "class-transformer";
import { IsNumber, IsString } from "class-validator";

export default class AlertRequestDTO {
    @IsString()
    @Transform(({ value }) => value.toLowerCase())
    exchange: string;
    
    @IsString()
    @Transform(({ value }) => value.toLowerCase())
    ticker: string;
    
    @IsNumber()
    @Type(() => Number)
    price: number;

    @IsNumber()
    @Type(() => Number)
    volume: number;
}