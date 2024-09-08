export default class GlobalConstant {
    public static readonly APPLICATION_JSON: string = "application/json";
    public static readonly CONTENT_TYPE: string = "Content-Type";
    public static readonly GET = "get";
    public static readonly POST = "post";
    public static readonly dhaanHistoricalDataRoute = "/charts/historical";
    public static readonly dhaanOrderRoute = "/orders";
    public static readonly dhaanDateFormat = "YYYY-MM-DD";
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
    public static readonly EXPIRES_AT: string = "expiresAt";
}

export type ExchangeType = "NSE" | "BSE" | "NFO";
export type OrderVariety = "NORMAL" | "STOPLOSS";
export type TransactionType = "BUY" | "SELL";
export type OrderType = "MARKET" | "LIMIT" | "STOPLOSS_LIMIT" | "STOPLOSS_MARKET";
export type ProductType = "DELIVERY" | "CARRYFOREARD";
export type DurationType = "DAY" | "IOC";

//this will be considered as the single source of truth for all the integrated brokers
export enum IntegratedBroker {
    Angel = "angel",
    Dhaan = "dhaan",
}
