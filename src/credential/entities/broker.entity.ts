import { IntegratedBroker } from "src/common/globalConstants.constant";
import { Entity, ManyToMany, OneToMany, PrimaryColumn } from "typeorm";
import { UserBroker } from "./userBroker.entity";
import { User } from "./user.entity";


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

    @OneToMany(() => UserBroker, userBroker => userBroker.broker)
    userBrokers: UserBroker[];

    @ManyToMany(() => User, user => user.brokers)
    users: User[];
}
