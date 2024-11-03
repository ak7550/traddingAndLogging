
import { isFunction } from 'rxjs/internal/util/isFunction';
import GlobalConstant, { DurationType, ExchangeType, OrderType, OrderVariety, ProductType, TransactionType } from '../../../common/globalConstants.constant';
import HoldingInfoDTO from 'src/trading/dtos/holding-info.dto';
import { OrderDetails } from '../../../common/strategies';
import AngelSymbolTokenDTO from './symboltoken.response.dto';

//docs: https://smartapi.angelbroking.com/docs/Orders
//TODO: implement builder design pattern
export default class AngelOrderRequestDTO {

	//TODO: FIX THIS
	constructor ( stock: HoldingInfoDTO, orderDetail: OrderDetails, symbolToken: AngelSymbolTokenDTO) {
		this.variety = orderDetail.variety;
		this.tradingsymbol = stock.tradingsymbol;
		// this.symboltoken = stock.symboltoken;
		this.symboltoken = ''; //TODO
		this.transactiontype = orderDetail.transactionType;
		this.exchange = stock.exchange;
		this.producttype = orderDetail.productType;
		this.ordertype = orderDetail.orderType;
		this.duration = orderDetail.duration;
		this.ordertag = `${ this.ordertype === GlobalConstant.STOP_LOSS_MARKET && "SL-M" } is placed for ${ stock.tradingsymbol } at ${ new Date() }`;
		this.quantity = isFunction(orderDetail.quantity) ? orderDetail.quantity(stock.totalQty) : orderDetail.quantity;

		if ( this.ordertype == GlobalConstant.STOP_LOSS_MARKET ) {
			// i am making it as a sl-m, as the stock should exit at market price
			this.triggerprice = '0'; //TODO
		}

		if(this.ordertype == GlobalConstant.LIMIT){
			// in case of limit orders, we will be needing LIMIT price
			this.price = '0'; //TODO
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
}