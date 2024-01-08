import AbstractEntity from "src/database/abstract.entity";
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";
import { Broker } from "./broker.entity";
import { UserBroker } from "./userBroker.entity";

@Entity({
    name: "user",
})
export class User extends AbstractEntity<User> {
    @Column()
    name: string;

    @ManyToMany(() => Broker, broker => broker.users, { cascade: true })
    @JoinTable({
        name: "user_broker",
        joinColumn: { name: "user_id", referencedColumnName: "id" },
        inverseJoinColumn: {
            name: "broker_name",
            referencedColumnName: "name",
        },
    })
    brokers: Broker[];

    @OneToMany(() => UserBroker, userBroker => userBroker.user)
    userBrokers: UserBroker[];
}
