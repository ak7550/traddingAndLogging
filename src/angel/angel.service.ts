import { Injectable, Logger, RequestMethod } from "@nestjs/common";
import OrderInfoDTO from "src/trading/dtos/order-info.dto";
import { TradingInterface } from "src/trading/interfaces/trading.interface";
import { AngelRequestHandler } from "./requestaHandler.service";
import { AngelHoldingDTO } from "./dto/holding.dto";
import { AngelOHLCHistoricalDataDTO } from "./dto/ohlc.historical.dto";
import { getTrailingStopLoss } from "src/common/globalUtility.utility";
import { AngelOrderResponse } from "./dto/order.response.dto";
import { AngelConstant, ApiType } from "./config/angel.constant";

@Injectable()
export class AngelService implements TradingInterface {
    private readonly logger: Logger = new Logger(AngelService.name);

    constructor ( private readonly requestHandler: AngelRequestHandler ) { }

    async placeDailyStopLossOrders (): Promise<OrderInfoDTO[]> {
        try {
            this.logger.log( `${ AngelService.name }:${ this.placeDailyStopLossOrders.name } method is called` );
            const holdingStocks: AngelHoldingDTO[] = await this.getAllHoldings();
            const orderResponse: Promise<AngelOrderResponse>[] = holdingStocks.map( async ( stock: AngelHoldingDTO ) => {
                const previousClosing: AngelOHLCHistoricalDataDTO[][] = await this.getPreviousClosing( stock.tradingsymbol, stock.symboltoken );
                const slOrderValues: string[] = getTrailingStopLoss( previousClosing[ 0 ][ 0 ].close, stock.averageprice );
                return await this.placeStopLossOrder( stock, slOrderValues );
            } );

            await Promise.resolve( orderResponse );
            this.logger.log( `${ AngelService.name }:${ this.placeDailyStopLossOrders.name } placed sl order for all the holdings` );

            return null;
        } catch (error) {

        }
        throw new Error("Method not implemented.");
    }

    /**
     * it checks if there's any existing sell order present for this particular stock,
     *  if it's present then it modifies the existing order or else it creates the same.
     * @param stock it holds the stock holding details of any stock which is curently present in Angel trading account
     * @param slOrderValues an array consisting the value of stopLoss and trigger prices
     */
    private async placeStopLossOrder ( stock: AngelHoldingDTO, slOrderValues: string[] ): Promise<AngelOrderResponse> {
        throw new Error( "Method not implemented." );
    }

    private async getPreviousClosing(tradingsymbol:string, symboltoken: string): Promise<AngelOHLCHistoricalDataDTO[][]> {
        return await null;
    }



    async getAllHoldings(): Promise<AngelHoldingDTO[]> {
        try {
            const orderResponse: AngelHoldingDTO[] = await this.requestHandler.execute( AngelConstant.HOLDING_ROUTE, RequestMethod.GET, null, ApiType.others );
            return orderResponse;
        } catch (error) {
            this.logger.error( `${ AngelService.name }:${ this.getAllHoldings.name } error occured while fetching holding information.` , error);
        }
    }


    placeOrders(): Promise<any> {
        throw new Error("Method not implemented.");
    }
}