import { Logger, Module } from '@nestjs/common';
import { CredentialController } from './credential.controller';
import { CredentialService } from './credential.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credential } from './credential.entity';
import { DematModule } from '../demat/demat.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Credential]),
    DematModule,
    CacheModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.getOrThrow<string>('REDIS_HOST'),
            port: configService.getOrThrow<number>('REDIS_PORT')
          },
        }),
        ttl: 7 * 3600,
        max: 3000 // maximum number of items that can be stored in cache
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [CredentialController],
  providers: [CredentialService, Logger], // inject in side the same module
  exports: [CredentialService, TypeOrmModule] // inject outside of the module, where the module has been imported
})
export class CredentialModule {}
