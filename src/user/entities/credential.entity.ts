import { decryptData, encryptData } from "src/common/globalUtility.utility";
import AbstractEntity from "src/database/abstract.entity";
import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    JoinColumn,
    ManyToOne
} from "typeorm";
import { DematAccount } from "./demat-account.entity";

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
    private _keyValue: string;

    public get keyValue(): string {
        return decryptData(this._keyValue, "token");
    }

    public set keyValue(value: string) {
        this._keyValue = encryptData(value, "token");
    }

    //_. this will generate accountId table, which will work as foreign key for this table, referencing to User table
    @ManyToOne(() => DematAccount, demat => demat.id)
    @JoinColumn({
        name: "account_id",
    })
    account: DematAccount;

    @Column({ type: "date", default: null })
    createdAt: Date;

    @Column({ type: "date", default: null })
    updatedAt: Date;

    @BeforeInsert()
    setCreatedAt() {
        this.createdAt = new Date();
    }

    @BeforeUpdate()
    setUpdatedAt() {
        this.updatedAt = new Date();
    }
}
