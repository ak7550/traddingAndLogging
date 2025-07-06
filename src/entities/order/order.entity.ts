import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { DematAccount } from "../demat/entities/demat-account.entity";
import moment from "moment-timezone";
import AbstractEntity from "../../database/abstract.entity";
import { ExchangeType, OrderStatus, OrderType, TransactionType } from "../../common/globalConstants.constant";

@Entity({
    name: "order",
})
export class Order extends AbstractEntity<Order> {
    @Column({
        type: "enum",
        enum: OrderStatus,
        default: OrderStatus.PENDING,
        name: 'order_status'
    })
    orderStatus: OrderStatus;

    @Column({ type: Date, default: null, name: 'order_placed_on' })
    orderPlacedOn: Date;

    @Column({ type: Date, default: null, name: 'last_modified_on' })
    lastModifiedOn: Date;

    @Column({
        length: 600,
        type: "varchar",
    })
    message: string;

    @Column({
        length: 25,
        type: "varchar",
        name: 'stock_symbol'
    })
    stockSymbol: string;

    @Column({
        type: 'enum',
        enum: ExchangeType
    })
    exchange: ExchangeType;

    @Column({
        type: 'enum',
        enum: TransactionType,
        name: 'transaction_type'
    })
    transactionType: TransactionType;

    @Column({
        type: 'enum',
        enum: OrderType,
        name: 'order_type'
    })
    orderType: OrderType;

    @Column({
        type: 'int'
    })
    quantity: number;

    @Column("float")
    price: number;

    @Column("float", { name: "trigger_price", default: 0 })
    triggerPrice: number

    @Column({ name: 'market_place_order_id' ,type: "varchar", length: 255})
    marketplaceOrderId: string;

    @ManyToOne(() => DematAccount, demat => demat.id)
    @JoinColumn({
        name: "account_id",
    })
    account: DematAccount;

    @BeforeInsert()
    setOrderPlacedOn() {
        this.orderPlacedOn = moment().toDate();
    }

    @BeforeUpdate()
    setLastModifiedOn() {
        this.lastModifiedOn = moment().toDate();
    }

    @Column({name: 'strategy_name',type: "varchar", length: 255})
    strategyName: string;
}