export class AngelConstant {
    public static readonly brokerName: string = "angel";
    public static readonly ACCESS_TOKEN: string = "Authorization";
    public static readonly X_USER_TYPE: string = "X-UserType";
    public static readonly USER: string = "USER";
    public static readonly X_SOURCE_ID: string = "X-SourceID";
    public static readonly WEB: string = "WEB";
    public static readonly X_CLIENT_LOCAL_IP: string = "X-ClientLocalIP";
    public static readonly X_CLIENT_PUBLIC_IP: string = "X-ClientPublicIP";
    public static readonly X_MACAddress: string = "X-MACAddress";
    public static readonly X_PRIVATE_KEY: string = "X-PrivateKey";
    public static readonly ONE_DAY_INTERVAL: string = "ONE_DAY";

    public static readonly HOLDING_ROUTE: string = "/portfolio/v1/getHolding";
    public static readonly HISTORICAL_DATA_ROUTE: string = "/historical/v1/getCandleData";
    public static readonly ORDER_PLACE_ROUTE: string = "/order/v1/placeOrder";
}

export enum ApiType {
    order = 'order',
    gtt = 'gtt',
    historical = 'historical',
    others = 'others'
}