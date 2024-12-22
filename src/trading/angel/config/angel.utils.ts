import * as crypto from "crypto";
import { IntegratedBroker, OrderStatus } from "../../../common/globalConstants.constant";
import { OrderDetails } from "../../../common/strategies";
import { DematAccount } from "../../../entities/demat/entities/demat-account.entity";
import HoldingInfoDTO from "../../dtos/holding-info.dto";
import OrderResponseDTO from '../../dtos/order.response.dto';
import AngelAPIResponse from "../dto/generic.response.dto";
import AngelHoldingDTO from "../dto/holding.dto";
import { AngelOrderStatusResponseDTO } from "../dto/orderStatus.response.dto";
import { AngelConstant } from "./angel.constant";

export const mapToOrderResponseDTO = (
    response: AngelAPIResponse<AngelOrderStatusResponseDTO> = null,
    stock: HoldingInfoDTO,
    orderDetails: OrderDetails = null,
    demat: DematAccount,
    error: unknown = null
): OrderResponseDTO => {
    const orderResponse: OrderResponseDTO = new OrderResponseDTO();
    orderResponse.stockSymbol = stock.tradingsymbol;
    orderResponse.orderType = orderDetails.orderType;
    orderResponse.marketplaceOrderId = response.data.uniqueorderid;
    orderResponse.price = parseFloat(response.data.price);
    orderResponse.transactionType = orderDetails.transactionType;
    orderResponse.orderStatus = setOrderStatus(response.data.orderstatus);
    orderResponse.message = response.data.text || JSON.stringify(error);
    orderResponse.account = demat;
    orderResponse.quantity = parseInt(response.data.quantity);
    return orderResponse;
};

const setOrderStatus = (status: string): OrderStatus => {
    let statusVal: OrderStatus;
    switch (status) {
        case AngelConstant.ORDER_STATUS_REJECTED:
        case AngelConstant.ORDER_STATUS_CANCELLED:
            statusVal = OrderStatus.rejected;
            break;
        case AngelConstant.ORDER_STATUS_OPEN:
        case AngelConstant.ORDER_STATUS_MODIFIED:
            statusVal = OrderStatus.pending;
            break;
        case AngelConstant.ORDER_STATUS_COMPLETE:
            statusVal = OrderStatus.fulfilled;
            break;
        default:
            statusVal = OrderStatus.skipped;
            break;
    }

    return statusVal;
}

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

export const generateFakeAngelOrderResponse = (): AngelAPIResponse<AngelOrderStatusResponseDTO> => {
    const response: AngelAPIResponse<AngelOrderStatusResponseDTO> = new AngelAPIResponse<AngelOrderStatusResponseDTO>();
    response.data.uniqueorderid = crypto.randomBytes(16).toString('hex');
    response.data.price = '100.20';
    response.data.orderstatus = AngelConstant.ORDER_STATUS_CANCELLED;
    response.data.text = 'This is a fake order';
    response.data.quantity = '100';
    return response;
}