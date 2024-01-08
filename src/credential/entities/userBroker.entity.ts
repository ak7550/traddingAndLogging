import AbstractEntity from "src/database/abstract.entity";
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
    PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Broker } from "./broker.entity";

@Entity({
    name: "user_broker",
})
export class UserBroker extends AbstractEntity<UserBroker>{
    @ManyToOne(() => User, user => user.userBrokers)
    @JoinColumn({ name: "user_id", referencedColumnName: "id" })
    user: User;

    @ManyToOne(() => Broker, broker => broker.userBrokers)
    @JoinColumn({ name: "broker_name", referencedColumnName: "name" })
    broker: Broker;

    @Column()
    additionalProperty: string; // Add your additional properties here
}
