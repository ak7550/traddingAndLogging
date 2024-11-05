export default class GlobalConstant {
    public static readonly APPLICATION_JSON: string = "application/json";
    public static readonly CONTENT_TYPE: string = "Content-Type";
    public static readonly GET = "get";
    public static readonly POST = "post";
    public static readonly Authorization: string = "Authorization";
    public static readonly ACCESS_TOKEN: string = "access_token";
    public static readonly dhaanHistoricalDataRoute = "/charts/historical";
    public static readonly dhaanOrderRoute = "/orders";
    public static readonly dateFormat = "YYYY-MM-DD";
    public static readonly NSE_EQ = "NSE_EQ";
    public static readonly dhaanExchangeSegment = "exchangeSegment";
    public static readonly instrument = "instrument";
    public static readonly equity = "EQUITY";
    public static readonly expiryCode = "expiryCode";

    public static readonly BROKER = "broker";
    public static readonly transactionType = "transactionType";
    public static readonly SELL = "SELL";
    public static readonly BUY = "BUY";
    public static readonly productType = "productType";
    public static readonly CNC = "CNC";
    public static readonly orderType = "orderType";
    public static readonly STOP_LOSS = "STOPLOSS";
    public static readonly STOP_LOSS_MARKET = "STOPLOSS_MARKET";
    public static readonly NORMAL = "NORMAL";
    public static readonly LIMIT = "LIMIT";
    public static readonly validity = "validity";
    public static readonly DAY = "DAY";
    public static readonly IOC = "IOC";
    public static readonly afterMarketOrder = "afterMarketOrder";
    public static readonly FULFILLED = "fulfilled";
    public static readonly REJECTED = "rejected";
    public static readonly REFRESH_TOKEN = "refresh_token";
}

export enum ExchangeType { "NSE" , "BSE" , "NFO" , "MCX" , "BFO" , "CDS"} ;
export enum OrderVariety { "NORMAL", "STOPLOSS", "AMO", "ROBO" };
export enum TransactionType { "BUY", "SELL" };
export enum OrderType { "MARKET", "LIMIT", "STOPLOSS_LIMIT", "STOPLOSS_MARKET" };
export enum ProductType  { "DELIVERY", "CARRYFOREARD", "MARGIN", "INTRADAY", "BO" } ;
export enum DurationType { "DAY", "IOC" } ;
export enum InstrumentType {
    "OPTSTK", "OPTIDX", ""
};

//this will be considered as the single source of truth for all the integrated brokers
export enum IntegratedBroker {
    Angel = "angel",
    Dhaan = "dhaan",
    Fyers = "fyers"
}
