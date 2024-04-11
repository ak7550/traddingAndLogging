import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import GlobalConstant, {
    IntegratedBroker
} from "src/common/globalConstants.constant";
import OrderResponseDTO from "src/trading/dtos/order.response.dto";
import { DematAccount } from "src/user/entities/demat-account.entity";
import { UserService } from "src/user/user.service";
import { AngelConstant } from "./config/angel.constant";
import { Credential } from "src/user/entities/credential.entity";
import GenerateTokenDto from "./dto/generate-token.request.dto.";
import GenerateTokenResponseDto from "./dto/generate-token.response.dto";
import AngelRequestHandler from "./request-handler.service";
import { Broker } from "src/user/entities/broker.entity";
import AngelService from "./angel.service";

@Injectable()
export default class AngelScheduler {
    private broker: Broker;

    constructor(
        private readonly logger: Logger = new Logger(AngelScheduler.name),
        private readonly userService: UserService,
        private readonly requestHandler: AngelRequestHandler,
        private readonly angelService: AngelService
    ) {}

    /**
     * this method fetches all the holdings in current portoflio and sets trailing stoploss order for each one of them
     * docs: [cron-declarative job in nest](https://docs.nestjs.com/techniques/task-scheduling#declarative-cron-jobs)
     * @returns {OrderResponseDTO[]} an array of all the order responnses
     */
    @Cron("15 21 11 * * 1-5")
    async placeMorningStopLoss(): Promise<void> {
        await this.placeDailyStopLossOrders([]);
    }

    @Cron("")
    async placLastHourStopLossOrders(): Promise<void> {
        await this.placeDailyStopLossOrders([]);
    }

    async placeDailyStopLossOrders(conditions: Function[]): Promise<void> {
        try {
            this.logger.log(`Inside updateCredential method`);

            if (this.broker == undefined) {
                this.broker = await this.userService.findBroker(
                    IntegratedBroker.Angel
                );
            }
            const dematAccounts: DematAccount[] =
                await this.userService.findDemats(this.broker);

            dematAccounts.forEach(async (dematAccount: DematAccount) => {
                const jwtToken: Credential =
                    await this.userService.findCredential(
                        dematAccount,
                        AngelConstant.JWT_TOKEN
                    );

                const orderResponses: OrderResponseDTO[] =
                    await this.angelService.placeStopLossOrders(
                        jwtToken.keyValue,
                        conditions
                    );

                this.logger.log(
                    `stoploss order placed for demat ${dematAccount}\n order details: ${orderResponses}`
                );
            });
        } catch (error) {
            this.logger.error(`failed to place dailyStoplossOrders`, error);
        }
    }

    async lastMomentStopLossOrder(): Promise<void> {}

    /**
     * this module is responsible for updating the credentials of each users Who has a demat account in Angel
     */
    @Cron("15 50 8 * * 1-5")
    async updateCredentials(): Promise<void> {
        try {
            this.logger.log(`Inside updateCredential method`);

            if (this.broker == undefined) {
                this.broker = await this.userService.findBroker(
                    IntegratedBroker.Angel
                );
            }

            const dematAccounts: DematAccount[] =
                await this.userService.findDemats(this.broker);

            dematAccounts.forEach(async (dematAccount: DematAccount) => {
                await this.updateCredential(dematAccount);
            });
        } catch (error) {
            this.logger.error(`failed to update credentials`, error);
        }
    }

    private async updateCredential(
        account: DematAccount
    ): Promise<Credential[]> {
        try {
            this.logger.log(`updating credentials for account`, account);
            const credentials: Credential[] =
                await this.userService.findCredentials(account);

            const refreshToken: Credential = credentials.filter(
                credential =>
                    credential.keyName === GlobalConstant.REFRESH_TOKEN
            )[0];

            const jwtToken: Credential = credentials.filter(
                credential => credential.keyName === AngelConstant.JWT_TOKEN
            )[0];

            const feedToken: Credential = credentials.filter(
                credential => credential.keyName === AngelConstant.FEED_TOKEN
            )[0];

            const expiresAt: Credential = credentials.filter(
                credential => credential.keyName === GlobalConstant.EXPIRES_AT
            )[0];

            const request: GenerateTokenDto = new GenerateTokenDto({
                refreshToken: refreshToken.keyValue
            });

            const response: GenerateTokenResponseDto =
                await this.requestHandler.refreshToken(request);

            //updating the values
            refreshToken.keyValue = response.refreshToken;
            jwtToken.keyValue = response.jwtToken;
            feedToken.keyValue = response.feedToken;
            const expiryTime: number = Date.now() + 24 * 60 * 60 * 1000;
            expiresAt.keyValue = String(expiryTime);

            const updatedCredentials: Credential[] = [
                refreshToken,
                jwtToken,
                feedToken,
                expiresAt
            ];
            await this.userService.saveCredentials(updatedCredentials);

            this.logger.log(
                `new credentials are saved successfully for`,
                account
            );
            return updatedCredentials;
        } catch (error) {
            this.logger.error(
                `error occured while generating a new accessTokens for ${account.accountNumber}`,
                error
            );
        }
    }
}
