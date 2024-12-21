import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import _ from "lodash";
import {
    filter,
    from,
    lastValueFrom,
    mergeMap,
    Observable,
    toArray
} from "rxjs";

import utils from 'util';
import Strategy, { OrderDetails, strategies } from "../common/strategies";
import { CustomLogger } from "../custom-logger.service";
import { DematAccount } from "../entities/demat/entities/demat-account.entity";
import { User } from "../entities/user/entities/user.entity";
import { UserService } from "../entities/user/user.service";
import {
    StockInfoHistorical,
    StockInfoMarket
} from "../stock-data/entities/stock-data.entity";
import { StockDataService } from "../stock-data/stock-data.service";
import AlertRequestDTO from "./dtos/alert.request.dto";
import HoldingInfoDTO from "./dtos/holding-info.dto";
import OrderResponseDTO from "./dtos/order.response.dto";
import TradingFactoryService from "./trading-factory.service";
import { openHighSellClosingHour } from "../common/strategies/openHighSellClosingHour.strategy";
import { sellEvery15min } from "src/common/strategies/sellEvery15min.strategy";

@Injectable()
export class TradingService {

    async handleTradingViewAlert(alert: AlertRequestDTO) :Promise<OrderResponseDTO[]>{
        const strategiesForThisAlert: Strategy[] = alert.strategyNumber.reduce((acc, val) => {
            if(val<strategies.length){
                acc.push(strategies[val]);
            }
            return acc;
        }, []);
        const orderResponses: OrderResponseDTO[] = await this.placeOrders(strategiesForThisAlert)
        this.logger.log(`Order placed for ${alert.ticker} into the demat numbers: ${utils.inspect(orderResponses, {depth: 4})}`);
        return orderResponses;
    }

    constructor(
        private readonly userService: UserService,
        private readonly tradingFactory: TradingFactoryService,
        private readonly logger: CustomLogger = new CustomLogger(
            TradingService.name
        ),
        private readonly stockDataService: StockDataService
    ) {}

    @Cron('0 */15 9-15 * * 1-5')
    async sellEvery15min(): Promise<OrderResponseDTO[]> {
        const strategies: Strategy[] = [sellEvery15min];
        const orderResponses: OrderResponseDTO[] = await this.placeOrders(strategies)
        this.logger.log(`Order placed for ${utils.inspect(strategies, {depth: 4})} into the demat numbers: ${utils.inspect(orderResponses, {depth: 4})}`);
        return orderResponses;
    }

    //docs: https://rxjs.dev/deprecations/to-promise
    async getHoldings(
        userId: number,
        broker?: string
    ): Promise<HoldingInfoDTO[]> {
        const dematObservable: Observable<HoldingInfoDTO[]> = from( this.userService.findDemat( userId ) )
            .pipe(
                mergeMap((demats: DematAccount[]) => from(demats), 10),
                filter((demat: DematAccount) => !broker || demat.broker.name === broker),
                mergeMap(demat => this.getHolding(demat), 10), // 10 is the concurrency value
                mergeMap((holdings: HoldingInfoDTO[]) => from(holdings), 10),
                toArray()
            );

        return await lastValueFrom(dematObservable);
    }

    private async getHolding(demat: DematAccount): Promise<HoldingInfoDTO[]> {
        return await this.tradingFactory.getInstance(demat.broker.name).getHolding(demat);
    }

    // sequence of the strategies in this array are very very very important. If a strategy satisfies, the order will be executed for that stock based upon that strategy
    async placeMorningSLOrders(): Promise<void> {
        const strategies: Strategy[] = [];
        await this.placeOrders(strategies).then(() =>
            this.logger.verbose(`${_.map(strategies, "name")} are executed.`)
        );
    }

    @Cron('0 23 15 * * 1-5')
    public async closingTimeOrder(): Promise<void> {
        const strategies: Strategy[] = [openHighSellClosingHour];
        await this.placeOrders(strategies).then(() =>
            this.logger.verbose(`${_.map(strategies, "name")} are executed.`)
        );
    }

