import { Type } from "class-transformer";
import { IsNumber } from "class-validator";
import { IntegratedBroker } from "../../../common/globalConstants.constant";


export default class CreateDematAccountDto {
    @IsNumber()
    @Type(() => Number)
    userId: number;

    dematAccount: IntegratedBroker;
}
