import { Module } from "@nestjs/common";
import { AngelService } from "./angel.service";
import { AngelRequestHandler } from "./requestaHandler.service";

@Module({
    providers: [AngelService, AngelRequestHandler],
    exports: [AngelService]
})

export class AngelModule{}