import { Injectable, Logger, RequestMethod } from "@nestjs/common";
import { plainToClass } from "class-transformer";
import Strategy, { OrderDetails } from "../../common/strategies";
import { DematAccount } from "../../entities/demat/entities/demat-account.entity";
import HoldingInfoDTO from "../dtos/holding-info.dto";
import OrderResponseDTO from "../dtos/order.response.dto";
import TradingInterface from "../interfaces/trading.interface";
import { ApiType, DhaanConstants } from "./config/dhaan.constant";
import DhaanHoldingDTO from "./dto/holding.dto";
import DhaanRequestHandler from "./requestHandler.service";

@Injectable()
export default class DhaanService implements TradingInterface {
    private readonly logger: Logger = new Logger(DhaanService.name);

    constructor(private readonly requestHandler: DhaanRequestHandler) {}

    async placeStopLossOrders(
        demat: DematAccount,
        strategy: Strategy[]
    ): Promise<OrderResponseDTO[]> {
        return null;
    }

    async getHolding(demat: DematAccount): Promise<HoldingInfoDTO[]> {
        return null;
    }

    public async getAllHoldings(
        accessToken: string
    ): Promise<HoldingInfoDTO[]> {
        try {
            this.logger.log("Inside getAllHoldings method", DhaanService.name);

            const response: DhaanHoldingDTO[] =
                await this.requestHandler.execute<DhaanHoldingDTO[]>(
                    DhaanConstants.holdingDataRoute,
                    RequestMethod.GET,
                    null,
                    ApiType.nonTrading
                );

            const stockInfos: HoldingInfoDTO[] = response.map(
                (dhaanHoldingData: DhaanHoldingDTO): HoldingInfoDTO =>
                    plainToClass<HoldingInfoDTO, DhaanHoldingDTO>(
                        HoldingInfoDTO,
                        dhaanHoldingData,
                        { excludeExtraneousValues: true }
                    )
            );

            this.logger.log("converted into stockInfo: ", stockInfos);
            this.logger.log(
                "trying to convert a single one: ",
                plainToClass(HoldingInfoDTO, response[0])
            );

            return stockInfos;
        } catch (error) {
            this.logger.error(
                "Error occured while fetching the holdings data using Dhaan apis",
                error,
                DhaanService.name
            );
        }
        return null;
    }

    public async placeOrder(
        orderDetail: OrderDetails,
        holding: HoldingInfoDTO,
        demat: DematAccount
    ): Promise<OrderResponseDTO> {
        return null;
    }
}
