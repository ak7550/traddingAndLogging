import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import _ from "lodash";
import moment from "moment-timezone";
import { CreateStockDatumDto } from "./dto/create-stock-datum.dto";
import { FyersHistoricalDataDTO } from "./dto/fyers-historical-response.dto";
import { UpdateStockDatumDto } from "./dto/update-stock-datum.dto";
import {
    composeDailyData,
    OhlcvDataDTO,
    StockInfoHistorical,
    StockInfoMarket,
    TimeWiseData
} from "./entities/stock-data.entity";
import { RequestHandlerService } from "./request-handler.service";
import { CustomLogger } from "../custom-logger.service";
import { mapFyersDataToStockInfo } from "./config/stock-data.constant";

@Injectable()
export class StockDataService {
    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private readonly logger: CustomLogger = new CustomLogger(
            StockDataService.name
        ),
        private readonly requestHandler: RequestHandlerService
    ) {}

    //TODO: costly operation, think of implementing worker thread.
    async getCurrentData ( stockName: string ): Promise<StockInfoMarket> {
        const currentTime = moment().unix().toString();
        const todayAt915 = moment()
            // moment( "2024-10-31 09:15", "YYYY-MM-DD HH:mm" )
            .set({ hour: 9, minute: 15, second: 0, millisecond: 0})
            .unix()
            .toString();

        const fiveMinuteData = this.requestHandler.getData<FyersHistoricalDataDTO[]>( stockName, '5', todayAt915, currentTime, 0 );
        const fifteenMinuteData = this.requestHandler.getData<FyersHistoricalDataDTO[]>( stockName, '15', todayAt915, currentTime, 0 );
        const oneHourData = this.requestHandler.getData<FyersHistoricalDataDTO[]>( stockName, '60', todayAt915, currentTime, 0 );

        return await Promise.all( [
            fiveMinuteData,
            fifteenMinuteData,
            oneHourData
        ] )
            .then( ( [ five, fifteen, oneHour ] ) => {
                const ohlcv5: OhlcvDataDTO[] = five.map( mapFyersDataToStockInfo );
                const ohlcv15: OhlcvDataDTO[] = fifteen.map( mapFyersDataToStockInfo );
                const ohlcv1: OhlcvDataDTO[] = oneHour.map( mapFyersDataToStockInfo );

                const timewise5: TimeWiseData = new TimeWiseData( ohlcv5 );
                const timewise15: TimeWiseData = new TimeWiseData( ohlcv15 );
                const timewise1: TimeWiseData = new TimeWiseData( ohlcv1 );

            return new StockInfoMarket(timewise5, timewise15, timewise1);
        });
    }

    //TODO: costly operation, think of implementing worker thread.
    async getHistoricalData(stockName: string): Promise<StockInfoHistorical> {
        return await this.useCaching(stockName, this._getHistoricalData);
    }

    /**
     * this method will get the tiem wise data individually and create the ultimate response
     * to get monthly indicator values, we will pull out daily data from last 4 years and then calculate monthly indicator values
     * Fyers is providing daily data of last 366 days in a single api call
     */
    //TODO: costly operation, think of implementing worker thread
    private async _getHistoricalData(
        stockName: string,
        instance: StockDataService
    ): Promise<StockInfoHistorical> {
        const today = moment();
        const oneYrBefore = moment(today).subtract(365, "days");
        const twoYrBefore = moment(oneYrBefore).subtract(366, "days");
        const threeYrBefore = moment(twoYrBefore).subtract(366, "days");
        const fourYrBefore = moment(threeYrBefore).subtract(366, "days");

        const last1yrData: Promise<FyersHistoricalDataDTO[]> =
            instance.requestHandler.getData<FyersHistoricalDataDTO[]>(
                stockName,
                "1D",
                oneYrBefore.format("YYYY-MM-DD"),
                today.format("YYYY-MM-DD"),
                1
            );

        const last2yrData: Promise<FyersHistoricalDataDTO[]> =
            instance.requestHandler.getData<FyersHistoricalDataDTO[]>(
                stockName,
                "1D",
                twoYrBefore.format("YYYY-MM-DD"),
                oneYrBefore.subtract(1, "day").format("YYYY-MM-DD"),
                1
            );

        const last3yrData: Promise<FyersHistoricalDataDTO[]> =
            instance.requestHandler.getData<FyersHistoricalDataDTO[]>(
                stockName,
                "1D",
                threeYrBefore.format("YYYY-MM-DD"),
                twoYrBefore.subtract(1, "day").format("YYYY-MM-DD"),
                1
            );

        const last4yrData: Promise<FyersHistoricalDataDTO[]> =
            instance.requestHandler.getData<FyersHistoricalDataDTO[]>(
                stockName,
                "1D",
                fourYrBefore.format("YYYY-MM-DD"),
                threeYrBefore.subtract(1, "day").format("YYYY-MM-DD"),
                1
            );

        return await Promise.all([
            last1yrData,
            last2yrData,
            last3yrData,
            last4yrData
        ]).then(([oneYrData, twoYrData, threeYrData, fourYrData]) => {
            const dailyOHLCV: OhlcvDataDTO[] = fourYrData
                .concat(threeYrData, twoYrData, oneYrData)
                .map(mapFyersDataToStockInfo);

            const weeks: OhlcvDataDTO[] = _.chain(dailyOHLCV)
                .groupBy(
                    ({ timeStamp }) =>
                        `${moment.unix(timeStamp).isoWeek()}-${moment
                            .unix(timeStamp)
                            .year()}`
                )
                .values()
                .map(composeDailyData)
                .value();

            const months: OhlcvDataDTO[] = _.chain(dailyOHLCV)
                .groupBy(
                    ({ timeStamp }) =>
                        `${moment.unix(timeStamp).month()}-${moment
                            .unix(timeStamp)
                            .year()}`
                )
                .values()
                .map(composeDailyData)
                .value();

            console.log(weeks);
            const stockInfoHistorical: StockInfoHistorical =
                new StockInfoHistorical(
                    new TimeWiseData(dailyOHLCV),
                    new TimeWiseData(weeks),
                    new TimeWiseData(months)
                );
            return stockInfoHistorical;
        });
    }

    create(createStockDatumDto: CreateStockDatumDto) {
        return "This action adds a new stockDatum";
    }

    findAll() {
        return `This action returns all stockData`;
    }

    async findOne(stockName: string): Promise<StockInfoHistorical> {
        return this.useCaching<StockInfoHistorical>(
            stockName,
            this.getStockInfoHistorical
        );
    }

    private getStockInfoHistorical = (
        stockName: string,
        instance: StockDataService
    ): Promise<StockInfoHistorical> => {
        return null;
    };

    private async useCaching<T>(
        keyName: string,
        method: (name: string, instance: StockDataService) => Promise<T>
    ): Promise<T> {
        let value: T = await this.cacheManager.get(keyName);
        if (value !== undefined) {
            this.logger.verbose(`found ${keyName} in cache`);
            return value;
        }
        value = await method(keyName, this);
        this.cacheManager.set(keyName, value, 7 * 3600 * 1000);
        return value;
    }

    update(id: number, updateStockDatumDto: UpdateStockDatumDto) {
        return `This action updates a #${id} stockDatum`;
    }

    remove(id: number) {
        return `This action removes a #${id} stockDatum`;
    }
}
