import { Module } from '@nestjs/common';
import { CredentialService } from './credential.service';
import { CredentialController } from './credential.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credential } from './entities/credential.entity';
import { User } from './entities/user.entity';
import { Broker } from './entities/broker.entity';

@Module( {
  imports: [TypeOrmModule.forFeature([Credential, User, Broker])],
  controllers: [CredentialController],
  providers: [CredentialService],
})
export class CredentialModule {}
