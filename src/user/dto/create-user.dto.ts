import { Exclude, Expose } from "class-transformer";

@Expose()
    //todo: put more and more important criteria, so that no such altu faltu thing can be put into User entity
export default class CreateUserDto{
    firstName: string;
    middleName?: string;
    lastName?: string;
    panCardNumber: string;
    address?: string;

    //todo: make it nullable and must
    @Exclude()
    encryptedPassword?: string;
}