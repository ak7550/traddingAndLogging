import { Module } from "@nestjs/common";
import { AngelService } from "./angel.service";
import { AngelRequestHandler } from "./requestaHandler.service";
import { AxiosFactory } from "./axios-factory.service";

@Module({
    providers: [AngelService, AngelRequestHandler, AxiosFactory],
    exports: [AngelService]
})

export class AngelModule{}