    public async placeOrders(
        strategies: Strategy[],
        userId?: number,
        broker?: string
    ): Promise<OrderResponseDTO[]> {
        const orderResponses: Observable<OrderResponseDTO[]> = from(
            Number.isNaN(userId) ?
            this.userService.findAll() : this.userService.findOne(userId).then(user => [user])
        ).pipe(
            mergeMap((users: User[]) => from(users), 10),
            mergeMap((user: User) => from(this.userService.findDemat(user.id, broker)),10),
            mergeMap((dematAccounts: DematAccount[]) => from(dematAccounts),10),
            mergeMap(async (demat: DematAccount) => {
                const dematObservable: Observable<OrderResponseDTO[]> = from( await this.getHolding( demat ) )
                .pipe(
                    mergeMap(async (holding: HoldingInfoDTO) => {
                        const historical: StockInfoHistorical = await this.stockDataService.getHistoricalData(`${holding.exchange}:${holding.tradingsymbol}`);
                        const current: StockInfoMarket = await this.stockDataService.getCurrentData(`${holding.exchange}:${holding.tradingsymbol}`);

                        const orderDetail: OrderDetails | void = this.processData( historical, current, holding, strategies );

                        if (orderDetail) {
                            const orderResponse: OrderResponseDTO = await this.placeOrder( orderDetail, holding, demat, current, historical );
                            // think of auditing this order response.
                            return orderResponse;
                        }
                    }, 10),
                    toArray()
                );
                return await lastValueFrom(dematObservable);
            }, 10),
            mergeMap(
                (orderResponse: OrderResponseDTO[]) => from(orderResponse),
                10
            ),
            toArray()
        );
        return await lastValueFrom(orderResponses);
    }

    private async placeOrder(
        orderDetail: OrderDetails,
        holding: HoldingInfoDTO,
        demat: DematAccount,
        current: StockInfoMarket,
        historical: StockInfoHistorical
    ): Promise<OrderResponseDTO> {
        return await this.tradingFactory
            .getInstance(demat.broker.name)
            .placeOrder(orderDetail, holding, demat, current, historical);
    }

    private processData(
        historicalData: StockInfoHistorical,
        currentData: StockInfoMarket,
        holding: HoldingInfoDTO,
        strategies: Strategy[]
    ): OrderDetails | void {
        const orders: OrderDetails[] = [];
        for (let index = 0; index < strategies.length; index++) {
            const {
                name,
                mustConditions,
                mightConditions,
                mightConditionLimit,
                orderDetails
            }: Strategy = strategies[index];
            let shouldProceed = true;
            const musConditionsAnswers: number[] = [];

            if (mustConditions !== undefined) {
                for (let i = 0; i < mustConditions.length; i++) {
                    const { filter, description } = mustConditions[i];
                    const answer: boolean | number = filter({
                        historical: historicalData,
                        current: currentData,
                        holdingDetails: holding
                    });

                    if (typeof answer === "boolean" && answer === false) {
                        this.logger.verbose(
                            `${description} is not satisfaied for ${holding.tradingsymbol}. so breaking the loop.`
                        );
                        shouldProceed = false;
                        break;
                    } else if (typeof answer === "number") {
                        musConditionsAnswers.push(answer);
                    }
                }
            }

            if (!shouldProceed) {
                this.logger.verbose(
                    `MustConditions did not satisfy for ${holding.tradingsymbol}`
                );
                break;
            }

            if (mightConditions !== undefined && mightConditions.length != 0) {
                const mightConditionsJunkAnswers: (number | boolean)[] =
                    mightConditions.reduce(
                        (
                            acc: (number | boolean)[],
                            { filter, description }
                        ) => {
                            const answer: number | boolean = filter({
                                historical: historicalData,
                                current: currentData,
                                holdingDetails: holding
                            });

                            if (typeof answer === "number" || answer) {
                                acc.push(answer);
                            } else {
                                this.logger.verbose(
                                    `${description} did not satisfy for ${holding.tradingsymbol}`
                                );
                            }
                            return acc;
                        },
                        []
                    );

                if (mightConditionsJunkAnswers.length < mightConditionLimit) {
                    shouldProceed = false;
                    this.logger.verbose(
                        `Only ${mightConditionsJunkAnswers.length} nnumber of conditions are satisfying, so can't proceed`
                    );
                    break;
                }
            }

            if (shouldProceed) {
                this.logger.verbose(
                    `Strategy ${name} is positive for ${holding.tradingsymbol} `
                );
                orders.push(orderDetails);
            }
        }

        if (orders.length === 0) {
            this.logger.verbose(
                `No strategies are currently applicable for ${holding.tradingsymbol}`
            );
        }

        return orders[0]; //TODO: more optimisation needed.
    }
}
