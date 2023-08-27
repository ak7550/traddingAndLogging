import { Controller, Get } from '@nestjs/common';

@Controller('sheet')
export class SheetController {
  @Get()
  getSheetData(): string {
    return 'dummy string data';
  }
}
