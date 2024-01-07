import AbstractEntity from "src/database/abstract.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Broker } from "./broker.entity";
import { User } from "./user.entity";
import { IntegratedBroker } from "src/common/globalConstants.constant";

//docs: https://dev.to/marienoir/understanding-relationships-in-typeorm-4873
@Entity("credential")
export class Credential extends AbstractEntity<Credential> {
    @ManyToOne(() => Broker, broker => broker.name)
    @JoinColumn({
        name: "broker_name",
    })
    brokerName: IntegratedBroker;

    @Column({
        name: "key_name",
    })
    keyName: string;

    @Column({
        name: "key_value",
    })
    keyValue: string;

    //-> when we are putting ManyToOne, 1st argument asks u to map with which table, 2nd arg asks u to show which parameter to take from th related joined table to consider it as a foreign key (generally we put the pk of the other table in this table to make it as fk)
    @ManyToOne(() => User, user => user.id)
    @JoinColumn()
    user: User;

    //_. this will generate userNameId table, which will work as foreign key for this table, referencing to User table
}
