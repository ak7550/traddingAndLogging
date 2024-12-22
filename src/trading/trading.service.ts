import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
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
import { daily21EMARetestBuy } from "src/common/strategies/daily21EMARetestBuy.strategy";
import { dailyRSIBelow60 } from "src/common/strategies/rsiBelow60.strategy";
import { sellEvery15min } from "src/common/strategies/sellEvery15min.strategy";
import { sellconfirmationMorning } from "src/common/strategies/sellInMorning.strategy";
import { DematService } from "src/entities/demat/demat.service";
import { CreateOrderDTO } from "src/entities/order/dto/createOrder.dto";
import { OrderService } from "src/entities/order/order.service";
import utils from "util";
import Strategy, {
    OrderDetails,
    strategies,
    StrategyDetails
} from "../common/strategies";
import { openHighSellClosingHour } from "../common/strategies/openHighSellClosingHour.strategy";
import { CustomLogger } from "../custom-logger.service";
import { DematAccount } from "../entities/demat/entities/demat-account.entity";
import { User } from "../entities/user/entities/user.entity";
import { UserService } from "../entities/user/user.service";
import {
    StockInfoHistorical,
    StockInfoMarket
} from "../stock-data/entities/stock-data.entity";
import { StockDataService } from "../stock-data/stock-data.service";
import {
    generateFakeAngelOrderResponse,
    mapToOrderResponseDTO
} from "./angel/config/angel.utils";
import AngelAPIResponse from "./angel/dto/generic.response.dto";
import { AngelOrderStatusResponseDTO } from "./angel/dto/orderStatus.response.dto";
import AlertRequestDTO from "./dtos/alert.request.dto";
import HoldingInfoDTO from "./dtos/holding-info.dto";
import OrderResponseDTO from "./dtos/order.response.dto";
import TradingInterface from "./interfaces/trading.interface";
import TradingFactoryService from "./trading-factory.service";

type AlertServiceType = {
    demat: DematAccount;
    holding: HoldingInfoDTO;
};

@Injectable()
export class TradingService {
    async handleTradingViewAlert(
        alert: AlertRequestDTO,
        dematAccountId?: number
    ): Promise<OrderResponseDTO[] | void> {
        const strategiesForThisAlert: Strategy[] = alert.strategyNumber
            .map(n => strategies[n])
            .filter(res => res !== undefined);

        const filteredAlertService: AlertServiceType[] = [];
        // collect all the demat accounts, where this stock exists
        if (!Number.isNaN(dematAccountId)) {
            const demat: DematAccount =
                await this.dematService.findOne(dematAccountId);
            if (demat) {
                const holding: HoldingInfoDTO[] = await this.getHolding(demat);
                const filteredData: HoldingInfoDTO[] = holding.filter(
                    h => h.tradingsymbol === alert.ticker
                );
                if (filteredData.length === 0) {
                    this.logger.log(
                        `${alert.ticker} is not present in ${dematAccountId}`
                    );
                    return;
                }
                filteredAlertService.push({ demat, holding: filteredData[0] });
            }
        } else {
            // get all the demat accounts who are holding this stock
            const filteredDematsObserVable: Observable<AlertServiceType[]> =
                from(await this.dematService.findAll()).pipe(
                    mergeMap(async demat => {
                        const holding: HoldingInfoDTO[] =
                            await this.getHolding(demat);
                        const filteredData: HoldingInfoDTO[] = holding.filter(
                            h => h.tradingsymbol === alert.ticker
                        );
                        if (filteredData.length !== 0) {
                            return { demat, holding: filteredData[0] };
                        }
                        return null;
                    }, 10), // 10 is the concurrency value
                    filter(result => result !== null),
                    toArray()
                );

            filteredAlertService.concat(
                await lastValueFrom(filteredDematsObserVable)
            );
        }

        // check if the stock qualifies for the alert to take trade
        const [current, historical] = await Promise.all([
            this.stockDataService.getCurrentData(
                `${alert.exchange}:${alert.ticker}`
            ),
            this.stockDataService.getHistoricalData(
                `${alert.exchange}:${alert.ticker}`
            )
        ]);

        const orderResponseObservale: Observable<OrderResponseDTO[]> = from(
            filteredAlertService
        ).pipe(
            mergeMap(async ({ demat, holding }) => {
                const orderDetail: StrategyDetails | void = this.processData(
                    historical,
                    current,
                    holding,
                    strategiesForThisAlert
                );
                if (orderDetail) {
                    return await this.placeOrder(
                        orderDetail,
                        holding,
                        demat,
                        current,
                        historical
                    );
                }
                return null;
            }, 10), // 10 is the concurrency value
            filter(orderResponse => orderResponse !== null),
            toArray()
        );

        const orderResponses: OrderResponseDTO[] = await lastValueFrom(
            orderResponseObservale
        );
        this.logger.log(
            `Order placed for ${
                alert.ticker
            } into the demat numbers: ${utils.inspect(orderResponses, {
                depth: 4
            })}`
        );
        const orderCreationDTO: CreateOrderDTO[] = orderResponses.map(
            d => new CreateOrderDTO({ ...d })
        );

        this.orderService.insertAll(orderCreationDTO);
        return orderResponses;
    }

    private placeOrderFlag: boolean;
    constructor(
        private readonly userService: UserService,
        private readonly dematService: DematService,
        private readonly tradingFactory: TradingFactoryService,
        private readonly logger: CustomLogger = new CustomLogger(
            TradingService.name
        ),
        private readonly stockDataService: StockDataService,
        private readonly configService: ConfigService,
        private readonly orderService: OrderService
    ) {
        this.placeOrderFlag =
            this.configService.getOrThrow<string>("PLACE_ORDER") === "true";
    }

