import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Logger } from '@nestjs/common';
import { StockDataService } from './stock-data.service';
import { CreateStockDatumDto } from './dto/create-stock-datum.dto';
import { UpdateStockDatumDto } from './dto/update-stock-datum.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('stock-data')
@UseInterceptors(CacheInterceptor)
export class StockDataController {
  constructor(
    private readonly stockDataService: StockDataService,
  ) {}

  @Post()
  create(@Body() createStockDatumDto: CreateStockDatumDto) {
    return this.stockDataService.create(createStockDatumDto);
  }

  @Get()
  findAll() {
    return this.stockDataService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    //TODO: write here, i will pass the stock name, ex: NSE:SBI-EQ
    // expectation is, service is pull all the data and map it to the expected dto format
    return this.stockDataService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStockDatumDto: UpdateStockDatumDto) {
    return this.stockDataService.update(+id, updateStockDatumDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockDataService.remove(+id);
  }
}
