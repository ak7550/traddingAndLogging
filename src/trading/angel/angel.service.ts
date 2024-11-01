import { Injectable, Logger, RequestMethod } from "@nestjs/common";
import { AngelConstant, ApiType } from "./config/angel.constant";
import { mapToHoldingDTO, mapToOrderResponseDTO } from "./config/angel.utils";
import AngelHoldingDTO from './dto/holding.dto';
import { AngelOHLCHistoricalType } from "./dto/ohlc.historical.reponse.dto";
import AngelOHLCHistoricalRequestDTO from "./dto/ohlc.historical.request.dto";
import AngelOrderRequestDTO from "./dto/order.request.dto";
import AngelOrderResponseDTO from "./dto/order.response.dto";
import AngelRequestHandler from "./request-handler.service";
import HoldingInfoDTO from "../dtos/holding-info.dto";
import TradingInterface from "../interfaces/trading.interface";
import { CredentialService } from "../../entities/credential/credential.service";
import Strategy, { OrderDetails } from "../../common/strategies";
import { DematAccount } from "../../entities/demat/entities/demat-account.entity";
import OrderResponseDTO from "../dtos/order.response.dto";
import { Credential } from "../../entities/credential/credential.entity";
import { getStopLoss } from "../../common/strategy-util";
import { OhlcvDataDTO } from "../../stock-data/entities/stock-data.entity";

@Injectable()
export default class AngelService implements TradingInterface {
    constructor(
        private readonly requestHandler: AngelRequestHandler,
        private readonly logger: Logger = new Logger(AngelService.name),
        private readonly credentialService: CredentialService
    ) {}

    async placeStopLossOrders(
        demat: DematAccount,
        strategies: Strategy[]
    ): Promise<OrderResponseDTO[]> {
        return await this.credentialService
            .findCredential(demat, AngelConstant.AUTH_TOKEN)
            .then((jwtToken: Credential) =>
                this._placeStopLossOrders(jwtToken.keyValue, strategies)
            );
    }

    /**
     * this method fetches all the holdings in current portoflio and sets trailing stoploss order for each one of them
     * @returns {OrderResponseDTO[]} an array of all the order responnses
     */
    private async _placeStopLossOrders(
        jwtToken: string,
        strategies: Strategy[]
    ): Promise<OrderResponseDTO[]> {
        try {
            this.logger.log(
                `${AngelService.name}:${this.placeStopLossOrders.name} method is called`
            );

            const settledResults: OrderResponseDTO[] =
                await this._getAllHoldings(jwtToken).then(
                    (holdingStocks: HoldingInfoDTO[]) =>
                        this.processStocksAndPlaceStoplossOrder(
                            holdingStocks,
                            strategies
                        )
                );

            this.logger.log(
                `${AngelService.name}:${this.placeStopLossOrders.name} placed sl order for all the holdings`
            );

            return settledResults;
        } catch (error) {
            this.logger.error(
                `${AngelService.name}:${this.placeStopLossOrders.name} error occured at some point`,
                error
            );
        }

        return null;
    }

