import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { HttpStatusCode } from "axios";
import { DataSource, EntityManager } from "typeorm";
import CreateBrokerDto from "../broker/dto/create-broker.dto";
import { CreateCredentialDto } from "../credential/dto/create-credential.dto";
import CreateDematAccountDto from "../demat/dto/create-demat-account.dto";
import CreateUserDto from "./dto/create-user.dto";
import { Broker } from "../broker/entities/broker.entity";
import { DematAccount } from "../demat/entities/demat-account.entity";
import { User } from "./entities/user.entity";
import { UpdateCredentialDto } from "../credential/dto/update-credential.dto";
import { IntegratedBroker } from "src/common/globalConstants.constant";
import UpdateUserDto from "./dto/update-user.dto";
import { classToPlain, instanceToPlain } from "class-transformer";

@Injectable()
export class UserService {
    async findDemat(userId: number): Promise<DematAccount[]> {
        this.logger.log( `Finding demat accounts associated with ${ userId }` );
        return await this.entityManager.findOneBy( User, {
            id: userId
        } ).then( ( user: User ) => this.entityManager.findBy( DematAccount, {
            user
        } ) );
    }

    constructor(
        private readonly entityManager: EntityManager,
        private readonly logger: Logger = new Logger(UserService.name),
    ) {}

    async createUser(createUserDTO: CreateUserDto): Promise<CreateUserDto> {
        try {
            this.logger.log(`Inside createUser method`, JSON.stringify(createUserDTO));
            const user: User = await this.entityManager.save(
                new User(createUserDTO),
            );
            return createUserDTO;
        } catch (error) {
            this.logger.error(
                `error occured while saving new user info`,
                error,
            );
            throw new HttpException(
                HttpStatusCode.Forbidden.toString(),
                HttpStatus.FORBIDDEN,
            );
        }
    }

    async createDemat(createDematDto: CreateDematAccountDto): Promise<CreateDematAccountDto> {
        try {
            this.logger.log(`Inside createDemat method`, JSON.stringify(createDematDto));
            const user: User = await this.entityManager.findOneBy(User, {
                id: createDematDto.userId,
            });
            const broker: Broker = await this.entityManager.findOneBy(Broker, {
                name: createDematDto.dematAccount,
            });
            await this.entityManager.save(
                new DematAccount({
                    user,
                    broker,
                }),
            );

            return createDematDto;
        } catch (error) {
            this.logger.error(
                `error occured while saving new demat account info`,
                error,
            );
            throw new HttpException(
                HttpStatusCode.Forbidden.toString(),
                HttpStatus.FORBIDDEN,
            );
        }
    }

    create(createCredentialDto: CreateCredentialDto) {
        return "This action adds a new credential";
    }

    findAll() {
        return `This action returns all credential`;
    }

    async findOne(id: number) {
        return await this.entityManager.findOneBy(User, {
            id
        })
    }

    //TODO: remove any from here
    async update(id: number, updateUserDto: UpdateUserDto):Promise<any> {
        return await this.entityManager.findOneBy(User, {
            id
        }).then((user: User) => {
            user.panCardNumber = updateUserDto?.panCardNumber;
            user.password = updateUserDto?.password;
            user.address = updateUserDto?.address;
            return this.entityManager.save(user);
        })
        // .then((user: User) => instanceToPlain(user));
    }

    remove(id: number) {
        return `This action removes a #${id} credential`;
    }
}
