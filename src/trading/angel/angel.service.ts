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
import AngelAPIResponse from "./dto/generic.response.dto";
import { AngelOrderStatusResponseDTO } from "./dto/orderStatus.response.dto";
import { StockInfoHistorical, StockInfoMarket } from "../../stock-data/entities/stock-data.entity";


@Injectable()
export default class AngelService implements TradingInterface {
    constructor(
        private readonly requestHandler: AngelRequestHandler,
        private readonly logger: CustomLogger = new CustomLogger(
            AngelService.name
        ),
        private readonly credentialService: CredentialService
    ) {}

    async placeOrder (
        orderDetail: OrderDetails,
        holding: HoldingInfoDTO,
        demat: DematAccount,
        current: StockInfoMarket,
        historical: StockInfoHistorical
    ): Promise<OrderResponseDTO> {
        const angelSymbolToken: AngelSymbolTokenDTO = await this.requestHandler.getAllAngelSymbolToken()
            .then( ( symbolTokens: AngelSymbolTokenDTO[] ) => symbolTokens.filter( ( { symbol } ) => symbol === holding.tradingsymbol )[ 0 ] );

        const orderResponse: OrderResponseDTO = await this.credentialService
            .findCredential( demat, AngelConstant.AUTH_TOKEN )
            .then( async ( authToken: Credential ) => {
                const orderRequest: AngelOrderRequestDTO =
                    new AngelOrderRequestDTO(
                        holding,
                        orderDetail,
                        angelSymbolToken,
                        current,
                        historical
                    );

                const {data: {uniqueorderid}} = await this.requestHandler.execute<AngelOrderResponseDTO>(
                    AngelConstant.ORDER_PLACE_ROUTE,
                    RequestMethod.POST,
                    orderRequest,
                    ApiType.order,
                    authToken.keyValue
                );

                const completeResponse = await this.requestHandler.execute<AngelOrderStatusResponseDTO>( AngelConstant.ORDER_BOOK_ROUTE + uniqueorderid, RequestMethod.GET, null, ApiType.order, authToken.keyValue );

                return mapToOrderResponseDTO(completeResponse, holding, orderDetail, demat);
            } );
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
            .then(({data: res}) => res.map(mapToHoldingDTO));
    }
}
