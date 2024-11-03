import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import GlobalConstant, {
    IntegratedBroker
} from "../../common/globalConstants.constant";
import { BrokerService } from "../../entities/broker/broker.service";
import { Broker } from "../../entities/broker/entities/broker.entity";
import { Credential } from "../../entities/credential/credential.entity";
import { CredentialService } from "../../entities/credential/credential.service";
import { DematService } from "../../entities/demat/demat.service";
import { DematAccount } from "../../entities/demat/entities/demat-account.entity";
import { AngelConstant } from "./config/angel.constant";
import GenerateTokenDto from "./dto/generate-token.request.dto.";
import GenerateTokenResponseDto from "./dto/generate-token.response.dto";
import AngelRequestHandler from "./request-handler.service";
import { CustomLogger } from "../../custom-logger.service";

@Injectable()
export default class AngelScheduler {
    private broker: Broker;

    constructor(
        private readonly logger: CustomLogger = new CustomLogger(AngelScheduler.name),
        private readonly brokerService: BrokerService,
        private readonly requestHandler: AngelRequestHandler,
        private readonly dematService: DematService,
        private readonly credentialService: CredentialService
    ) {}

    private async initiateBroker() {
        if (this.broker == undefined) {
            this.broker = await this.brokerService.findOne(
                IntegratedBroker.Angel
            );
        }
    }

    /**
     * this module is responsible for updating the credentials of each users Who has a demat account in Angel
     */
    // @Cron(CronExpression.EVERY_5_MINUTES) // for testing
    @Cron("15 10 8 * * 1-5")
    async updateCredentials(): Promise<void> {
        try {
            this.logger.verbose(`Inside updateCredential method`);
            this.initiateBroker();
            const dematAccounts: DematAccount[] =
                await this.dematService.findAll(this.broker);

            const credentialPromise: Promise<Credential[]>[] =
                dematAccounts.map((dematAccount: DematAccount) =>
                    this.updateCredential(dematAccount)
                );

            await Promise.allSettled(credentialPromise);
            this.logger.verbose(
                `All the credentials are refershed for ${this.broker.name}`
            );
        } catch (error) {
            this.logger.error(`failed to update credentials`, `${error}`);
        }
    }

    async updateCredential(account: DematAccount): Promise<Credential[]> {
        try {
            this.logger.verbose(
                `updating credentials for account`,
                `${account}`
            );
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

            this.logger.verbose(
                `new credentials are saved successfully for`,
                `${account}`
            );
            return updatedCredentials;
        } catch (error) {
            // TODO: need to handle errors in a proper manner, unable to handle the errors efficiently, crashing the whole service
            this.logger.error(
                `error occured while generating a new accessTokens for ${account.accountNumber}`,
                `${error}`
            );
        }
    }
}
