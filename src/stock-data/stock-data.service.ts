import { Injectable } from '@nestjs/common';
import { CreateStockDatumDto } from './dto/create-stock-datum.dto';
import { UpdateStockDatumDto } from './dto/update-stock-datum.dto';

@Injectable()
export class StockDataService {
  create(createStockDatumDto: CreateStockDatumDto) {
    return 'This action adds a new stockDatum';
  }

  findAll() {
    return `This action returns all stockData`;
  }

  findOne(id: number) {
    return `This action returns a #${id} stockDatum`;
  }

  update(id: number, updateStockDatumDto: UpdateStockDatumDto) {
    return `This action updates a #${id} stockDatum`;
  }

  remove(id: number) {
    return `This action removes a #${id} stockDatum`;
  }
}
