import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    JoinColumn,
    ManyToOne
} from "typeorm";
import { DematAccount } from "../demat/entities/demat-account.entity";
import { decryptData, encryptData } from "../../common/globalUtility.utility";
import AbstractEntity from "../../database/abstract.entity";
import moment from "moment-timezone";

//docs: https://dev.to/marienoir/understanding-relationships-in-typeorm-4873
@Entity("credential")
export class Credential extends AbstractEntity<Credential> {
    @Column({
        name: "key_name",
        length: 255,
        type: "varchar",
    })
    keyName: string;

    @Column({
        name: "key_value",
        type: "varchar",
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
        this.createdAt = moment().toDate();
    }

    @BeforeUpdate()
    setUpdatedAt() {
        this.updatedAt = moment().toDate();
    }

    toJSON() {
        return {
            keyName: this.keyName,
            keyValue: this.keyValue,
            id: this.id,
            demat: this.account
        }
    }
}
