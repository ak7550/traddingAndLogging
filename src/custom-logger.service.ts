import { Injectable, Logger, Scope } from '@nestjs/common';
import * as fs from "fs-extra";
import path from "path";

@Injectable({ scope: Scope.TRANSIENT })
export class CustomLogger extends Logger {
    private logFilePath: string;

    constructor(context: string) {
        super(context);
        this.logFilePath = this.createLogFilePath();
    }

    private createLogFilePath(): string {
        const today: string = new Date().toISOString().split("T")[0];
        const logDir = path.resolve(__dirname, "../logs"); // Customize your log directory if needed
        fs.ensureDirSync( logDir );
        return path.join(logDir, `${today}-logs.csv`);
    }

    private writeToLogFile(
        level: string,
        message: string,
        context?: string
    ): void {
        const timestamp = new Date().toISOString();
        const logEntry = `"${timestamp}","${level}","${
            context || ""
        }","${message}"\n`;

        // Ensure the log file exists and write log entry
        fs.appendFileSync(this.logFilePath, logEntry, { encoding: "utf8" });
    }

    log(message: string, context?: string): void {
        super.log(message, context);
        this.writeToLogFile("LOG", message, context);
    }

    error(message: string, trace?: string, context?: string): void {
        super.error(message, trace, context);
        this.writeToLogFile("ERROR", `${message} - ${trace}`, context);
    }

    warn(message: string, context?: string): void {
        super.warn(message, context);
        this.writeToLogFile("WARN", message, context);
    }

    debug(message: string, context?: string): void {
        super.debug(message, context);
        this.writeToLogFile("DEBUG", message, context);
    }

    verbose(message: string, context?: string): void {
        super.verbose(message, context);
        this.writeToLogFile("VERBOSE", message, context);
    }
}
