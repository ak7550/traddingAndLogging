import { Module, Global } from '@nestjs/common';
import { DhaanService } from './dhaan.service';

@Module({
  providers: [ DhaanService ],
  exports: [DhaanService]
})
export class DhaanModule {}
