import { IntegratedBroker } from "src/common/globalConstants.constant";
import {
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryColumn,
} from "typeorm";
import { DematAccount } from "./demat-account";
import { User } from "./user.entity";
import { PartialType } from '@nestjs/swagger';

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
