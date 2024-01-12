import AbstractEntity from "src/database/abstract.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, UpdateDateColumn } from "typeorm";
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
        length: 4000, // max size of a jwt token can be 7kb
    })
    keyValue: string;

    //_. this will generate accountId table, which will work as foreign key for this table, referencing to User table

    @ManyToOne(() => DematAccount, demat => demat.id)
    @JoinColumn({
        name: "account_id",
    })
    account: DematAccount;

    // Add these columns for automatic timestamp tracking
    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    createdAt: Date;

    @UpdateDateColumn({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP(6)",
        onUpdate: "CURRENT_TIMESTAMP(6)",
    })
    updatedAt: Date;
}
