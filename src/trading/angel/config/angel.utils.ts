import { IntegratedBroker } from "src/common/globalConstants.constant";
import HoldingInfoDTO from "src/trading/dtos/holding-info.dto";
import OrderResponseDTO from "src/trading/dtos/order.response.dto";
import AngelHoldingDTO from "../dto/holding.dto";
import AngelOrderRequestDTO from "../dto/order.request.dto";
import AngelOrderResponseDTO from "../dto/order.response.dto";

//TODO
//docs: https://snyk.io/advisor/npm-package/class-transformer/functions/class-transformer.plainToClass
//docs: https://medium.com/js-dojo/flexible-entities-with-class-transformer-7f4f0fc43289
export const mapToOrderResponseDTO = (
    response: AngelOrderResponseDTO = null,
    stock: HoldingInfoDTO,
    orderRequestDTO: AngelOrderRequestDTO = null,
    error: unknown = null
): OrderResponseDTO => {
    return null;
};

export const mapToHoldingDTO = ({ averageprice, tradingsymbol, quantity, close, exchange, isin, profitandloss, pnlpercentage }: AngelHoldingDTO): HoldingInfoDTO =>
    new HoldingInfoDTO({
        broker: IntegratedBroker.Angel,
        avgCostPrice: averageprice,
        closingPrice: close,
        exchange,
        isin,
        percentagePnl: pnlpercentage,
        pnl: profitandloss,
        totalQty: quantity,
        tradingsymbol
    });