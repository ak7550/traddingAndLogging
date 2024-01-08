import AbstractEntity from "src/database/abstract.entity";
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne
} from "typeorm";
import { Broker } from "./broker.entity";
import { User } from "./user.entity";

@Entity({
    name: "demat_account",
})
export class UserBroker extends AbstractEntity<UserBroker>{
    @ManyToOne(() => User, user => user.userBrokers)
    @JoinColumn({ name: "user_id", referencedColumnName: "id" })
    user: User;

    @ManyToOne(() => Broker, broker => broker.userBrokers)
    @JoinColumn({ name: "broker_name", referencedColumnName: "name" })
    broker: Broker;

    @Column( {
        name: "account_number",
        nullable: true // false
    })
    accountNumber: string;

    @Column( {
        name: "demat_account_number"
    } )
    dematAccountNumber: string;

    @Column( {
        name: "dp_id"
    } )
    dpId: string;

    @Column( {
        name: "client_id"
    } )
    clientId: string;

    @Column( {
        name: "encrypted_cdsl_tpin"
    } )
    encryptedCDSLTpin: string;

    @Column( {
        name: "shares_bought",
        comment: "total amount of shares currently present in this account"
    } )
    sharesBought: number;

    @Column( {
        name: "remaining_amount",
        comment: "it says the amount remaining into the demat account wallet"
    } )
    remainingAmount: number;

    @Column( {
        name: "total_fund",
        comment: "total fund present into the demat account ==> holding shares + remaining account balance"
    } )
    totalFund: number;
}
