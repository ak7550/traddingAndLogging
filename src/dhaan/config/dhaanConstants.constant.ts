
export class DhaanConstants {
    public static ACCESS_TOKEN: string = "access-token";
    public static holdingDataRoute: string = "/holdings";
    public static historicalDataRoute: string = "/charts/historical";
    public static baseUrl: string = process.env.DHAAN_BASE_URL;
    public static clientId: string = process.env.DHAAN_CLIENT_ID;
    public static accessToken: string = process.env.DHAAN_ACCESS_TOKEN;
    public static brokerName: string = "dhaan";

    //todo: create an enum for the api type ==> trading api, non trading api, historical api
}

export enum ApiType {
    trading = 'trading',
    nonTrading = 'non-trading',
    historical = 'historical'
}