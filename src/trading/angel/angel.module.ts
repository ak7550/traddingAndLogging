import { Logger, Module } from "@nestjs/common";
import { AngelController } from './angel.controller';
import AngelService from "./angel.service";
import AxiosFactory from "./axios-factory.service";
import AngelRequestHandler from "./request-handler.service";
import AngelScheduler from "./scheduler.service";
import { EntityModule } from "../../entities/entity.module";

@Module({
    imports: [
        EntityModule
    ],
    // providers are the classes that can be Injected into this module.
    providers: [ AngelService, AngelScheduler, AngelRequestHandler, AxiosFactory, Logger],
    // exports are the classes, which are part of this module, can be imported to some other module
    exports: [AngelService],
    controllers: [AngelController],
})
export default class AngelModule {}
