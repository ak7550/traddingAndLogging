import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
    GoogleAuth,
    JSONClient
} from "google-auth-library/build/src/auth/googleauth";
import { google, sheets_v4 } from "googleapis";
import { CustomLogger } from "../custom-logger.service";

@Injectable()
export class SheetService {
    private readonly spreadsheetId: string;
    private readonly auth: GoogleAuth<JSONClient>;
    private readonly sheets: sheets_v4.Sheets;
    private readonly logger: CustomLogger = new CustomLogger(SheetService.name);

    constructor(private readonly configService: ConfigService) {
        this.sheets = google.sheets("v4");
        this.spreadsheetId =
            this.configService.getOrThrow<string>("SPREAD_SHEET_ID");
        this.auth = new google.auth.GoogleAuth({
            keyFile: "credentails.json",
            scopes: "https://www.googleapis.com/auth/spreadsheets"
        });
    }

    async getSheetData(range: string = "Sheet1!A:D"): Promise<any[][]> {
        try {
            const response = await this.sheets.spreadsheets.values.get({
                auth: this.auth,
                spreadsheetId: this.spreadsheetId,
                range
            });

            this.logger.verbose("response received from google sheet!!");
            return response.data.values;
        } catch (error) {
            this.logger.error(
                "error occureced while reading the data from google sheet",
                `${error}`
            );
        }
    }
}
