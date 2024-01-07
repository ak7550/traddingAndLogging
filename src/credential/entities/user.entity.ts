import AbstractEntity from "src/database/abstract.entity";
import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { Broker } from "./broker.entity";

@Entity({
    name: "user",
})
export class User extends AbstractEntity<User> {
    @Column()
    name: string;

    @ManyToMany(() => Broker, broker => broker.name, { cascade: true })
    @JoinTable({
        name: "user_broker",
        joinColumn: { name: "user_id", referencedColumnName: "id" },
        inverseJoinColumn: {
            name: "broker_name",
            referencedColumnName: "name",
        },
    })
    brokers: Broker[];
}
