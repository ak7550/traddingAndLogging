
import {
    Entity,
    PrimaryColumn
} from "typeorm";
import { IntegratedBroker } from "../../../common/globalConstants.constant";

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

    // @OneToMany(() => UserBroker, userBroker => userBroker.broker)
    // userBrokers: UserBroker[];

    // @ManyToMany(() => User, user => user.brokers)
    // @JoinTable({
    //     name: "user_broker",
    //     joinColumn: { name: "broker_name", referencedColumnName: "name" },
    //     inverseJoinColumn: {
    //         name: "user_id",
    //         referencedColumnName: "id",
    //         foreignKeyConstraintName: "custom_broker_user_fk",
    //     },
    // })
    // users: User[];

    constructor(entity: Partial<Broker>) {
        Object.assign(this, entity);
    }
}
