import { Logger, Module } from '@nestjs/common';
import { BrokerService } from './broker.service';
import { BrokerController } from './broker.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Broker } from './entities/broker.entity';

@Module({
  controllers: [BrokerController],
  providers: [BrokerService, Logger],
  imports: [TypeOrmModule.forFeature([Broker])],
  exports: [BrokerService]
})
export class BrokerModule {}
