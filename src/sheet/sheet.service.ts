import { Injectable, Logger } from "@nestjs/common";
import {
    GoogleAuth,
    JSONClient,
} from "google-auth-library/build/src/auth/googleauth";
import { google, sheets_v4 } from "googleapis";

@Injectable()
export class SheetService {
    private readonly spreadsheetId: string;
    private readonly auth: GoogleAuth<JSONClient>;
    private readonly sheets: sheets_v4.Sheets;
    private readonly logger: Logger = new Logger(SheetService.name);

    constructor() {
        this.sheets = google.sheets("v4");
        this.spreadsheetId = process.env.SPREAD_SHEET_ID;
        this.auth = new google.auth.GoogleAuth({
            keyFile: "credentails.json",
            scopes: "https://www.googleapis.com/auth/spreadsheets",
        });
    }

    async getSheetData(range: string = "Sheet1!A:D"): Promise<any[][]> {
        try {
            const response = await this.sheets.spreadsheets.values.get({
                auth: this.auth,
                spreadsheetId: this.spreadsheetId,
                range,
            });

            this.logger.log("response received from google sheet!!");
            return response.data.values;
        } catch (error) {
            this.logger.error(
                "error occureced while reading the data from google sheet",
                error,
            );
        }
    }
}
