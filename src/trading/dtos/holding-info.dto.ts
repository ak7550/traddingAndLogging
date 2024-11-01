import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { Min } from "class-validator";
import StockInfoDTO from "./stock-info.dto";
import { ExchangeType, IntegratedBroker } from "../../common/globalConstants.constant";


/**
 * docs: [class-validator, class-transformer stackoverflow](https://stackoverflow.com/questions/69084933/nestjs-dto-class-set-class-validator-and-class-transformer-execution-order)
 */
export default class HoldingInfoDTO extends StockInfoDTO{
    constructor(partial: Partial<HoldingInfoDTO>) {
        super();
        Object.assign(this, partial); //todo: this things need to be test throughly
    }

    @ApiProperty({
        name: 'brokerName',
        enum: IntegratedBroker
    })
    broker: IntegratedBroker

    @ApiProperty({
        type: Number,
    })
    securityId!: number;

    @ApiProperty({
        type: Number,
    })
    @Min(1, {
        message: "total quantity of any holding stock cannot be less than 1",
    })
    @Expose()
    totalQty!: number;

    @ApiProperty({
        type: Number,
    })
    @Min(1, {
        message:
            "total average price of any holding stock cannot be less than 1",
    })
    @Expose()
    avgCostPrice!: number;

    @ApiProperty({
        type: Number,
    })
    @Exclude() // this property lets the DTO know that what are the fields that should be exposed to its viewers
    pnl!: number;

    @ApiProperty({
        type: Number,
    })

    @Expose() // as it is not being mapped, so the undefined value wont be visible
    percentagePnl!: number;

    @ApiProperty({
        type: String,
    })
    exchange: ExchangeType;
}
// what I am getting is exact dhaanr response, but this stockInfo should be independant of all the broker

//TODO: 2 fields I need to add, timestamp of last time bought and timestamp of last time sold