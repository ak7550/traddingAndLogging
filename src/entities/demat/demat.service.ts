import { Injectable } from '@nestjs/common';
import { UpdateDematDto } from './dto/update-demat.dto';
import { DematAccount } from './entities/demat-account.entity';
import { Broker } from '../broker/entities/broker.entity';
import { EntityManager } from 'typeorm';
import CreateDematAccountDto from './dto/create-demat-account.dto';

@Injectable()
export class DematService {
  constructor(private readonly entityManager: EntityManager){}

  async create(createDematDto: CreateDematAccountDto): Promise<string> {
    return 'This action adds a new demat';
  }

  
  async findAll(broker: Broker): Promise<DematAccount[]> {
    return await this.entityManager.findBy(DematAccount, {
        broker,
    });
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
