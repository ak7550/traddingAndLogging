import { Injectable } from "@nestjs/common";
import {
    filter,
    from,
    lastValueFrom,
    mergeMap,
    Observable,
    toArray
} from "rxjs";
import Strategy, { OrderDetails } from "../common/strategies";
import { DematAccount } from "../entities/demat/entities/demat-account.entity";
import { User } from "../entities/user/entities/user.entity";
import { UserService } from "../entities/user/user.service";
import {
    StockInfoHistorical,
    StockInfoMarket
} from "../stock-data/entities/stock-data.entity";
import { StockDataService } from "../stock-data/stock-data.service";
import HoldingInfoDTO from "./dtos/holding-info.dto";
import OrderResponseDTO from "./dtos/order.response.dto";
import TradingInterface from "./interfaces/trading.interface";
import TradingFactoryService from "./trading-factory.service";
import _ from "lodash";
import { CustomLogger } from "../custom-logger.service";

@Injectable()
export class TradingService {
    constructor(
        private readonly userService: UserService,
        private readonly tradingFactory: TradingFactoryService,
        private readonly logger: CustomLogger = new CustomLogger(
            TradingService.name
        ),
        private readonly stockDataService: StockDataService
    ) {}

    //docs: https://rxjs.dev/deprecations/to-promise
    async getHoldings(
        userId: number,
        broker?: string
    ): Promise<HoldingInfoDTO[]> {
        const dematObservable: Observable<HoldingInfoDTO[]> = from(
            this.userService.findDemat(userId)
        ).pipe(
            mergeMap((demats: DematAccount[]) => from(demats), 10),
            filter(
                (demat: DematAccount) => !broker || demat.broker.name === broker
            ),
            mergeMap(this.getHolding, 10), // 10 is the concurrency value
            mergeMap((holdings: HoldingInfoDTO[]) => from(holdings), 10),
            toArray()
        );

        return await lastValueFrom(dematObservable);
    }

    private async getHolding(demat: DematAccount): Promise<HoldingInfoDTO[]> {
        const tradingService: TradingInterface =
            this.tradingFactory.getInstance(demat.broker.name);
        return await tradingService.getHolding(demat);
    }

    // sequence of the strategies in this array are very very very important. If a strategy satisfies, the order will be executed for that stock based upon that strategy
    async placeMorningSLOrders(): Promise<void> {
        const strategies: Strategy[] = [];
        await this.placeOrders(strategies).then(() =>
            this.logger.log(`${_.map(strategies, "name")} are executed.`)
        );
    }

    private async placeOrders(
        strategies: Strategy[]
    ): Promise<OrderResponseDTO[]> {
        const orderResponses: Observable<OrderResponseDTO[]> = from(
            this.userService.findAll()
        ).pipe(
            mergeMap((users: User[]) => from(users), 10),
            mergeMap(
                (user: User) => from(this.userService.findDemat(user.id)),
                10
            ),
            mergeMap(
                (dematAccounts: DematAccount[]) => from(dematAccounts),
                10
            ),
            mergeMap(async (demat: DematAccount) => {
                const dematObservable: Observable<OrderResponseDTO[]> = from(
                    await this.getHolding(demat)
                ).pipe(
                    mergeMap(async (holding: HoldingInfoDTO) => {
                        const [historical, current] = await Promise.all([
                            this.stockDataService.getHistoricalData(
                                holding.tradingsymbol
                            ),
                            this.stockDataService.getCurrentData(
                                holding.tradingsymbol
                            )
                        ]);

                        const orderDetail: OrderDetails | void =
                            this.processData(
                                historical,
                                current,
                                holding,
                                strategies
                            );
                        if (orderDetail) {
                            const orderResponse: OrderResponseDTO =
                                await this.placeOrder(
                                    orderDetail,
                                    holding,
                                    demat
                                );
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
        demat: DematAccount
    ): Promise<OrderResponseDTO> {
        return await this.tradingFactory
            .getInstance(demat.broker.name)
            .placeOrder(orderDetail, holding, demat);
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
                        this.logger.log(
                            `${description} is not satisfaied for ${holding.tradingsymbol}.This was a part of mustConditions, so breaking the loop.`
                        );
                        shouldProceed = false;
                        break;
                    } else if (typeof answer === "number") {
                        musConditionsAnswers.push(answer);
                    }
                }
            }

            if (!shouldProceed) {
                this.logger.log(
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
                                this.logger.log(
                                    `${description} did not satisfy for ${holding.tradingsymbol}`
                                );
                            }
                            return acc;
                        },
                        []
                    );

                if (mightConditionsJunkAnswers.length < mightConditionLimit) {
                    shouldProceed = false;
                    this.logger.log(
                        `Only ${mightConditionsJunkAnswers.length} nnumber of conditions are satisfying, so can't proceed`
                    );
                    break;
                }
            }

            if (shouldProceed) {
                this.logger.log(
                    `Strategy ${name} is positive for ${holding.tradingsymbol} `
                );
                orders.push(orderDetails);
            }
        }

        if (orders.length === 0) {
            this.logger.log(
                `No strategies are currently applicable for ${holding.tradingsymbol}`
            );
        }

        return orders[0];
    }
}
