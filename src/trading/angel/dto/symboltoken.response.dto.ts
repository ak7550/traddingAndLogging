import GlobalConstant, { ExchangeType, InstrumentType } from "../../../common/globalConstants.constant";

export default class AngelSymbolTokenDTO {
    token: string;
    symbol: string;
    name: string;
    expiry: string;
    lotsize: string;
    strike?: string;
    instrumenttype: InstrumentType;
    exch_seg: ExchangeType;
    tick_size: string;
}