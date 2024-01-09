import AbstractEntity from "src/database/abstract.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { DematAccount } from "./demat-account";

//docs: https://dev.to/marienoir/understanding-relationships-in-typeorm-4873
@Entity("credential")
export class Credential extends AbstractEntity<Credential> {
    @Column({
        name: "key_name",
    })
    keyName: string;

    @Column({
        name: "key_value",
    })
    keyValue: string;

    //_. this will generate accountId table, which will work as foreign key for this table, referencing to User table

    @ManyToOne(() => DematAccount, demat => demat.id)
    @JoinColumn({
        name: "account_id",
    })
    account: DematAccount;
}
