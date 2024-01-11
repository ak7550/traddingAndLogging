import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { CreateCredentialDto } from "./dto/create-credential.dto";
import { UpdateCredentialDto } from "./dto/update-credential.dto";
import CreateBrokerDto from "./dto/create-broker.dto";
import { DataSource, EntityManager } from "typeorm";
import { Broker } from "./entities/broker.entity";
import { User } from "./entities/user.entity";
import { classToClassFromExist } from "class-transformer";
import { HttpStatusCode } from "axios";

@Injectable()
export class UserService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly entityManager: EntityManager,
        private readonly logger: Logger = new Logger(UserService.name)
    ) {}

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
        } catch ( error ) {
            this.logger.error( `error occured while saving new broker info`, error );
            throw new HttpException(
                HttpStatusCode.Forbidden.toString(),
                HttpStatus.FORBIDDEN,
            );
        }
        return null;
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
