import { Expose } from "class-transformer";
import { IsOptional } from "class-validator";

@Expose()
export default class CreateUserDto {
    firstName: string;

    @IsOptional()
    middleName: string;

    @IsOptional()
    lastName: string;
    
    @IsOptional()
    panCardNumber: string;

    @IsOptional()
    address: string;

    @IsOptional()
    password: string;
}
