
import GlobalConstant, { ExchangeType } from 'src/common/globalConstants.constant';
import AngelHoldingDTO from './holding.dto';


type AngelOrderVariety = "NORMAL" | "STOPLOSS";
type AngelTransactionType = "BUY" | "SELL";
type AngelOrderType = "MARKET" | "LIMIT" | "STOPLOSS_LIMIT" | "STOPLOSS_MARKET";
type AngelProductType = "DELIVERY" | "CARRYFOREARD";
type AngelDurationType = "DAY" | "IOC";

//docs: https://smartapi.angelbroking.com/docs/Orders
//todo: implement builder pattern
export default class AngelOrderRequestDTO {
	mapData ( stock: AngelHoldingDTO, slOrderValues: number[], variety: AngelOrderVariety, transaction: AngelTransactionType, orderType: AngelOrderType) {
		this.variety = variety;
		this.tradingsymbol = stock.tradingsymbol;
		this.symboltoken = stock.symboltoken;
		this.transactiontype = transaction;
		this.exchange = stock.exchange;
		this.producttype = "DELIVERY";
		this.ordertype = orderType;
		this.quantity = stock.quantity;
		this.duration = "DAY";
		this.ordertag = `${ this.ordertype === "STOPLOSS_MARKET" && "SLM" } is placed for ${ stock.tradingsymbol } at ${ new Date() }`;

		if ( this.ordertype == "STOPLOSS_MARKET" ) {
			// i am making it as a sl-m, as the stock should exit at market price
			this.triggerprice = slOrderValues[ 0 ].toFixed(2);
		}
	}

	variety: AngelOrderVariety;
    tradingsymbol: string;
    symboltoken: string;
	transactiontype: AngelTransactionType;
	exchange: ExchangeType;
    ordertype: AngelOrderType;
    producttype: AngelProductType;
	duration: AngelDurationType;
    price: string | undefined; // The min or max price to execute the order at (for LIMIT orders)
    triggerprice: string | undefined; // The price at which an order should be triggered (SL, SL-M)
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