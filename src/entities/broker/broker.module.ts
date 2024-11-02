import { Module } from '@nestjs/common';
import { BrokerService } from './broker.service';
import { BrokerController } from './broker.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Broker } from './entities/broker.entity';
import { CustomLogger } from '../../custom-logger.service';

@Module({
  controllers: [BrokerController],
  providers: [BrokerService, CustomLogger],
  imports: [TypeOrmModule.forFeature([Broker])],
  exports: [BrokerService]
})
export class BrokerModule {}
