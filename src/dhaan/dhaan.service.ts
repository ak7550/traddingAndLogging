import { Injectable, Logger } from "@nestjs/common";
import { StockInfo } from "src/trading/dtos/stock-info.dto";
import { TradingInterface } from "src/trading/interfaces/trading.interface";
import { DhaanConstants } from "./config/dhaanConstants.constant";
import { DhaanHoldingDTO } from "./dto/holding.dto";
import { plainToClass } from "class-transformer";
import DhaanRequestHandler from "./requestHandler.service";

@Injectable()
export class DhaanService implements TradingInterface {
    private readonly logger: Logger = new Logger(DhaanService.name);

    constructor(private readonly requestHandler: DhaanRequestHandler) { }

    placeOrders(): Promise<any> {
        throw new Error("Method not implemented.");
    }

    public async getAllHoldings(): Promise<StockInfo[]> {
        try {
            this.logger.log("Inside getAllHoldings method", DhaanService.name);

            const response: DhaanHoldingDTO[] = await this.requestHandler.executeGetRequest<DhaanHoldingDTO[]>(DhaanConstants.holdingDataRoute);

            const stockInfos: StockInfo[] = response.map((dhaanHoldingData: DhaanHoldingDTO): StockInfo =>
                plainToClass<StockInfo, DhaanHoldingDTO>(StockInfo, dhaanHoldingData, { excludeExtraneousValues: true }));

            this.logger.log("converted into stockInfo: ", stockInfos);
            this.logger.log("trying to convert a single one: ", plainToClass(StockInfo, response[0]));

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
