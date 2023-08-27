import { Controller, Get } from '@nestjs/common';
import { SheetService } from './sheet.service';

@Controller('sheet')
export class SheetController {
  private sheetService: SheetService;

  constructor(sheetService: SheetService) {
    this.sheetService = sheetService;
  }

  @Get()
  async getSheetData(): Promise<any[][]> {
    return await this.sheetService.getSheetData();
  }
}
