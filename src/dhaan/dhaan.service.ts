import { Injectable, Logger, RequestMethod } from "@nestjs/common";
import { StockInfoDTO } from "src/trading/dtos/stock-info.dto";
import { TradingInterface } from "src/trading/interfaces/trading.interface";
import { DhaanConstants, ApiType } from "./config/dhaanConstants.constant";
import { DhaanHoldingDTO } from "./dto/holding.dto";
import { plainToClass } from "class-transformer";
import DhaanRequestHandler from "./requestHandler.service";
import OrderInfoDTO from "src/trading/dtos/order-info.dto";
import OhlcDTO from "./dto/ohlc.dto";
import { getTrailingStopLoss } from "src/common/globalUtility.utility";
import { DhanEnv, DhanHqClient, OrderResponse } from "dhanhq";

@Injectable()
export class DhaanService implements TradingInterface {
    private readonly logger: Logger = new Logger(DhaanService.name);
    private readonly client: DhanHqClient = new DhanHqClient({
        accessToken: process.env.DHAAN_ACCESS_TOKEN,
        env: DhanEnv.PROD,
    });

    constructor(private readonly requestHandler: DhaanRequestHandler) { }

    placeOrders(): Promise<any> {
        throw new Error("Method not implemented.");
    }

    //todo
    /**
     * It checks the buying and current price of a particular stock, and figures out what should be the stoploss value for it, accordingly it places stoploss orders.
     * @returns
     */
    async placeStopLossOrders(): Promise<OrderInfoDTO[]> {
        try {
            const stockInfos: StockInfoDTO[] = await this.getAllHoldings();

            const orderResponses: Promise<OrderResponse>[] = stockInfos.map(
                async (stockInfo: StockInfoDTO): Promise<any> => {
                    const response: OhlcDTO =
                        await this.requestHandler.execute<OhlcDTO>(
                            DhaanConstants.historicalDataRoute,
                            RequestMethod.POST,
                            null, //todo
                            ApiType.historical,
                        );

                    const [price, triggerPrice]: string[] = getTrailingStopLoss(
                        response.close[response.close.length - 1],
                        stockInfo.avgCostPrice,
                    );

                    return await null; //todo ==> put trailing stop loss for dhaan, using axios http requestHandler
                },
            );

        } catch (error) {
            this.logger.error(
                "Error occured while fetching the holdings data using Dhaan apis",
                error,
            );
        }
        return null;
    }

    public async getAllHoldings(): Promise<StockInfoDTO[]> {
        try {
            this.logger.log("Inside getAllHoldings method", DhaanService.name);

            const response: DhaanHoldingDTO[] =
                await this.requestHandler.execute<DhaanHoldingDTO[]>(
                    DhaanConstants.holdingDataRoute,
                    RequestMethod.GET,
                    null,
                    ApiType.nonTrading,
                );

            const stockInfos: StockInfoDTO[] = response.map(
                (dhaanHoldingData: DhaanHoldingDTO): StockInfoDTO =>
                    plainToClass<StockInfoDTO, DhaanHoldingDTO>(
                        StockInfoDTO,
                        dhaanHoldingData,
                        { excludeExtraneousValues: true },
                    ),
            );

            this.logger.log("converted into stockInfo: ", stockInfos);
            this.logger.log(
                "trying to convert a single one: ",
                plainToClass(StockInfoDTO, response[0]),
            );

            return stockInfos;
        } catch (error) {
            this.logger.error(
                "Error occured while fetching the holdings data using Dhaan apis",
                error,
                DhaanService.name,
            );
        }
        return null;
    }
}
