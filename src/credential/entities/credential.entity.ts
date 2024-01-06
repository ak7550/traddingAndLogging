import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Credential {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    brokerName: string;

    constructor(credential: Partial<Credential>) {
        Object.assign(this, credential);
    }
}
