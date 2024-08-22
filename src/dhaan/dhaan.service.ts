import { Injectable, Logger, RequestMethod } from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { getTrailingStopLoss } from "src/common/globalUtility.utility";
import StockInfoDTO from "src/trading/dtos/stock-info.dto";
import TradingInterface from "src/trading/interfaces/trading.interface";
import { ApiType, DhaanConstants } from "./config/dhaan.constant";
import DhaanHoldingDTO from "./dto/holding.dto";
import OhlcDTO from "./dto/ohlc.dto";
import DhaanRequestHandler from "./requestHandler.service";
import OrderResponseDTO from "src/trading/dtos/order.response.dto";

@Injectable()
export default class DhaanService implements TradingInterface {
    private readonly logger: Logger = new Logger(DhaanService.name);

    constructor(private readonly requestHandler: DhaanRequestHandler) {}

    async placeOrders(accessToken: string): Promise<any> {
        throw new Error("Method not implemented.");
    }

    //TODO
    /**
     * It checks the buying and current price of a particular stock, and figures out what should be the stoploss value for it, accordingly it places stoploss orders.
     * @returns
     */
    async placeStopLossOrders(
        accessToken: string
    ): Promise<OrderResponseDTO[]> {
        try {
            const stockInfos: StockInfoDTO[] =
                await this.getAllHoldings(accessToken);

            //TODO
            const orderResponses: Promise<any>[] = stockInfos.map(
                async (stockInfo: StockInfoDTO): Promise<any> => {
                    const response: OhlcDTO =
                        await this.requestHandler.execute<OhlcDTO>(
                            DhaanConstants.historicalDataRoute,
                            RequestMethod.POST,
                            null, //TODO
                            ApiType.historical
                        );

                    // TODO: needs to work a lot in these integrations
                    const [price, triggerPrice]: number[] = getTrailingStopLoss(
                        stockInfo.closingPrice,
                        stockInfo.avgCostPrice
                    );

                    return await this.placeStopLossOrder(); //TODO ==> put trailing stop loss for dhaan, using axios http requestHandler
                }
            );
        } catch (error) {
            this.logger.error(
                "Error occured while fetching the holdings data using Dhaan apis",
                error
            );
        }
        return null;
    }

    //TODO
    private async placeStopLossOrder() {
        return await null;
    }

    public async getAllHoldings(accessToken: string): Promise<StockInfoDTO[]> {
        try {
            this.logger.log("Inside getAllHoldings method", DhaanService.name);

            const response: DhaanHoldingDTO[] =
                await this.requestHandler.execute<DhaanHoldingDTO[]>(
                    DhaanConstants.holdingDataRoute,
                    RequestMethod.GET,
                    null,
                    ApiType.nonTrading
                );

            const stockInfos: StockInfoDTO[] = response.map(
                (dhaanHoldingData: DhaanHoldingDTO): StockInfoDTO =>
                    plainToClass<StockInfoDTO, DhaanHoldingDTO>(
                        StockInfoDTO,
                        dhaanHoldingData,
                        { excludeExtraneousValues: true }
                    )
            );

            this.logger.log("converted into stockInfo: ", stockInfos);
            this.logger.log(
                "trying to convert a single one: ",
                plainToClass(StockInfoDTO, response[0])
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
}
