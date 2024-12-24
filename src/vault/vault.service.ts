import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Mutex, MutexInterface } from "async-mutex";
import axios, { AxiosResponse } from "axios";
import { CustomLogger } from "../custom-logger.service";
import moment from "moment-timezone";

interface Secret<T> {
    secret: {
        name: string;
        type: string;
        latest_version: number;
        created_at: string;
        created_by_id: string;
        sync_status: Record<string, unknown>;
        static_version: {
            version: number;
            value: T;
            created_at: string;
            created_by_id: string;
        };
    };
}

@Injectable()
export class VaultService {
    constructor(
        private readonly configService: ConfigService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private readonly logger: CustomLogger = new CustomLogger(
            VaultService.name
        )
    ) {}

    private async getAccessToken(): Promise<string> {
        const keyName: string = "HCP_ACCESS_TOKEN";
        const release: MutexInterface.Releaser = await new Mutex().acquire();
        const cachedData: string = await this.cacheManager.get(keyName);
        if ( cachedData !== undefined ) {
            release();
            return cachedData;
        }
        const hcpAuthenticateUrl: string =
            "https://auth.idp.hashicorp.com/oauth2/token";

        const clientId: string =
            this.configService.getOrThrow<string>("HCP_CLIENT_ID");
        const clientSecret: string =
            this.configService.getOrThrow<string>("HCP_CLIENT_SECRET");

        const params = new URLSearchParams();
        params.append("grant_type", "client_credentials");
        params.append("client_id", clientId);
        params.append("client_secret", clientSecret);

        try {
            const {
                data: { access_token }
            }: AxiosResponse<{ access_token: string }> = await axios.post<{
                access_token: string;
            }>(hcpAuthenticateUrl, params, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            });

            this.cacheManager
                .set( keyName, access_token, 55 * 60 * 1000 )
                .then(() =>
                    this.logger.log(
                        `HCP ${keyName} is cached for 55 mins at ${moment().format(
                            "YYYY-MM-DD HH:mm"
                        )}`
                    )
                ).finally(() => release());

            return access_token;
        } catch (error) {
            this.logger.error(
                `Failed to get access token: ${(error as Error).message}`,
                (error as Error).stack
            );
        } finally {
        }
        return null;
    }

    /**
     * Get secret from vault
     *
     * @param {String} path - Path to the secret in vault
     * @returns data - Secret data
     */
    async getSecret<T> ( keyName: string, doCache: boolean, defaultValue?: T ): Promise<T> {
        let release: MutexInterface.Releaser;
        if ( doCache ) {
            release = await new Mutex().acquire();
            const cachedData: T = await this.cacheManager.get( keyName );
            if ( cachedData !== undefined ) {
                release();
                return cachedData;
            }
        }
        const orgId: string =
            this.configService.getOrThrow<string>("HCP_ORG_ID");
        const projectId: string =
            this.configService.getOrThrow<string>("HCP_PROJECT_ID");
        const appName: string =
            this.configService.getOrThrow<string>("HCP_APP_NAME");
        const hcpApiVersion: string =
            this.configService.getOrThrow<string>("HCP_API_VERSION");
        const hcpBaseUrl: string = "https://api.cloud.hashicorp.com";

        const apiUrl: string = `${hcpBaseUrl}/secrets/${hcpApiVersion}/organizations/${orgId}/projects/${projectId}/apps/${appName}/secrets/${keyName}:open`;

        const accessToken: string = await this.getAccessToken();
        const {
            data: {
                secret: {
                    static_version: { value }
                }
            }
        }: AxiosResponse<Secret<T>> = await axios.get<Secret<T>>(apiUrl, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });


        doCache && this.cacheManager
            .set(keyName, value, 55 * 60 * 1000)
            .then(() =>
                this.logger.log(
                    `HCP ${keyName} is cached for 55 mins at ${moment().format(
                        "YYYY-MM-DD HH:mm"
                    )}`
                )
            ).finally(() => release());

        return value || defaultValue;
    }
}
