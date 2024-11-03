export enum ApiType {
    historical = "historical",
}

export type Resolution = "5S" | "10S" | "15S" | "30S" | "45S" | "1" | "2" | "3" | "5" | "10" | "15" | "20" | "30" | "60" | "120" | "240" | "1D";

export const FYERS_REFRESH_TOKEN_URL = `https://api-t1.fyers.in/api/v3/validate-refresh-token`;
export const FYERS_HISTORICAL_ROUTE = `https://api-t1.fyers.in/data/history`;