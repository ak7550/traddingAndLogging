import { Transform, Type } from "class-transformer";
import { IsString, isString } from "class-validator";
import { IntegratedBroker } from "src/common/globalConstants.constant";

export default class CreateBrokerDto {
    @IsString()
    @Transform(({ value }) => value.toLowerCase())
    name: IntegratedBroker;
}
