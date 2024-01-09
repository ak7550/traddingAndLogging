import { Injectable } from "@nestjs/common";
import { CreateCredentialDto } from "./dto/create-credential.dto";
import { UpdateCredentialDto } from "./dto/update-credential.dto";
import CreateBrokerDto from "./dto/create-broker.dto";
import { DataSource } from "typeorm";

@Injectable()
export class UserService {
    constructor(private dataSource: DataSource) {}

    createBroker(createBrokerDTO: CreateBrokerDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        queryRunner.connect();

        queryRunner.startTransaction();
        try {
            queryRunner.manager.save(createBrokerDTO);
            queryRunner.commitTransaction();
        } catch (error) {
            queryRunner.rollbackTransaction();
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
