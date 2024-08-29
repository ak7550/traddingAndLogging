import * as crypto from "crypto";
import { constant } from "lodash";


//TODO ==> implement actual methods, that will fetch these data
export const getPublicIp = (): string => "123.121.2.1.1";
export const getPrivateIp = (): string => "121.121.1.1.1";
export const getMacAddress = (): string => "process.env.MAC_ADDRESS";

type SaltType = "user" | "token" | "demat";

export const encryptData = ( data: string, saltType: SaltType ): string => {
    const algorithm = "aes-256-cbc";
    const key:string = process.env[ `${ saltType.toUpperCase() }_KEY` ]; //randomBytes(32).toString('hex)
    const keyBuffer: Buffer = Buffer.from( key, "hex" );
    const iv: string = process.env[ `${ saltType.toUpperCase() }_IV` ]; // randomBytes(16).toString('hex) => randomByters form crypto.js
    const ivBuffer: Buffer = Buffer.from( iv, "hex" );

    const cipher = crypto.createCipheriv(algorithm, keyBuffer, ivBuffer);
    const encrypted: Buffer = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
    return encrypted.toString("hex");
}

export const decryptData = ( encryptedMessage: string, saltType: SaltType ): string => {
    const algorithm = "aes-256-cbc";
    const key = process.env[`${saltType.toUpperCase()}_KEY`];
    const iv = process.env[ `${ saltType.toUpperCase() }_IV` ];
    const keyBuffer: Buffer = Buffer.from(key, "hex");
    const ivBuffer: Buffer = Buffer.from(iv, "hex");
    const encryptedText = Buffer.from(encryptedMessage, "hex");
    const decipher = crypto.createDecipheriv(algorithm, keyBuffer, ivBuffer);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf8');
}