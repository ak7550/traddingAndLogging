import { Column, Entity } from "typeorm";
import { decryptData, encryptData } from "../../../common/globalUtility.utility";
import AbstractEntity from "../../../database/abstract.entity";

@Entity({
    name: "user",
})
export class User extends AbstractEntity<User> {
    @Column({
        name: "first_name",
    })
    firstName: string;

    @Column({
        name: "middle_name",
        nullable: true,
    })
    middleName: string;

    @Column({
        name: "last_name",
        nullable: true,
    })
    lastName: string;

    @Column( {
        name: "pan_card_no",
        nullable: true
    } )
    private _panCardNumber: string;

    public get panCardNumber (): string {
        return decryptData(this._panCardNumber, "user");
    }
    public set panCardNumber ( value: string ) {
        this._panCardNumber = encryptData(value, "user");
    }

    @Column( {
        nullable: true, // make it false in prod
        name: "address",
        length: 400
    } )
    private _address: string;

    public get address (): string {
        return decryptData(this._address, "user");
    }
    public set address ( value: string ) {
        this._address = encryptData(value, "user");
    }

    @Column( {
        name: "encrypted_password",
        nullable: true, // make it false in prod
    } )
    private _password: string;

    public get password (): string {
        return decryptData(this._password, "user");
    }
    public set password ( value: string ) {
        this._password = encryptData(value, "user");
    }

    toJSON(){
        return {
            id: this.id,
            passwrd: this.password,
            pancard: this.panCardNumber
        }
    }

    // @ManyToMany(() => Broker, broker => broker.name, { cascade: true })
    // @JoinTable({
    //     name: "user_broker",
    //     joinColumn: { name: "user_id", referencedColumnName: "id" },
    //     inverseJoinColumn: {
    //         name: "broker_name",
    //         referencedColumnName: "name",
    //         // foreignKeyConstraintName: "custom_user_broker_fk",
    //     },
    // })
    // brokers: Broker[];

    // @OneToMany(() => UserBroker, userBroker => userBroker.user)
    // userBrokers: UserBroker[];
}
