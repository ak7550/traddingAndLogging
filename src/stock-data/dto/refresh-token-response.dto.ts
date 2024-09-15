import { FyersApiResponseDTO } from "./fyers-api-response.dto";

export class RefreshTokenResponseDTO extends FyersApiResponseDTO<string> {
    access_token: string;
    // REFRESH_TOKEN WILL REMAIN THE SAME FOR NEXT 15 DAYS
}