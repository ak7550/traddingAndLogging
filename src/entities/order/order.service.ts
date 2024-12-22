import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import moment from "moment-timezone";
import { CustomLogger } from "src/custom-logger.service";
import { Repository } from "typeorm";
import utils from "util";
import { CreateOrderDTO } from "./dto/createOrder.dto";
import { Order } from "./order.entity";

type OrderData = { marketplaceOrderId: string };
@Injectable()
export class OrderService {
    constructor(
        private readonly logger: CustomLogger = new CustomLogger(
            OrderService.name
        ),
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>
    ) {}

    async createOrder(createOrder: CreateOrderDTO): Promise<void> {
        // check if the order already exists in db using uniqueOrderId
        const alreadyExistingOrder: Order[] = await this.orderRepository.findBy(
            {
                marketplaceOrderId: createOrder.marketplaceOrderId
            }
        );

        if (alreadyExistingOrder.length > 0) {
            this.logger.log(
                `Order already exist, ${utils.inspect(alreadyExistingOrder)}`
            );
            return;
        }

        const orderObject: Order = this.orderRepository.create(createOrder);

        this.orderRepository
            .insert(orderObject)
            .then(res =>
                this.logger.log(
                    `Successfully saved ${utils.inspect(
                        res
                    )} into db  at ${moment().format("YYYY-MM-DD HH:mm")}`
                )
            )
            .catch(err =>
                this.logger.error(
                    `Faced error while saving the data into db ${utils.inspect(
                        err
                    )}`
                )
            );

        return;
    }

    async insertAll(createOrderArray: CreateOrderDTO[]): Promise<void> {
        this.orderRepository
            .createQueryBuilder("order")
            .select("order.market_place_order_id", "marketplaceOrderId")
            .where("order.market_place_order_id IN (:...ids)", {
                ids: createOrderArray.map(
                    ({ marketplaceOrderId }) => marketplaceOrderId
                )
            })
            .getRawMany()
            .then((data: OrderData[]) =>
                data.map(({ marketplaceOrderId }) => marketplaceOrderId)
            )
            .then((marketplaceOrderIds: string[]) =>
                createOrderArray.filter(
                    ({ marketplaceOrderId }) =>
                        !marketplaceOrderIds.includes(marketplaceOrderId)
                )
            )
            .then((filteredData: CreateOrderDTO[]) =>
                filteredData.map(d => this.orderRepository.create(d))
            )
            .then((filteredOrder: Order[]) =>
                this.orderRepository.save(filteredOrder)
            )
            .then((savedOrders: Order[]) =>
                this.logger.log(
                    `saved these records into the db, ${utils.inspect(
                        savedOrders,
                        { depth: 4, colors: true }
                    )} at${moment().format("YYYY-MM-DD HH:mm")}`
                )
            )
            .catch(err =>
                this.logger.error(
                    `Faced error while saving the records into Order table, ${utils.inspect(
                        err,
                        { depth: 4, colors: true }
                    )} ${moment().format("YYYY-MM-DD HH:mm")}`
                )
            );
    }
}
