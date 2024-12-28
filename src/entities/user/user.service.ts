import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { HttpStatusCode } from "axios";
import { EntityManager } from "typeorm";
import { CustomLogger } from "../../custom-logger.service";
import { Broker } from "../broker/entities/broker.entity";
import { CreateCredentialDto } from "../credential/dto/create-credential.dto";
import CreateDematAccountDto from "../demat/dto/create-demat-account.dto";
import { DematAccount } from "../demat/entities/demat-account.entity";
import CreateUserDto from "./dto/create-user.dto";
import UpdateUserDto from "./dto/update-user.dto";
import { User } from "./entities/user.entity";
import utils from 'util';
import _ from "lodash";

@Injectable()
export class UserService {
    async findDemat(userId: number, broker?: string): Promise<DematAccount[]> {
        this.logger.verbose(`Finding demat accounts associated with ${userId}`);
        return await this.entityManager
            .findOneBy(User, {
                id: userId
            })
            .then((user: User) =>
                this.entityManager.findBy(DematAccount, {
                    user
                })
            )
            .then((demats: DematAccount[]) => broker === undefined ? demats :
            demats.filter(({broker: {name}}) => _.isEqual(name, broker)));
    }

    constructor(
        private readonly entityManager: EntityManager,
        private readonly logger: CustomLogger = new CustomLogger(
            UserService.name
        )
    ) {}

    async createUser(createUserDTO: CreateUserDto): Promise<CreateUserDto> {
        try {
            this.logger.verbose(
                `Inside createUser method,
                ${utils.inspect(createUserDTO, {depth: 4, colors: true, })}`
            );
            const user: User = await this.entityManager.save(
                new User(createUserDTO)
            );
            return createUserDTO;
        } catch (error) {
            this.logger.error(
                `error occured while saving new user info`,
                `${utils.inspect(error, {depth: 4, colors: true, })}`
            );
            throw new HttpException(
                HttpStatusCode.Forbidden.toString(),
                HttpStatus.FORBIDDEN
            );
        }
    }

    async createDemat(
        createDematDto: CreateDematAccountDto
    ): Promise<CreateDematAccountDto> {
        try {
            this.logger.verbose(
                `Inside createDemat method ${utils.inspect(createDematDto, {depth: 4, colors: true, })}`
            );
            const user: User = await this.entityManager.findOneBy(User, {
                id: createDematDto.userId
            });
            const broker: Broker = await this.entityManager.findOneBy(Broker, {
                name: createDematDto.dematAccount
            });
            await this.entityManager.save(
                new DematAccount({
                    user,
                    broker
                })
            );

            return createDematDto;
        } catch (error) {
            this.logger.error(
                `error occured while saving new demat account info`,
                `${utils.inspect(error, {depth: 4, colors: true, })}`
            );
            throw new HttpException(
                HttpStatusCode.Forbidden.toString(),
                HttpStatus.FORBIDDEN
            );
        }
    }

    create(createCredentialDto: CreateCredentialDto) {
        return "This action adds a new credential";
    }

    async findAll(): Promise<User[]> {
        return await this.entityManager.find(User);
    }

    async findOne(id: number) {
        return await this.entityManager.findOneBy(User, {
            id
        });
    }

    //TODO: remove any from here
    async update(id: number, updateUserDto: UpdateUserDto): Promise<any> {
        return await this.entityManager
            .findOneBy(User, {
                id
            })
            .then((user: User) => {
                user.panCardNumber = updateUserDto?.panCardNumber;
                user.password = updateUserDto?.password;
                user.address = updateUserDto?.address;
                return this.entityManager.save(user);
            });
        // .then((user: User) => instanceToPlain(user));
    }

    remove(id: number) {
        return `This action removes a #${id} credential`;
    }
}
