import AbstractEntity from "src/database/abstract.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Broker } from "./broker.entity";
import { User } from "./user.entity";
import { decryptData, encryptData } from "src/common/globalUtility.utility";

//docs: https://typeorm.biunav.com/en/many-to-many-relations.html
@Entity({
    name: "demat_account",
})
export class DematAccount extends AbstractEntity<DematAccount> {
    @ManyToOne(() => User, user => user.id)
    @JoinColumn({ name: "user_id", referencedColumnName: "id" })
    user: User;

    @ManyToOne(() => Broker, broker => broker.name)
    @JoinColumn({ name: "broker_name", referencedColumnName: "name" })
    broker: Broker;

    //todo: finally make it false
    @Column({
        name: "account_number",
        comment: "associated_bank_account_number",
        nullable: true, // false
    })
    private _accountNumber: string;

    public get accountNumber(): string {
        return decryptData(this._accountNumber, "demat");
    }

    public set accountNumber(value: string) {
        this._accountNumber = encryptData(value, "demat");
    }

    //todo: finally make it false
    @Column({
        name: "demat_account_number",
        nullable: true,
    })
    private _dematAccountNumber: string;

    public get dematAccountNumber(): string {
        return decryptData(this._dematAccountNumber, "demat");
    }

    public set dematAccountNumber(value: string) {
        this._dematAccountNumber = encryptData(value, "demat");
    }

    //todo: finally make it false
    @Column({
        name: "dp_id",
        nullable: true,
    })
    private _dpId: string;

    public get dpId(): string {
        return decryptData(this._dpId, "demat");
    }
    public set dpId(value: string) {
        this._dpId = encryptData(value, "demat");
    }

    //todo: finally make it false
    @Column({
        name: "client_id",
        nullable: true,
    })
    private _clientId: string;

    public get clientId(): string {
        return decryptData(this._clientId, "demat");
    }

    public set clientId(value: string) {
        this._clientId = encryptData(value, "demat");
    }

    //todo: finally make it false
    @Column({
        name: "cdsl_tpin",
        nullable: true,
    })
    private _CDSLTpin: string;

    public get CDSLTpin(): string {
        return decryptData(this._CDSLTpin, "demat");
    }
    public set CDSLTpin(value: string) {
        this._CDSLTpin = encryptData(value, "demat");
    }

    @Column({
        name: "shares_bought",
        comment: "total amount of shares currently present in this account",
        nullable: true,
        default: 0
    })
    sharesBought: number;

    @Column({
        name: "remaining_amount",
        comment: "it says the amount remaining into the demat account wallet",
        nullable: true,
    })
    remainingAmount: number;

    @Column({
        name: "total_fund",
        comment:
            "total fund present into the demat account ==> holding shares + remaining account balance",
        nullable: true,
        default: 0
    })
    totalFund: number;
}
