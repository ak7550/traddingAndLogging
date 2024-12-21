import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import utils from 'util';
import GlobalConstant, {
    IntegratedBroker
} from "../../common/globalConstants.constant";
import { CustomLogger } from "../../custom-logger.service";
import { Credential } from "../../entities/credential/credential.entity";
import { CredentialService } from "../../entities/credential/credential.service";
import { DematService } from "../../entities/demat/demat.service";
import { DematAccount } from "../../entities/demat/entities/demat-account.entity";
import { AngelConstant } from "./config/angel.constant";
import GenerateTokenDto from "./dto/generate-token.request.dto.";
import GenerateTokenResponseDto from "./dto/generate-token.response.dto";
import AngelRequestHandler from "./request-handler.service";
import moment from "moment-timezone";

@Injectable()
export default class AngelScheduler {

    constructor(
        private readonly logger: CustomLogger = new CustomLogger(AngelScheduler.name),
        private readonly requestHandler: AngelRequestHandler,
        private readonly dematService: DematService,
        private readonly credentialService: CredentialService
    ) {}

    /**
     * this module is responsible for updating the credentials of each users Who has a demat account in Angel
     */
    @Cron(CronExpression.EVERY_DAY_AT_9AM) // for testing
    async updateCredentials(): Promise<void> {
        try {
            this.logger.verbose(`Inside updateCredential method`);
            const dematAccounts: DematAccount[] = await this.dematService.findAll(IntegratedBroker.Angel);

            const credentialPromise: Promise<Credential[]>[] =
                dematAccounts.map((dematAccount: DematAccount) => this.updateCredential(dematAccount));

            await Promise.allSettled( credentialPromise )
                .then( () => this.logger.verbose(`All the credentials are refershed for ${IntegratedBroker.Angel}`) );

        } catch (error) {
            this.logger.error(`failed to update credentials`, `${utils.inspect(error, {depth: 4, colors: true, })}`);
        }
    }

    async updateCredential(account: DematAccount): Promise<Credential[]> {
        try {
            this.logger.verbose( `updating credentials for account`, `${ account.id }` );

            const credentials: Credential[] = await this.credentialService.findAll(account);

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

            const updatedCredentials: Credential[] = [
                refreshToken,
                jwtToken,
                feedToken
            ];
            
            await this.credentialService.save( updatedCredentials )
                .then(() => this.logger.verbose(`new credentials are saved successfully for ${account.id} at ${moment().format('YYYY-MM-DD HH:mm')}`) );

            return updatedCredentials;
        } catch (error) {
            // TODO: need to handle errors in a proper manner, unable to handle the errors efficiently, crashing the whole service
            this.logger.error(
                `error occured while generating a new accessTokens for ${account.accountNumber}`,
                `${utils.inspect(error, {depth: 4, colors: true, })}`
            );
        }
    }
}
