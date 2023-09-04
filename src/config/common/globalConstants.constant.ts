export const APPLICATION_JSON: string = "application/json";
export const GET = "get";
export const POST = "post";
export const dhaanHistoricalDataRoute = "/charts/historical";
export const dhaanOrderRoute = "/orders";
export const dhaanDateFormat = "YYYY-MM-DD";
export const NSE_EQ = "NSE_EQ";
export const dhaanExchangeSegment = "exchangeSegment";
export const instrument = "instrument";
export const equity = "EQUITY";
export const expiryCode = "expiryCode";

export const transactionType = "transactionType";
export const sell = "SELL";
export const productType = "productType";
export const cnc = "CNC";
export const orderType = "orderType";
export const stopLoss = "STOP_LOSS";
export const validity = "validity";
export const day = "DAY";
export const afterMarketOrder = "afterMarketOrder";

function rateLimit(arg0: any, arg1: { maxRequests: number }) {
    throw new Error("Function not implemented.");
}
