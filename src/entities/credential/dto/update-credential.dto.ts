import { IntegratedBroker } from "src/common/globalConstants.constant";

export class UpdateCredentialDto {
    userId?: number;
    panCardNumber?: string;
    brokerName: IntegratedBroker;
    keyName: string;
    keyValue: string;
}
