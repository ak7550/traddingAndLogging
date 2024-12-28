import { IntegratedBroker } from "../../../common/globalConstants.constant";

export class AngelConstant {
    public static readonly brokerName: string = IntegratedBroker.Angel;
    public static readonly X_USER_TYPE: string = "X-UserType";
    public static readonly USER: string = "USER";
    public static readonly X_SOURCE_ID: string = "X-SourceID";
    public static readonly WEB: string = "WEB";
    public static readonly X_CLIENT_LOCAL_IP: string = "X-ClientLocalIP";
    public static readonly X_CLIENT_PUBLIC_IP: string = "X-ClientPublicIP";
    public static readonly X_MACAddress: string = "X-MACAddress";
    public static readonly X_PRIVATE_KEY: string = "X-PrivateKey";
    public static readonly ONE_DAY_INTERVAL: string = "ONE_DAY";
    public static readonly AUTH_TOKEN: string = "auth_token";
    public static readonly FEED_TOKEN: string = "feed_token";

    public static readonly HOLDING_ROUTE: string = "/portfolio/v1/getHolding";
    public static readonly HISTORICAL_DATA_ROUTE: string = "/historical/v1/getCandleData";
    public static readonly ORDER_PLACE_ROUTE: string = "/order/v1/placeOrder";
    public static readonly GENERATE_TOKEN_ROUTE: string = "/auth/angelbroking/jwt/v1/generateTokens";
    public static readonly ORDER_BOOK_ROUTE: string = "/order/v1/details/";
    public static readonly ANGEL_SYMBOL_TOKEN_URL: string = "https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json";
    public static readonly ANGEL_REFRESH_TOKEN_URL: string = "https://apiconnect.angelbroking.com/rest/auth/angelbroking/jwt/v1/generateTokens";
    public static readonly ANGEL_BASE_URL: string = "https://apiconnect.angelbroking.com/rest/secure/angelbroking";
    public static readonly ORDER_STATUS_REJECTED: string = 'rejected';
    public static readonly ORDER_STATUS_CANCELLED: string = 'cancelled';
    public static readonly ORDER_STATUS_OPEN: string = 'open';
    public static readonly ORDER_STATUS_COMPLETE: string = 'complete';
    public static readonly ORDER_STATUS_MODIFIED: string = 'modified';
    public static readonly ORDER_STATUS_OPEN_PENDING: string = 'open pending';
    public static readonly ORDER_STATUS_MODIFY_PENDING: string = 'modify pending';
    public static readonly ORDER_STATUS_TRIGGER_PENDING: string = 'trigger pending';
}

export enum ApiType {
    order = "order",
    gtt = "gtt",
    historical = "historical",
    others = "others"
}