    /**
     * it iterates over the stocks that are currently in Angel's portfolio, figures out what should be the stoploss value and place stoploss order for each of those stocks
     * @param holdingStocks contains an array holding all the stocks information which are currently present in angel portfolio
     * @returns {PromiseSettledResult<OrderResponseDTO>[]} an array of orderResponseDTO after placing the orders
     */
    private async processStocksAndPlaceStoplossOrder(
        holdingStocks: HoldingInfoDTO[],
        strategies: Strategy[]
    ): Promise<OrderResponseDTO[]> {
        const today: Date = new Date();

        //taking 90days previous data, to make a precious data
        const fromDate: Date = new Date(
            new Date().setDate(new Date().getDate() - 90)
        );
        this.logger.log(`today: ${today}, previous day: ${fromDate}`);
        const promiseOfOrderResponse: Promise<OrderResponseDTO>[] = [];
        const orderResponses: OrderResponseDTO[] = [];

        holdingStocks.forEach(async (stock: HoldingInfoDTO) => {
            try {
                const orderDetail: OrderDetails[] =
                    await this.getHistoricalData(
                        stock,
                        fromDate,
                        today,
                        AngelConstant.ONE_DAY_INTERVAL
                    ).then((historicalData: OhlcvDataDTO[]) =>
                        getStopLoss(null, strategies)
                    );

                if (orderDetail == null || orderDetail.length == 0) {
                    this.logger.log(
                        `None of the strategies are triggered for ${stock.tradingsymbol}`
                    );
                    return;
                }

                // as we are calling this method from an array, we need to ensure the quantities
                orderDetail.forEach(async (detail: OrderDetails) =>
                    promiseOfOrderResponse.push(
                        this.placeStopLossOrder(stock, detail)
                    )
                );
                orderResponses.concat(
                    await Promise.all(promiseOfOrderResponse)
                );
            } catch (error) {
                this.logger.error(
                    `error occured while dealing with ${stock.tradingsymbol}`,
                    error
                );
                orderResponses.concat(
                    mapToOrderResponseDTO(null, stock, null, error)
                );
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
                `encountered an error, while creating the stoploss order of ${_stock.tradingsymbol}`,
                error
            );
            orderResponse = mapToOrderResponseDTO(null, _stock, null, error);
        }
        return orderResponse;
    }


    private async getAnotherHistoricalData (
        stock: HoldingInfoDTO,
    ) {

    }


    private async getHistoricalData(
        stock: HoldingInfoDTO,
        fromDate: Date,
        toDate: Date,
        interval: string
    ): Promise<OhlcvDataDTO[]> {
        const request: AngelOHLCHistoricalRequestDTO =
            new AngelOHLCHistoricalRequestDTO(
                stock.exchange,
                "", // symbolToken needs to be passed in case of angel historical api
                interval,
                fromDate.toISOString().slice(0, 16).replace("T", " "),
                toDate.toISOString().slice(0, 16).replace("T", " ")
            );

        return await this.requestHandler
            .execute<AngelOHLCHistoricalType[]>(
                AngelConstant.HISTORICAL_DATA_ROUTE,
                RequestMethod.POST,
                request,
                ApiType.historical
            )
            .then((historicalData: AngelOHLCHistoricalType[]) =>
                historicalData.map(
                    ([
                        timeStamp,
                        open,
                        high,
                        low,
                        close,
                        vol
                    ]: AngelOHLCHistoricalType): OhlcvDataDTO =>
                        new OhlcvDataDTO(Number.parseInt(timeStamp), open, high, low, close, vol)
                )
            );
    }

    async getAllHoldings(demat: DematAccount): Promise<HoldingInfoDTO[]> {
        return await this.credentialService
            .findCredential(demat, AngelConstant.AUTH_TOKEN)
            .then((jwtToken: Credential) =>
                this._getAllHoldings(jwtToken.keyValue)
            );
    }

    private async _getAllHoldings(jwtToken: string): Promise<HoldingInfoDTO[]> {
        try {
            return await this.requestHandler
                .execute<AngelHoldingDTO[]>(
                    AngelConstant.HOLDING_ROUTE,
                    RequestMethod.GET,
                    null,
                    ApiType.others,
                    jwtToken
                )
                .then((res: AngelHoldingDTO[]) => res.map(mapToHoldingDTO));
        } catch (error) {
            this.logger.error(
                `${AngelService.name}:${this.getAllHoldings.name} error occured while fetching holding information.`,
                error
            );
        }
    }

    //TODO: REMOVE any from return type
    placeOrders(jwtToken: string): Promise<any> {
        throw new Error("Method not implemented.");
    }

    async getHolding ( demat: DematAccount ): Promise<HoldingInfoDTO[]>{
        return await this.credentialService.findCredential( demat, AngelConstant.AUTH_TOKEN )
            .then(authToken => this.requestHandler.execute<AngelHoldingDTO[]>(
                    AngelConstant.HOLDING_ROUTE,
                    RequestMethod.GET,
                    null,
                    ApiType.others,
                    authToken.keyValue
            ))
            .then((res: AngelHoldingDTO[]) => res.map(mapToHoldingDTO));
    }
}
