import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Broker } from './entities/broker.entity';
import { EntityManager } from 'typeorm';
import { HttpStatusCode } from 'axios';
import { IntegratedBroker } from 'src/common/globalConstants.constant';
import CreateBrokerDto from './dto/create-broker.dto';

@Injectable()
export class BrokerService {

  constructor(private readonly logger: Logger,
    private readonly entityManager: EntityManager
  ){}

  async create(
    createBrokerDTO: CreateBrokerDto,
  ): Promise<CreateBrokerDto> {
    this.logger.log( `Inside createBroker method`, createBrokerDTO );
    //-> just wanna show it can be done by this way as well
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
        const broker : Broker = new Broker(createBrokerDTO);
        await this.entityManager.save(broker);
        return createBrokerDTO;
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

  findAll() {
    return `This action returns all broker`;
  }

  async findOne(name: IntegratedBroker): Promise<Broker> {
    return await this.entityManager.findOneBy(Broker, {
        name,
    });
  }

  remove(id: number) {
    return `This action removes a #${id} broker`;
  }
}
