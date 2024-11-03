import { Injectable, RequestMethod } from "@nestjs/common";
import { OrderDetails } from "../../common/strategies";
import { CredentialService } from "../../entities/credential/credential.service";
import { DematAccount } from "../../entities/demat/entities/demat-account.entity";
import HoldingInfoDTO from "../dtos/holding-info.dto";
import OrderResponseDTO from '../dtos/order.response.dto';
import TradingInterface from "../interfaces/trading.interface";
import { AngelConstant, ApiType } from "./config/angel.constant";
import { mapToHoldingDTO, mapToOrderResponseDTO } from "./config/angel.utils";
import AngelHoldingDTO from "./dto/holding.dto";
import AngelOrderRequestDTO from './dto/order.request.dto';
import AngelOrderResponseDTO from "./dto/order.response.dto";
import AngelRequestHandler from "./request-handler.service";
import { CustomLogger } from "../../custom-logger.service";
import AngelSymbolTokenDTO from "./dto/symboltoken.response.dto";
import { Credential } from "../../entities/credential/credential.entity";

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
        const angelSymbolToken: AngelSymbolTokenDTO = await this.requestHandler.getAllAngelSymbolToken()
            .then( ( symbolTokens: AngelSymbolTokenDTO[] ) => symbolTokens.filter( ( { symbol } ) => symbol === holding.tradingsymbol )[ 0 ] );
        const orderResponse: OrderResponseDTO = await this.credentialService
            .findCredential( demat, AngelConstant.AUTH_TOKEN )
            .then( (authToken: Credential) => {
                const orderRequest: AngelOrderRequestDTO = new AngelOrderRequestDTO( holding, orderDetail, angelSymbolToken );
                return this.requestHandler.execute<AngelOrderResponseDTO>(AngelConstant.ORDER_PLACE_ROUTE, RequestMethod.POST, orderRequest, ApiType.order, authToken.keyValue)
            } )
            .then( ( response: AngelOrderResponseDTO ) => {
                this.logger.verbose(`receive a successful response stoploss order of ${holding.tradingsymbol}`);

                //code to response into universal order-dto
                //TODO: talk with angel, there must be an api to find a status of an individual order
                // using that response, we will be able to map a lot of data
                return mapToOrderResponseDTO(response,holding);
            });

        //TODO: think of sending this order response to audit
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
