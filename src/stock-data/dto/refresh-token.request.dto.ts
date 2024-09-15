import GlobalConstant from "../../common/globalConstants.constant";
import * as crypto from "crypto";


export class RefreshTokenRequestDTO {
    grant_type: string;
    appIdHash: string;
    refresh_token: string;
    pin: string;

    constructor (rToken: string, pin: string, appId: string, appSecret: string) {
        this.grant_type = GlobalConstant.REFRESH_TOKEN;
        this.refresh_token = rToken;
        this.pin = pin;
        this.appIdHash =  crypto.createHash('sha256').update(`${appId}:${appSecret}`).digest('hex');
    }
}