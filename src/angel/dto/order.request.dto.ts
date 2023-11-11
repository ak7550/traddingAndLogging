import { ValidateIf } from 'class-validator';
export default class AngelOrderRequestDTO {
	variety: string;
	tradingsymbol: string;
	symboltoken: number;
	transactiontype: string;
	exchange: string;
	ordertype: string;
	producttype: string;
	duration: string;
	price: number;
	squareoff: number;
	stoploss: number;
	quantity: number;

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

	constructor () {

	}
}