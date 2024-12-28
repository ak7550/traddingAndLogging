
import {
    DurationType,
    ExchangeType,
    OrderType,
    OrderVariety,
    ProductType,
    TransactionType
} from "../../../common/globalConstants.constant";
import { OrderDetails } from "../../../common/strategies";
import { StockInfoHistorical, StockInfoMarket } from "../../../stock-data/entities/stock-data.entity";
import HoldingInfoDTO from "../../dtos/holding-info.dto";
import AngelSymbolTokenDTO from "./symboltoken.response.dto";
import moment from "moment-timezone";


//docs: https://smartapi.angelbroking.com/docs/Orders
//TODO: implement builder design pattern
export default class AngelOrderRequestDTO {
    constructor(
        stock: HoldingInfoDTO,
        orderDetail: OrderDetails,
        { token }: AngelSymbolTokenDTO,
        current: StockInfoMarket,
        historical: StockInfoHistorical
    ) {
        this.variety = orderDetail.variety;
        this.tradingsymbol = stock.tradingsymbol;
        this.symboltoken = token;
        this.transactiontype = orderDetail.transactionType;
        this.exchange = stock.exchange;
        this.producttype = orderDetail.productType;
        this.ordertype = orderDetail.orderType;
        this.duration = orderDetail.duration;
        this.ordertag = `${
            this.ordertype === OrderType.STOPLOSS_MARKET && "SL-M"
        } is placed for
			 ${stock.tradingsymbol} at ${moment().format("YYYY-MM-DD HH:mm")}`;

        this.quantity = orderDetail.quantity(stock.totalQty);

        if (
            this.ordertype == OrderType.STOPLOSS_MARKET ||
            this.ordertype === OrderType.STOPLOSS_LIMIT
        ) {
            // i am making it as a sl-m, as the stock should exit at market price
            this.triggerprice = orderDetail
                .decidingFactor({
                   holdingDetails: stock,
                   current,
                   historical
                })
                .triggerPrice.toFixed(2);
        }

        if (this.ordertype == OrderType.LIMIT) {
            // in case of limit orders, we will be needing LIMIT price
            this.price = orderDetail.decidingFactor({
                holdingDetails: stock,
                current,
                historical
            }).price.toFixed(2);
        }
    }

    variety: OrderVariety;
    tradingsymbol: string;
    symboltoken: string;
    transactiontype: TransactionType;
    exchange: ExchangeType;
    ordertype: OrderType;
    producttype: ProductType;
    duration: DurationType;
    price?: string; // The min or max price to execute the order at (for LIMIT orders)
    triggerprice?: string; // The price at which an order should be triggered (SL, SL-M)
    // stoploss: number;
    quantity: number;
    ordertag: string;
    squareoff?: string;
    stoploss?: string;
    trailingStopLoss?: string;
    disclosedquantity?: string;
}
