import { Injectable, RequestMethod } from "@nestjs/common";
import { OrderDetails } from "../../common/strategies";
import { CredentialService } from "../../entities/credential/credential.service";
import { DematAccount } from "../../entities/demat/entities/demat-account.entity";
import HoldingInfoDTO from "../dtos/holding-info.dto";
import OrderResponseDTO from "../dtos/order.response.dto";
import TradingInterface from "../interfaces/trading.interface";
import { AngelConstant, ApiType } from "./config/angel.constant";
import { mapToHoldingDTO, mapToOrderResponseDTO } from "./config/angel.utils";
import AngelHoldingDTO from "./dto/holding.dto";
import AngelOrderRequestDTO from "./dto/order.request.dto";
import AngelOrderResponseDTO from "./dto/order.response.dto";
import AngelRequestHandler from "./request-handler.service";
import { CustomLogger } from "../../custom-logger.service";

@Injectable()
export default class AngelService implements TradingInterface {
    constructor(
        private readonly requestHandler: AngelRequestHandler,
        private readonly logger: CustomLogger = new CustomLogger(
            AngelService.name
        ),
        private readonly credentialService: CredentialService
    ) {}

    async placeOrder(
        orderDetail: OrderDetails,
        holding: HoldingInfoDTO,
        demat: DematAccount
    ): Promise<OrderResponseDTO> {
        throw new Error("Method not implemented.");
    }

    /**
     * it checks if there's any existing sell order present for this particular stock,
     *  if it's present then it modifies the existing order or else it creates the same.
     * docs: [Angel api docs for orders](https://smartapi.angelbroking.com/docs/Orders)
     * @param _stock it holds the stock holding details of any stock which is curently present in Angel trading account
     * @param _slOrderValues an array consisting the value of stopLoss and trigger prices
     */
    private async placeStopLossOrder(
        _stock: HoldingInfoDTO,
        orderDetail: OrderDetails
    ): Promise<OrderResponseDTO> {
        let orderResponse: OrderResponseDTO = null;
        try {
            this.logger.log(
                `Inside ${AngelService.name}: ${this.placeStopLossOrder.name} method`
            );
            const orderRequestDTO: AngelOrderRequestDTO =
                new AngelOrderRequestDTO();
            orderRequestDTO.mapData(_stock, orderDetail);

            const response: AngelOrderResponseDTO =
                await this.requestHandler.execute(
                    AngelConstant.ORDER_PLACE_ROUTE,
                    RequestMethod.POST,
                    orderRequestDTO,
                    ApiType.order
                );

            this.logger.log(
                `receive a successful response stoploss order of ${_stock.tradingsymbol}`
            );

            //code to response into universal order-dto
            //TODO: talk with angel, there must be an api to find a status of an individual order
            // using that response, we will be able to map a lot of data
            orderResponse = mapToOrderResponseDTO(
                response,
                _stock,
                orderRequestDTO
            );
        } catch (error: unknown) {
            this.logger.error(
                `encountered an error, while creating the stoploss order of ${_stock.tradingsymbol}, ${error}`
            );
            orderResponse = mapToOrderResponseDTO(null, _stock, null, error);
        }
        return orderResponse;
    }

    async getHolding(demat: DematAccount): Promise<HoldingInfoDTO[]> {
        return await this.credentialService
            .findCredential(demat, AngelConstant.AUTH_TOKEN)
            .then(authToken =>
                this.requestHandler.execute<AngelHoldingDTO[]>(
                    AngelConstant.HOLDING_ROUTE,
                    RequestMethod.GET,
                    null,
                    ApiType.others,
                    authToken.keyValue
                )
            )
            .then((res: AngelHoldingDTO[]) => res.map(mapToHoldingDTO));
    }
}
