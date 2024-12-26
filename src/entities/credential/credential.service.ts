import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { Mutex, MutexInterface } from 'async-mutex';
import { HttpStatusCode } from "axios";
import { EntityManager } from "typeorm";
import utils from "util";
import { CustomLogger } from "../../custom-logger.service";
import { DematService } from "../demat/demat.service";
import { DematAccount } from "../demat/entities/demat-account.entity";
import { Credential } from "./credential.entity";
import { CreateCredentialDto } from "./dto/create-credential.dto";
import { UpdateCredentialDto } from "./dto/update-credential.dto";

@Injectable()
export class CredentialService {
    async findCredentialById(id: number): Promise<Credential> {
        return await this.entityManager.findOneBy(Credential, { id });
    }
    async getAll() {
        return await this.entityManager.find(Credential, {});
    }

    private mutex: Mutex;
    constructor(
        private readonly entityManager: EntityManager,
        private readonly logger: CustomLogger = new CustomLogger(
            CredentialService.name
        ),
        private readonly dematService: DematService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) {
        this.mutex = new Mutex();
    }

    //TEST
    async deleteCredentials(id: number) {
        const account: DematAccount = await this.dematService.findOne(id);
        return await this.entityManager.delete(Credential, {
            account
        });
    }

    async findCredentialByDematId(
        id: number,
        keyName: string
    ): Promise<Credential> {
        return await this.dematService
            .findOne(id)
            .then((demat: DematAccount) => this.findCredential(demat, keyName));
    }

    async findCredential(
        account: DematAccount,
        keyName: string
    ): Promise<Credential> {
        const cacheKey = `${account.id}-${keyName}`;
        const release: MutexInterface.Releaser = await this.mutex.acquire();
        const credential: Credential =
            await this.cacheManager.get<Credential>(cacheKey);
        if (credential !== undefined) {
            release();
            return credential;
        }
        return await this.entityManager
            .findOneBy(Credential, {
                account,
                keyName
            })
            .then(credential => {
                this.cacheManager
                    .set(cacheKey, credential, 6 * 3600 * 1000) // saving them for 6 hours only, to make sure they are not present inside cache, when we are refreshing them.
                    .then(() => release())
                    .then(() =>
                        this.logger.debug(`${cacheKey} is cached for 6 hours.`)
                    );
                return credential;
            });
    }

    async save(credentials: Credential[]): Promise<void> {
        await this.entityManager.save(credentials)
            .then(() => this.logger.log(`updated the credentials in db`))
            .catch(err => this.logger.error(`faced error while updating the credentials in db, ${utils.inspect(err)}`));
    }

    //TODO: remove this method, rename above findCredential as findCredentials and it will do the job
    async findAll(account: DematAccount): Promise<Credential[]> {
        return await this.entityManager.findBy(Credential, {
            account
        });
    }

    //BUG: if we are trying to save a new cred, it will not be saved
    async create(createCredentialDto: CreateCredentialDto): Promise<void> {
        try {
            this.logger.verbose(`Inside createCredential method`);
            const account: DematAccount = await this.dematService.findOne(
                createCredentialDto.dematAccountId
            );

            const credential: Credential = await this.findCredential(
                account,
                createCredentialDto.keyName
            );

            if (credential == null) {
                const newCredential = new Credential({});
                newCredential.keyName = createCredentialDto.keyName;
                newCredential.keyValue = createCredentialDto.keyValue;
                newCredential.account = account;

                await this.entityManager.createQueryBuilder()
                    .insert()
                    .into(Credential)
                    .values([newCredential])
                    .execute()
                    .then(res =>
                        this.logger.log(
                            `finally inserted into credentials tables ${utils.inspect(
                                res,
                                { depth: 4 }
                            )}`
                        )
                    )
                    .catch(err =>
                        this.logger.error(
                            `faced error while doing insert operation, ${utils.inspect(
                                err,
                                { depth: 4 }
                            )}`
                        )
                    );
            }
        } catch (error) {
            this.logger.error(
                `error occured while saving credential info ${utils.inspect(
                    error,
                    { depth: 4, colors: true }
                )}`
            );
            throw new HttpException(
                HttpStatusCode.Forbidden.toString(),
                HttpStatus.FORBIDDEN
            );
        }
    }

    //_ when it comes on updating a cred, things that we will be having => userid / user_detail (pancard), broker_name, key_name
    async updateCredential(
        id: number,
        updateCredentialDto: UpdateCredentialDto
    ): Promise<Credential> {
        try {
            this.logger.verbose(`Inside updateCredential method`);
            return await Promise.all([
                this.entityManager.findOneBy(Credential, {
                    id
                }),
                this.entityManager.findOneBy(DematAccount, {
                    id: updateCredentialDto.dematAccountId
                })
            ]).then(([credential, demat]) => {
                credential.keyName = updateCredentialDto?.keyName;
                credential.keyValue = updateCredentialDto?.keyValue;
                credential.account = demat;
                return this.entityManager.save(
                    this.entityManager.create(Credential, credential)
                );
            });
        } catch (error) {
            this.logger.error(
                `error occured while saving new broker info ${utils.inspect(
                    error,
                    { depth: 4, colors: true }
                )}`
            );
            throw new HttpException(
                HttpStatusCode.Forbidden.toString(),
                HttpStatus.FORBIDDEN
            );
        }
    }
}
