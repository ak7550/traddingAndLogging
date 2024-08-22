
import GlobalConstant, { DurationType, ExchangeType, OrderType, OrderVariety, ProductType, TransactionType } from 'src/common/globalConstants.constant';
import AngelHoldingDTO from './holding.dto';
import { OrderDetails } from 'src/common/strategies';

//docs: https://smartapi.angelbroking.com/docs/Orders
//TODO: implement builder design pattern
export default class AngelOrderRequestDTO {
	mapData ( stock: AngelHoldingDTO, orderDetail: OrderDetails) {
		this.variety = orderDetail.variety;
		this.tradingsymbol = stock.tradingsymbol;
		this.symboltoken = stock.symboltoken;
		this.transactiontype = orderDetail.transactionType;
		this.exchange = stock.exchange;
		this.producttype = orderDetail.productType;
		this.ordertype = orderDetail.orderType;
		this.quantity = stock.quantity;
		this.duration = orderDetail.duration;
		this.ordertag = `${ this.ordertype === GlobalConstant.STOP_LOSS_MARKET && "SL-M" } is placed for ${ stock.tradingsymbol } at ${ new Date() }`;

		if ( this.ordertype == GlobalConstant.STOP_LOSS_MARKET ) {
			// i am making it as a sl-m, as the stock should exit at market price
			this.triggerprice = orderDetail?.triggerPrice.toFixed(2);
		}

		if(this.ordertype == GlobalConstant.LIMIT){
			// in case of limit orders, we will be needing LIMIT price
			this.price = orderDetail?.price.toFixed(2);
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

    // constructor ( v: string, ts: string, st: number, tt: string, ex: string, ot: string, pt: string, du: string, price: number, squareoff: number, stoploss: number, quantity: number ) {
    // 	this.variety = v;
    // 	this.tradingsymbol = ts;
    // 	this.symboltoken = st;
    // 	this.transactiontype = tt;
    // 	this.exchange = ex;
    // 	this.ordertype = ot;
    // 	this.producttype = pt;
    // 	this.duration = du;
    // 	this.price = price;
    // 	this.squareoff = squareoff;
    // 	this.stoploss = stoploss;
    // 	this.quantity = quantity;
	// }

    constructor() {}
}