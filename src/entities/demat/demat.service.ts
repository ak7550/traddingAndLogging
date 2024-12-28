import { Injectable } from '@nestjs/common';
import { UpdateDematDto } from './dto/update-demat.dto';
import { DematAccount } from './entities/demat-account.entity';
import { Broker } from '../broker/entities/broker.entity';
import { EntityManager } from 'typeorm';
import CreateDematAccountDto from './dto/create-demat-account.dto';
import { UserService } from '../user/user.service';
import { BrokerService } from '../broker/broker.service';
import { IntegratedBroker } from '../../common/globalConstants.constant';

@Injectable()
export class DematService {
  constructor ( private readonly entityManager: EntityManager,
    private readonly userService: UserService,
    private readonly brokerService: BrokerService
  ){}

  async create ( createDematDto: CreateDematAccountDto ): Promise<CreateDematAccountDto> {
    await Promise.all( [this.userService.findOne( createDematDto.userId ), this.brokerService.findOne( createDematDto.dematAccount )] )
      .then( ( [ user, broker ] ) => this.entityManager.save( new DematAccount( {
        user,
        broker
      } ) ) );
    return createDematDto;
  }


  async findAll ( broker?: IntegratedBroker ): Promise<DematAccount[]> {
    const query = this.entityManager.createQueryBuilder(DematAccount, 'dematAccount');
    if (broker) {
      query.where('dematAccount.broker = :broker', { broker });
    }
    return await query.getMany();
}

  async findOne(id: number) : Promise<DematAccount> {
    return await this.entityManager.findOne(DematAccount, {
      where: {
        id
      }
    });
  }

  update(id: number, updateDematDto: UpdateDematDto) {
    return `This action updates a #${id} demat`;
  }

  remove(id: number) {
    return `This action removes a #${id} demat`;
  }
}
