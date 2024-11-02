import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { HttpStatusCode } from "axios";
import { EntityManager } from "typeorm";
import { DematService } from "../demat/demat.service";
import { DematAccount } from "../demat/entities/demat-account.entity";
import { Credential } from "./credential.entity";
import { CreateCredentialDto } from "./dto/create-credential.dto";
import { UpdateCredentialDto } from "./dto/update-credential.dto";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { CustomLogger } from "../../custom-logger.service";

@Injectable()
export class CredentialService {
    async getAll() {
        return await this.entityManager.find(Credential, {});
    }

    constructor(
        private readonly entityManager: EntityManager,
        private readonly logger: CustomLogger = new CustomLogger(
            CredentialService.name
        ),
        private readonly dematService: DematService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) {}

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
        const credential: Credential =
            await this.cacheManager.get<Credential>(cacheKey);
        if (credential !== undefined) {
            return credential;
        }
        return await this.entityManager
            .findOneBy(Credential, {
                account,
                keyName
            })
            .then(credential => {
                this.cacheManager
                    .set(cacheKey, credential, 24 * 3600 * 1000)
                    .then(() =>
                        this.logger.debug(`${cacheKey} is cached for 1 day.`)
                    );
                return credential;
            });
    }

    async save(credentials: Credential[]) {
        await this.entityManager.save(credentials);
    }

    //TODO: remove this method, rename above findCredential as findCredentials and it will do the job
    async findAll(account: DematAccount): Promise<Credential[]> {
        return await this.entityManager.findBy(Credential, {
            account
        });
    }

    async create(createCredentialDto: CreateCredentialDto): Promise<void> {
        try {
            this.logger.log(`Inside createCredential method`);
            const account: DematAccount = await this.dematService.findOne(
                createCredentialDto.dematAccountId
            );

            let credential: Credential = await this.findCredential(
                account,
                createCredentialDto.keyName
            );

            if (credential == null) {
                credential = new Credential({});
            }

            credential.keyName = createCredentialDto.keyName;
            credential.keyValue = createCredentialDto.keyValue;
            credential.account = account;

            await this.entityManager.save(credential);
        } catch (error) {
            this.logger.error(
                `error occured while saving credential info ${error}`
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
            this.logger.log(`Inside updateCredential method`);
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
                return this.entityManager.save(credential);
            });
        } catch (error) {
            this.logger.error(
                `error occured while saving new broker info ${error}`
            );
            throw new HttpException(
                HttpStatusCode.Forbidden.toString(),
                HttpStatus.FORBIDDEN
            );
        }
    }
}
