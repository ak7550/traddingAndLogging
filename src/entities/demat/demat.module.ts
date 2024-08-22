import { Module } from '@nestjs/common';
import { DematService } from './demat.service';
import { DematController } from './demat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DematAccount } from './entities/demat-account.entity';

@Module({
  controllers: [DematController],
  providers: [DematService],
  imports: [TypeOrmModule.forFeature([DematAccount])],
  exports: [DematService]
})
export class DematModule {}
