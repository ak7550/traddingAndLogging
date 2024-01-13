import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { HttpStatusCode } from "axios";
import { DataSource, EntityManager } from "typeorm";
import CreateBrokerDto from "./dto/create-broker.dto";
import { CreateCredentialDto } from "./dto/create-credential.dto";
import CreateDematAccountDto from "./dto/create-demat-account.dto";
import CreateUserDto from "./dto/create-user.dto";
import { Broker } from "./entities/broker.entity";
import { DematAccount } from "./entities/demat-account";
import { User } from "./entities/user.entity";
import { Credential } from "./entities/credential.entity";
import { UpdateCredentialDto } from "./dto/update-credential.dto";
import { IntegratedBroker } from "src/common/globalConstants.constant";

@Injectable()
export class UserService {
    async saveCredentials ( credentials: Credential[] ) {
        await this.entityManager.save( credentials );
    }
    async findCredential ( account: DematAccount, keyName?: string ): Promise<Credential> {
        return await this.entityManager.findOneBy(Credential, {
            account,
            keyName
        });
    }

    //todo: remove this method, rename above findCredential as findCredentials and it will do the job
    async findCredentials(account: DematAccount): Promise<Credential[]> {
        return await this.entityManager.findBy(Credential, {
            account,
        });
    }
    async findDemats(broker: Broker): Promise<DematAccount[]> {
        return await this.entityManager.findBy(DematAccount, {
            broker,
        });
    }
    constructor(
        private readonly dataSource: DataSource,
        private readonly entityManager: EntityManager,
        private readonly logger: Logger = new Logger(UserService.name),
    ) {}

    async findBroker(name: IntegratedBroker): Promise<Broker> {
        return await this.entityManager.findOneBy(Broker, {
            name,
        });
    }

    async createCredential(
        createCredentialDto: CreateCredentialDto,
    ): Promise<void> {
        try {
            this.logger.log(
                `Inside createCredential method`,
                createCredentialDto,
            );
            const account: DematAccount = await this.entityManager.findOneBy(
                DematAccount,
                {
                    id: createCredentialDto.dematAccountId,
                },
            );

            let credential: Credential = await this.findCredential( account, createCredentialDto.keyName );

            if ( credential == null ) {
                credential = new Credential({});
            }

            credential.keyName = createCredentialDto.keyName;
            credential.keyValue = createCredentialDto.keyValue;
            credential.account = account;

            await this.entityManager.save(credential);
        } catch (error) {
            this.logger.error(
                `error occured while saving credential info`,
                error,
            );
            throw new HttpException(
                HttpStatusCode.Forbidden.toString(),
                HttpStatus.FORBIDDEN,
            );
        }
    }

    //_ when it comes on updating a cred, things that we will be having => userid / user_detail (pancard), broker_name, key_name
    async updateCredential(
        updateCredentialDto: UpdateCredentialDto,
    ): Promise<void> {
        try {
            this.logger.log(
                `Inside updateCredential method`,
                updateCredentialDto,
            );

            let user: User;
            const {
                userId: uId,
                panCardNumber,
                brokerName,
                keyName,
                keyValue,
            } = updateCredentialDto;

            if (uId == undefined) {
                user = await this.entityManager.findOneBy(User, {
                    panCardNumber,
                });
            } else {
                user = await this.entityManager.findOneBy(User, {
                    id: uId,
                });
            }

            const broker: Broker = await this.entityManager.findOneBy(Broker, {
                name: brokerName,
            });

            const demat: DematAccount = await this.entityManager.findOneBy(
                DematAccount,
                {
                    user,
                    broker,
                },
            );

            const credential: Credential = await this.entityManager.findOneBy(
                Credential,
                {
                    account: demat,
                    keyName,
                },
            );

            credential.keyValue = keyValue;
            await this.entityManager.save(credential);
        } catch (error) {
            this.logger.error(
                `error occured while saving new broker info`,
                error,
            );
            throw new HttpException(
                HttpStatusCode.Forbidden.toString(),
                HttpStatus.FORBIDDEN,
            );
        }
    }

    async createUser(createUserDTO: CreateUserDto): Promise<CreateUserDto> {
        try {
            this.logger.log(`Inside createUser method`, createUserDTO);
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

    async createBroker(
        createBrokerDTO: CreateBrokerDto,
    ): Promise<CreateBrokerDto> {
        this.logger.log(`Inside createBroker method`, createBrokerDTO);
        // const queryRunner = this.dataSource.createQueryRunner();
        // queryRunner.connect();

        // queryRunner.startTransaction();
        // try {
        //     queryRunner.manager.save(createBrokerDTO);
        //     queryRunner.commitTransaction();
        // } catch (error) {
        //     this.logger.error(
        //         `error occured while saving new broker info`,
        //         error,
        //     );
        //     queryRunner.rollbackTransaction();
        //     throw new HttpException(
        //         HttpStatusCode.Forbidden.toString(),
        //         HttpStatus.FORBIDDEN,
        //     );

        // }

        try {
            const broker = new Broker(createBrokerDTO);
            await this.entityManager.save(broker);
            return broker;
        } catch (error) {
            this.logger.error(
                `error occured while saving new broker info`,
                error,
            );
            throw new HttpException(
                HttpStatusCode.Forbidden.toString(),
                HttpStatus.FORBIDDEN,
            );
        }
        return null;
    }

    async createDemat(
        createDematDto: CreateDematAccountDto,
    ): Promise<CreateDematAccountDto> {
        try {
            this.logger.log(`Inside createDemat method`, createDematDto);
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

    findOne(id: number) {
        return `This action returns a #${id} credential`;
    }

    update(id: number, updateCredentialDto: UpdateCredentialDto) {
        return `This action updates a #${id} credential`;
    }

    remove(id: number) {
        return `This action removes a #${id} credential`;
    }
}
