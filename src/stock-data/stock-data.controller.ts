import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { CreateStockDatumDto } from './dto/create-stock-datum.dto';
import { UpdateStockDatumDto } from './dto/update-stock-datum.dto';
import { StockInfoHistorical } from './entities/stock-data.entity';
import { StockDataService } from './stock-data.service';
import { RequestHandlerService } from './request-handler.service';

@Controller('stock-data')
// @UseInterceptors(CacheInterceptor)
export class StockDataController {
  constructor(
    private readonly stockDataService: StockDataService,
    private readonly requestHandler: RequestHandlerService
  ) {}

  @Put( 'refresh-token' )
  async refreshToken (): Promise<string> {
    return await this.requestHandler.refreshToken();
  }

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

  @Get( '/historical/:stockName' )
  async getHistoricalData ( @Param( 'stockName' ) stockName: string ): Promise<StockInfoHistorical> {
    return await this.stockDataService.getHistoricalData( stockName );
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
