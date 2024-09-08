import { Module } from '@nestjs/common';
import { DematService } from './demat.service';
import { DematController } from './demat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DematAccount } from './entities/demat-account.entity';
import { UserModule } from '../user/user.module';
import { BrokerModule } from '../broker/broker.module';

@Module({
  controllers: [DematController],
  providers: [DematService],
  imports: [TypeOrmModule.forFeature([DematAccount]), UserModule, BrokerModule],
  exports: [DematService]
})
export class DematModule {}
