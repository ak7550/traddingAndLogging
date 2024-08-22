import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { DematAccount } from '../demat/entities/demat-account.entity';
import { Credential } from './credential.entity';
import { HttpStatusCode } from 'axios';
import { UpdateCredentialDto } from './dto/update-credential.dto';
import { User } from '../user/entities/user.entity';
import { Broker } from '../broker/entities/broker.entity';
import { DematService } from '../demat/demat.service';

@Injectable()
export class CredentialService {
    constructor(private readonly entityManager: EntityManager, 
        private readonly logger: Logger,
        private readonly dematService: DematService
    ){}

    //TEST
    async deleteCredentials(id: number){
        const account : DematAccount = await this.dematService.findOne(id);
        return await this.entityManager.delete(Credential, {
            account
        });
    }

    async findCredential(
        account: DematAccount,
        keyName: string,
    ): Promise<Credential> {
        return await this.entityManager.findOneBy(Credential, {
            account,
            keyName,
        });
    }

    async save(credentials: Credential[]) {
        await this.entityManager.save(credentials);
    }

    //TODO: remove this method, rename above findCredential as findCredentials and it will do the job
    async findAll(account: DematAccount): Promise<Credential[]> {
        return await this.entityManager.findBy(Credential, {
            account,
        });
    }


    async create(
        createCredentialDto: CreateCredentialDto,
    ): Promise<void> {
        try {
            this.logger.log(`Inside createCredential method`);
            const account: DematAccount = await this.entityManager.findOneBy(
                DematAccount,
                {
                    id: createCredentialDto.dematAccountId,
                },
            );

            let credential: Credential = await this.findCredential(account, createCredentialDto.keyName,);

            if (credential == null) {
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
            this.logger.log(`Inside updateCredential method`);

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
}
