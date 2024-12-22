import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomLogger } from 'src/custom-logger.service';
import { Repository } from 'typeorm';
import utils from "util";
import { CreateOrderDTO } from './dto/createOrder.dto';
import { Order } from './order.entity';
import moment from 'moment-timezone';

@Injectable()
export class OrderService {
    constructor(
        private readonly logger: CustomLogger = new CustomLogger(OrderService.name),
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>
    ) {}

    async createOrder(createOrder : CreateOrderDTO): Promise<void> {
        // check if the order already exists in db using uniqueOrderId
        const alreadyExistingOrder: Order[] = await this.orderRepository.findBy({
            marketplaceOrderId: createOrder.marketplaceOrderId
        });

        if(alreadyExistingOrder !== undefined || alreadyExistingOrder.length > 0){
            this.logger.log(`Order already exist, ${utils.inspect(alreadyExistingOrder)}`);
            return;
        }

        const orderObject : Order = this.orderRepository.create(createOrder);
        
        this.orderRepository.insert(orderObject)
        .then(res => this.logger.log(`Successfully saved ${utils.inspect(res)} into db  at ${moment().format('YYYY-MM-DD HH:mm')}`))
        .catch(err => this.logger.error(`Faced error while saving the data into db ${utils.inspect(err)}`));
        
        return;
    }
}
