export class DhaanConstants {
    public static readonly ACCESS_TOKEN: string = "access-token";
    public static readonly holdingDataRoute: string = "/holdings";
    public static readonly historicalDataRoute: string = "/charts/historical";
    public static readonly baseUrl: string = process.env.DHAAN_BASE_URL;
    public static readonly clientId: string = process.env.DHAAN_CLIENT_ID;
    public static readonly accessToken: string = process.env.DHAAN_ACCESS_TOKEN;
    public static readonly brokerName: string = "dhaan";
}

export enum ApiType {
    trading = 'trading',
    nonTrading = 'non-trading',
    historical = 'historical'
}