    @Cron("0 */15 9-15 * * 1-5")
    async sellEvery15min(): Promise<OrderResponseDTO[]> {
        const strategies: Strategy[] = [sellEvery15min];
        const orderResponses: OrderResponseDTO[] =
            await this.placeSchedularOrder(strategies);
        this.logger.log(
            `Order placed for ${utils.inspect(strategies, {
                depth: 4
            })} into the demat numbers: ${utils.inspect(orderResponses, {
                depth: 4
            })}`
        );
        return orderResponses;
    }

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
            mergeMap(demat => this.getHolding(demat), 10), // 10 is the concurrency value
            mergeMap((holdings: HoldingInfoDTO[]) => from(holdings), 10),
            toArray()
        );

        return await lastValueFrom(dematObservable);
    }

    private async getHolding(demat: DematAccount): Promise<HoldingInfoDTO[]> {
        return await this.tradingFactory
            .getInstance(demat.broker.name)
            .getHolding(demat);
    }

    // sequence of the strategies in this array are very very very important. If a strategy satisfies, the order will be executed for that stock based upon that strategy
    @Cron("0 */30 9-15 * * 1-5")
    async placeMorningSLOrders(): Promise<void> {
        const strategies: Strategy[] = [sellconfirmationMorning];
        await this.placeSchedularOrder(strategies).then(() =>
            this.logger.verbose(`${_.map(strategies, "name")} are executed.`)
        );
    }

    @Cron("0 20 15 * * 1-5")
    public async closingTimeOrder(): Promise<void> {
        const strategies: Strategy[] = [
            openHighSellClosingHour,
            daily21EMARetestBuy,
            dailyRSIBelow60
        ];
        await this.placeSchedularOrder(strategies).then(() =>
            this.logger.verbose(`${_.map(strategies, "name")} are executed.`)
        );
    }

    public async placeSchedularOrder(
        strategies: Strategy[],
        userId?: number,
        broker?: string
    ): Promise<OrderResponseDTO[]> {
        const orderResponsesObservable: Observable<OrderResponseDTO[]> = from(
            Number.isNaN(userId)
                ? this.userService.findAll()
                : this.userService.findOne(userId).then(user => [user])
        ).pipe(
            mergeMap((users: User[]) => from(users), 10),
            mergeMap(
                (user: User) =>
                    from(this.userService.findDemat(user.id, broker)),
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
                                `${holding.exchange}:${holding.tradingsymbol}`
                            ),
                            this.stockDataService.getCurrentData(
                                `${holding.exchange}:${holding.tradingsymbol}`
                            )
                        ]);

                        const orderDetail: StrategyDetails | void =
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
                                    demat,
                                    current,
                                    historical
                                );
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
        const orderResponses: OrderResponseDTO[] = await lastValueFrom(
            orderResponsesObservable
        );

        const orderCreationDTO: CreateOrderDTO[] = orderResponses.map(
            d => new CreateOrderDTO({ ...d })
        );

        this.orderService.insertAll(orderCreationDTO);
        return orderResponses;
    }

    private async placeOrder(
        orderDetail: StrategyDetails,
        holding: HoldingInfoDTO,
        demat: DematAccount,
        current: StockInfoMarket,
        historical: StockInfoHistorical
    ): Promise<OrderResponseDTO> {
        const tradingInterface: TradingInterface =
            this.tradingFactory.getInstance(demat.broker.name);

        const orderResponse: OrderResponseDTO = this.placeOrderFlag
            ? await tradingInterface.placeOrder(
                  orderDetail,
                  holding,
                  demat,
                  current,
                  historical
              )
            : this.placeFakeOrder(orderDetail, holding, demat);

        return orderResponse;
    }

    private async saveOrderDetailsInDb(
        orderResponse: OrderResponseDTO
    ): Promise<void> {
        const order: CreateOrderDTO = new CreateOrderDTO({
            ...orderResponse
        });
        this.orderService.createOrder(order);
    }

    private placeFakeOrder(
        orderDetail: StrategyDetails,
        holding: HoldingInfoDTO,
        demat: DematAccount
    ): OrderResponseDTO {
        // creating angel-api-order-response
        const fakeAngelOrderResponse: AngelAPIResponse<AngelOrderStatusResponseDTO> =
            generateFakeAngelOrderResponse();
        return mapToOrderResponseDTO(
            fakeAngelOrderResponse,
            holding,
            orderDetail,
            demat
        );
    }

    private processData(
        historicalData: StockInfoHistorical,
        currentData: StockInfoMarket,
        holding: HoldingInfoDTO,
        strategies: Strategy[]
    ): StrategyDetails | void {
        if (!this.placeOrderFlag) {
            this.logger.log(`Faking this method`);
            return {
                orderDetails: strategies[0].orderDetails,
                name: strategies[0].name,
                description: strategies[0].description
            };
        }

        const orders: StrategyDetails[] = [];
        for (let index = 0; index < strategies.length; index++) {
            const {
                name,
                mustConditions,
                mightConditions,
                mightConditionLimit,
                orderDetails,
                description
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
                        `Only ${mightConditionsJunkAnswers.length} number of conditions are satisfying, so can't proceed`
                    );
                    break;
                }
            }

            if (shouldProceed) {
                this.logger.verbose(
                    `Strategy ${name} is positive for ${holding.tradingsymbol} `
                );
                orders.push({ orderDetails, name, description });
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
