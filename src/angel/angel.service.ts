import { Injectable, Logger, RequestMethod } from "@nestjs/common";
import { getTrailingStopLoss } from "src/common/globalUtility.utility";
import OrderInfoDTO from "src/trading/dtos/order-info.dto";
import { TradingInterface } from "src/trading/interfaces/trading.interface";
import { AngelConstant, ApiType } from "./config/angel.constant";
import { AngelHoldingDTO } from "./dto/holding.dto";
import { AngelOHLCHistoricalType } from "./dto/ohlc.historical.reponse.dto";
import AngelOHLCHistoricalRequestDTO from "./dto/ohlc.historical.request.dto";
import { AngelOrderResponse } from "./dto/order.response.dto";
import { AngelRequestHandler } from "./requestaHandler.service";

@Injectable()
export class AngelService implements TradingInterface {
    private readonly logger: Logger = new Logger(AngelService.name);

    constructor(private readonly requestHandler: AngelRequestHandler) {}

    async placeDailyStopLossOrders(): Promise<OrderInfoDTO[]> {
        try {
            this.logger.log(
                `${AngelService.name}:${this.placeDailyStopLossOrders.name} method is called`,
            );

            const today: Date = new Date();
            const fromDate: Date = new Date (new Date().setDate( new Date().getDate() - 30 ));
            this.logger.log(`today: ${today}, previous day: ${fromDate}`);
            const holdingStocks: AngelHoldingDTO[] = await this.getAllHoldings();

            const orderResponse: Promise<AngelOrderResponse>[] =
                holdingStocks.map(async (stock: AngelHoldingDTO) => {
                    const baseStopLoss: string[] = getTrailingStopLoss(stock.ltp, stock.averageprice);
                    const historicalData: AngelOHLCHistoricalType[] =
                        await this.getHistoricalData( stock, fromDate, today, AngelConstant.ONE_DAY_INTERVAL );

                    return await this.placeStopLossOrder(stock, baseStopLoss);
                });

            await Promise.resolve(orderResponse);
            this.logger.log(
                `${AngelService.name}:${this.placeDailyStopLossOrders.name} placed sl order for all the holdings`,
            );
            return null;
        } catch ( error ) {
            return
        }
    }

    /**
     * it checks if there's any existing sell order present for this particular stock,
     *  if it's present then it modifies the existing order or else it creates the same.
     * @param _stock it holds the stock holding details of any stock which is curently present in Angel trading account
     * @param _slOrderValues an array consisting the value of stopLoss and trigger prices
     */
    private async placeStopLossOrder(
        _stock: AngelHoldingDTO,
        _slOrderValues: string[],
    ): Promise<AngelOrderResponse> {
        throw new Error("Method not implemented.");
    }

    private async getHistoricalData(
        stock: AngelHoldingDTO,
        fromDate: Date,
        toDate: Date,
        interval: string,
    ): Promise<AngelOHLCHistoricalType[]> {
        const request: AngelOHLCHistoricalRequestDTO =
            new AngelOHLCHistoricalRequestDTO(
                stock.exchange,
                stock.symboltoken,
                interval,
                fromDate.toISOString().slice(0, 16).replace("T", " "),
                toDate.toISOString().slice(0, 16).replace("T", " "),
            );

        const historicalData: AngelOHLCHistoricalType[] = await this.requestHandler.execute( AngelConstant.HISTORICAL_DATA_ROUTE, RequestMethod.POST, request, ApiType.historical );

        return historicalData;
    }

    async getAllHoldings(): Promise<AngelHoldingDTO[]> {
        try {
            const orderResponse: AngelHoldingDTO[] =
                await this.requestHandler.execute(
                    AngelConstant.HOLDING_ROUTE,
                    RequestMethod.GET,
                    null,
                    ApiType.others,
                );
            return orderResponse;
        } catch (error) {
            this.logger.error(
                `${AngelService.name}:${this.getAllHoldings.name} error occured while fetching holding information.`,
                error,
            );
        }
    }

    placeOrders(): Promise<any> {
        throw new Error("Method not implemented.");
    }
}
