import { Module } from "@nestjs/common";
import AngelService from "./angel.service";
import AxiosFactory from "./axios-factory.service";
import AngelRequestHandler from "./request-handler.service";

@Module({
    providers: [AngelService, AngelRequestHandler, AxiosFactory],
    exports: [AngelService],
})
export default class AngelModule {}
