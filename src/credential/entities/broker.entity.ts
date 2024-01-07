import { IntegratedBroker } from "src/common/globalConstants.constant";
import { Entity, PrimaryColumn } from "typeorm";


@Entity({
    name: "broker",
})
export class Broker {
    @PrimaryColumn({
        type: "enum",
        enum: IntegratedBroker,
        default: IntegratedBroker.Angel,
    })
    name: IntegratedBroker;
}
