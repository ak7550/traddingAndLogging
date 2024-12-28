import { Module } from '@nestjs/common';
import { SheetController } from './sheet.controller';
import { SheetService } from './sheet.service';
import { VaultModule } from '../vault/vault.module';

@Module({
  controllers: [SheetController],
  providers: [ SheetService ],
  imports: [VaultModule]
})
export class SheetModule {}
