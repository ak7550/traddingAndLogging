import AbstractEntity from "src/database/abstract.entity";
import { Column, Entity } from "typeorm";

//todo: put encryption
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

    @Column({
        name: "pan_card_no",
    })
    panCardNumber: string;

    @Column({
        nullable: true, // make it false in prod
    })
    address: string;

    @Column({
        name: "encrypted_password",
        nullable: true, // make it false in prod
    })
    encryptedPassword: string;

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
