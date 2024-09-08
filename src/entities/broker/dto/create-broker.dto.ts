import { Transform } from "class-transformer";
import { IsString } from "class-validator";
import { IntegratedBroker } from "../../../common/globalConstants.constant";


export default class CreateBrokerDto {
    @IsString()
    @Transform(({ value }) => value.toLowerCase())
    name: IntegratedBroker;
}
