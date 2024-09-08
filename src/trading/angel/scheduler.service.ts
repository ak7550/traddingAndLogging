import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import GlobalConstant, {
    IntegratedBroker
} from "../../common/globalConstants.constant";
import OrderResponseDTO from "src/trading/dtos/order.response.dto";
import { AngelConstant } from "./config/angel.constant";
import GenerateTokenDto from "./dto/generate-token.request.dto.";
import GenerateTokenResponseDto from "./dto/generate-token.response.dto";
import AngelRequestHandler from "./request-handler.service";
import AngelService from "./angel.service";
import { Broker } from "../../entities/broker/entities/broker.entity";
import { BrokerService } from "../../entities/broker/broker.service";
import { DematService } from "../../entities/demat/demat.service";
import { CredentialService } from "../../entities/credential/credential.service";
import { DematAccount } from "../../entities/demat/entities/demat-account.entity";
import { Credential } from "../../entities/credential/credential.entity";
import Strategy from "../../common/strategies";

@Injectable()
export default class AngelScheduler {
    private broker: Broker;

    constructor(
        private readonly logger: Logger = new Logger(AngelScheduler.name),
        private readonly brokerService: BrokerService,
        private readonly requestHandler: AngelRequestHandler,
        private readonly angelService: AngelService,
        private readonly dematService: DematService,
        private readonly credentialService: CredentialService
    ) {}

    /**
     * this method fetches all the holdings in current portoflio and sells if open high sell condition is satisfied
     * docs: [cron-declarative job in nest](https://docs.nestjs.com/techniques/task-scheduling#declarative-cron-jobs)
     * @returns {OrderResponseDTO[]} an array of all the order responnses
     */
    // @Cron("15 21 11 * * 1-5")
    // @Cron(CronExpression.EVERY_5_SECONDS)
    async placeMorningStopLoss(): Promise<void> {
        this.logger.log(`PlaceMorningStopLoss order triggered via Cron`);
        // await this.placeDailyStopLossOrders([openHighSell]);
    }

    async placeDailyStopLossOrders(strategies: Strategy[]): Promise<void> {
        try {
            this.logger.log(`Inside updateCredential method`);
            await this.initiateBroker();
            const dematAccounts: DematAccount[] =
                await this.dematService.findAll(this.broker);

            const orderResponses: PromiseSettledResult<OrderResponseDTO[]>[] =
                await Promise.allSettled(
                    dematAccounts.map(async (dematAccount: DematAccount) => {
                        return this.angelService.placeStopLossOrders(
                            dematAccount,
                            strategies
                        );
                    })
                );

            orderResponses.forEach(this.logger.log);

            this.logger.log(
                `stoploss order placed for order details: ${orderResponses}`
            );
        } catch (error) {
            this.logger.error(`failed to place dailyStoplossOrders`, error);
        }
    }

    private async initiateBroker() {
        if (this.broker == undefined) {
            this.broker = await this.brokerService.findOne(
                IntegratedBroker.Angel
            );
        }
    }

    async lastMomentStopLossOrder(): Promise<void> {}

    /**
     * this module is responsible for updating the credentials of each users Who has a demat account in Angel
     */
    // @Cron(CronExpression.EVERY_5_MINUTES) // for testing
    @Cron("15 10 8 * * 1-5")
    async updateCredentials(): Promise<void> {
        try {
            this.logger.log(`Inside updateCredential method`);
            this.initiateBroker();
            const dematAccounts: DematAccount[] =
                await this.dematService.findAll(this.broker);

            const credentialPromise: Promise<Credential[]>[] =
                dematAccounts.map((dematAccount: DematAccount) =>
                    this.updateCredential(dematAccount)
                );

            await Promise.allSettled(credentialPromise);
            this.logger.log(
                `All the credentials are refershed for ${this.broker.name}`
            );
        } catch (error) {
            this.logger.error(`failed to update credentials`, error);
        }
    }

    async updateCredential(account: DematAccount): Promise<Credential[]> {
        try {
            this.logger.log(`updating credentials for account`, account);
            const credentials: Credential[] =
                await this.credentialService.findAll(account);

            const refreshToken: Credential = credentials.filter(
                credential =>
                    credential.keyName === GlobalConstant.REFRESH_TOKEN
            )[0];

            const jwtToken: Credential = credentials.filter(
                credential => credential.keyName === AngelConstant.AUTH_TOKEN
            )[0];

            const feedToken: Credential = credentials.filter(
                credential => credential.keyName === AngelConstant.FEED_TOKEN
            )[0];

            let expiresAt: Credential = credentials.filter(
                credential => credential.keyName === GlobalConstant.EXPIRES_AT
            )[0];

            // in case expires_at is null or undefined
            if (expiresAt == null) {
                expiresAt = new Credential({
                    keyName: GlobalConstant.EXPIRES_AT,
                    account
                });
            }

            const request: GenerateTokenDto = new GenerateTokenDto({
                refreshToken: refreshToken.keyValue
            });

            const response: GenerateTokenResponseDto =
                await this.requestHandler.refreshToken(
                    request,
                    jwtToken.keyValue
                );

            //updating the values
            refreshToken.keyValue = response.refreshToken;
            jwtToken.keyValue = response.jwtToken;
            feedToken.keyValue = response.feedToken;
            const expiryTime: number = Date.now() + 24 * 60 * 60 * 1000;
            expiresAt.keyValue = expiryTime.toFixed(0);

            const updatedCredentials: Credential[] = [
                refreshToken,
                jwtToken,
                feedToken,
                expiresAt
            ];
            await this.credentialService.save(updatedCredentials);

            this.logger.log(
                `new credentials are saved successfully for`,
                account
            );
            return updatedCredentials;
        } catch (error) {
            // TODO: need to handle errors in a proper manner, unable to handle the errors efficiently, crashing the whole service
            this.logger.error(
                `error occured while generating a new accessTokens for ${account.accountNumber}`,
                error
            );
        }
    }
}
