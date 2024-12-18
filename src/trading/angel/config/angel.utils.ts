
import { IntegratedBroker } from "../../../common/globalConstants.constant";
import { OrderDetails } from "../../../common/strategies";
import { DematAccount } from "../../../entities/demat/entities/demat-account.entity";
import HoldingInfoDTO from "../../dtos/holding-info.dto";
import OrderResponseDTO from '../../dtos/order.response.dto';
import AngelAPIResponse from "../dto/generic.response.dto";
import AngelHoldingDTO from "../dto/holding.dto";
import { AngelOrderStatusResponseDTO } from "../dto/orderStatus.response.dto";

export const mapToOrderResponseDTO = (
    response: AngelAPIResponse<AngelOrderStatusResponseDTO> = null,
    stock: HoldingInfoDTO,
    orderDetails: OrderDetails = null,
    demat: DematAccount,
    error: unknown = null
): OrderResponseDTO => {
    const orderResponse: OrderResponseDTO = new OrderResponseDTO();
    orderResponse.tradingSymbol = stock.tradingsymbol;
    orderResponse.orderType = orderDetails.orderType;
    orderResponse.orderId = response.data.uniqueorderid;
    orderResponse.price = response.data.price;
    orderResponse.transactionType = orderDetails.transactionType;
    orderResponse.broker = IntegratedBroker.Angel;
    orderResponse.status = response.data.orderstatus;
    orderResponse.reason = response.data.text;
    orderResponse.demat = demat;
    return orderResponse;
};

export const mapToHoldingDTO = ({ averageprice, tradingsymbol, quantity, close, exchange, isin, profitandloss, pnlpercentage, product, ltp }: AngelHoldingDTO): HoldingInfoDTO =>
    new HoldingInfoDTO({
        broker: IntegratedBroker.Angel,
        avgCostPrice: averageprice,
        closingPrice: close,
        exchange,
        isin,
        percentagePnl: pnlpercentage,
        pnl: profitandloss,
        totalQty: quantity,
        tradingsymbol,
        product, ltp
    });