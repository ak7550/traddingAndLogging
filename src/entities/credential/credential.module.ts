import { Logger, Module } from '@nestjs/common';
import { CredentialController } from './credential.controller';
import { CredentialService } from './credential.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credential } from './credential.entity';
import { DematModule } from '../demat/demat.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Credential]),
    DematModule
  ],
  controllers: [CredentialController],
  providers: [CredentialService, Logger], // inject in side the same module
  exports: [CredentialService, TypeOrmModule] // inject outside of the module, where the module has been imported
})
export class CredentialModule {}
