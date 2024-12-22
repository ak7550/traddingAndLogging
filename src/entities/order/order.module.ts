import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CustomLogger } from 'src/custom-logger.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';

@Module({
  controllers: [OrderController],
  providers: [OrderService, CustomLogger],
  exports: [OrderService],
  imports: [TypeOrmModule.forFeature([Order])]
})
export class OrderModule {}
