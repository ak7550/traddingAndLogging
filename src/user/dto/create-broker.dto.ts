import { Transform } from "class-transformer";
import { IsString, isString } from "class-validator";

export default class CreateBrokerDto {
    @IsString()
    @Transform(({ value }) => value.toLowerCase())
    name: string;
}
