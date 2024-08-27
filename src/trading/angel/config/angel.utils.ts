import OrderResponseDTO from "src/trading/dtos/order.response.dto";
import AngelHoldingDTO from "../dto/holding.dto";
import AngelOrderResponseDTO from "../dto/order.response.dto";
import AngelOrderRequestDTO from "../dto/order.request.dto";

//TODO
//docs: https://snyk.io/advisor/npm-package/class-transformer/functions/class-transformer.plainToClass
//docs: https://medium.com/js-dojo/flexible-entities-with-class-transformer-7f4f0fc43289
export const mapToOrderResponseDTO = (
    response: AngelOrderResponseDTO = null,
    stock: AngelHoldingDTO,
    orderRequestDTO: AngelOrderRequestDTO= null,
    error: unknown = null
): OrderResponseDTO => {
    return null;
};