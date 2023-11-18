import { Injectable, Logger, RequestMethod } from "@nestjs/common";
import { getBaseStopLoss, getTrailingStopLoss } from 'src/common/globalUtility.utility';
import TradingInterface from "src/trading/interfaces/trading.interface";
import { AngelConstant, ApiType } from "./config/angel.constant";
import AngelHoldingDTO from "./dto/holding.dto";
import { AngelOHLCHistoricalType } from "./dto/ohlc.historical.reponse.dto";
import AngelOHLCHistoricalRequestDTO from "./dto/ohlc.historical.request.dto";
import AngelRequestHandler from "./request-handler.service";
import OhlcvDataDTO from "src/trading/dtos/ohlcv-data.dto";
import AngelOrderRequestDTO from './dto/order.request.dto';
import AngelOrderResponseDTO from "./dto/order.response.dto";
import { Cron } from "@nestjs/schedule";
import GlobalConstant from "src/common/globalConstants.constant";
import OrderResponseDTO from "src/trading/dtos/order.response.dto";
import { mapToOrderResponseDTO } from "./config/angel.utils";

@Injectable()
export default class AngelService implements TradingInterface {
    private readonly logger: Logger = new Logger(AngelService.name);

    constructor(private readonly requestHandler: AngelRequestHandler) {}

    // check properly, if this cron expression works, then save it inside the global constant file.
    async placeDailyStopLossOrders(): Promise<OrderResponseDTO[]> {
        try {
            this.logger.log(`${AngelService.name}:${this.placeDailyStopLossOrders.name} method is called`);

            const holdingStocks: AngelHoldingDTO[] = await this.getAllHoldings();

            const settledResults: OrderResponseDTO[] = this.processStocksAndPlaceStoplossOrder(holdingStocks);

            this.logger.log(
                `${AngelService.name}:${this.placeDailyStopLossOrders.name} placed sl order for all the holdings`,
            );
            return settledResults;
        } catch (error) {
            this.logger.error( `${ AngelService.name }:${ this.placeDailyStopLossOrders.name } error occured at some point`, error );
        }

        return null;
    }

    /**
     * it iterates over the stocks that are currently in Angel's portfolio, figures out what should be the stoploss value and place stoploss order for each of those stocks
     * @param holdingStocks contains an array holding all the stocks information which are currently present in angel portfolio
     * @returns {PromiseSettledResult<OrderResponseDTO>[]} an array of orderResponseDTO after placing the orders
     */
    private processStocksAndPlaceStoplossOrder(
        holdingStocks: AngelHoldingDTO[],
    ): OrderResponseDTO[] {
        const today: Date = new Date();
        //taking 90days previous data, to make a precious data
        const fromDate: Date = new Date(
            new Date().setDate(new Date().getDate() - 90),
        );

        this.logger.log( `today: ${ today }, previous day: ${ fromDate }` );

        const orderResponses: OrderResponseDTO[] = [];

        holdingStocks.forEach(async (stock: AngelHoldingDTO) => {
            try {
                const baseStopLoss: string = getBaseStopLoss(
                    stock.ltp,
                    stock.averageprice,
                );
                const historicalData: OhlcvDataDTO[] =
                    await this.getHistoricalData(
                        stock,
                        fromDate,
                        today,
                        AngelConstant.ONE_DAY_INTERVAL,
                    );

                const stopLoss: number[] = getTrailingStopLoss(
                    stock.ltp,
                    Number.parseFloat(baseStopLoss),
                    historicalData,
                );

                const orderResponse: OrderResponseDTO = await this.placeStopLossOrder(stock, stopLoss);

                orderResponses.push(orderResponse);
            } catch ( error ) {
                this.logger.error( `error occured while dealing with ${ stock.tradingsymbol }`, error );
                orderResponses.push(mapToOrderResponseDTO(null, stock, null, error));
            }
        });

        return orderResponses;
    }

    /**
     * it checks if there's any existing sell order present for this particular stock,
     *  if it's present then it modifies the existing order or else it creates the same.
     * docs: [Angel api docs for orders](https://smartapi.angelbroking.com/docs/Orders)
     * @param _stock it holds the stock holding details of any stock which is curently present in Angel trading account
     * @param _slOrderValues an array consisting the value of stopLoss and trigger prices
     */
    private async placeStopLossOrder(
        _stock: AngelHoldingDTO,
        _slOrderValues: number[],
    ): Promise<OrderResponseDTO> {
        let orderResponse: OrderResponseDTO = null;
        try {
            this.logger.log(
                `inside ${AngelService.name}: ${this.placeStopLossOrder.name} method`,
            );
            const orderRequestDTO: AngelOrderRequestDTO = new AngelOrderRequestDTO();
            orderRequestDTO.mapData( _stock, _slOrderValues, GlobalConstant.STOP_LOSS, GlobalConstant.SELL, "STOPLOSS_MARKET" );

            const response: AngelOrderResponseDTO =
                await this.requestHandler.execute(
                    AngelConstant.ORDER_PLACE_ROUTE,
                    RequestMethod.POST,
                    orderRequestDTO,
                    ApiType.order,
                );

            this.logger.log(
                `receive a successful response stoploss order of ${_stock.tradingsymbol}`,
            );

            //code to response into universal order-dto
            //todo: talk with angel, there must be an api to find a status of an individual order
            // using that response, we will be able to map a lot of data
            orderResponse = mapToOrderResponseDTO(
                response,
                _stock,
                orderRequestDTO,
            );
        } catch (error: unknown) {
            this.logger.error(
                `encountered an error, while creating the stoploss order of ${_stock.tradingsymbol}`,
                error,
            );
            orderResponse = mapToOrderResponseDTO(null, _stock, null, error);
        }
        return orderResponse;
    }

    private async getHistoricalData(
        stock: AngelHoldingDTO,
        fromDate: Date,
        toDate: Date,
        interval: string,
    ): Promise<OhlcvDataDTO[]> {
        const request: AngelOHLCHistoricalRequestDTO =
            new AngelOHLCHistoricalRequestDTO(
                stock.exchange,
                stock.symboltoken,
                interval,
                fromDate.toISOString().slice(0, 16).replace("T", " "),
                toDate.toISOString().slice(0, 16).replace("T", " "),
            );

        const historicalData: AngelOHLCHistoricalType[] =
            await this.requestHandler.execute(
                AngelConstant.HISTORICAL_DATA_ROUTE,
                RequestMethod.POST,
                request,
                ApiType.historical,
            );

        return historicalData.map(
            ([
                timeStamp,
                open,
                high,
                low,
                close,
                vol,
            ]: AngelOHLCHistoricalType): OhlcvDataDTO =>
                new OhlcvDataDTO(timeStamp, open, high, low, close, vol),
        );
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
