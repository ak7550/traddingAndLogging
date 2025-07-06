import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { VaultService } from "./vault.service";
import { CustomLogger } from "../custom-logger.service";
import utils from 'util';
import _ from "lodash";

@Injectable()
export class CustomConfigService {
    private isProduction: boolean;

    constructor(
        private readonly configService: ConfigService,
        private readonly vaultService: VaultService,
        private readonly logger: CustomLogger = new CustomLogger(CustomConfigService.name)
    ) {
        this.isProduction = process.env.NODE_ENV === "prod";
    }

    async getOrThrow<T>(keyName: string, defaultValue?: T): Promise<T> {
        const shouldNotCache: string[] = [
            // "REDIS_HOST",
            // "REDIS_PORT",
            "DB_HOST",
            "DB_PORT",
            "DB_PASSWORD",
            "DB_NAME",
            "DB_USER",
            "DB_SYNCHRONIZE"
        ];
        let data: T = this.configService.get<T>( keyName );
        if ( data !== undefined && !_.isEmpty(data)) {
            return data;
        }

        try {
            data = this.isProduction
                ? await this.vaultService.getSecret<T>(
                      keyName,
                      !shouldNotCache.includes(keyName), defaultValue
                  )
                : this.configService.getOrThrow<T>(keyName, defaultValue);
        } catch ( error ) {
            this.logger.error( `Faced error while pulling ${ keyName } from configModule, ${utils.inspect(error, {depth: 4, colors: true})}` );
            data = defaultValue;
        }
        return data;
    }
}
