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

    public static HOLDING_ROUTE: string = "/portfolio/v1/getHolding";
}

export enum ApiType {
    order = 'order',
    gtt = 'gtt',
    historical = 'historical',
    others = 'others'
}