import { Logger, Module } from "@nestjs/common";
import { AngelController } from './angel.controller';
import AngelService from "./angel.service";
import AxiosFactory from "./axios-factory.service";
import AngelRequestHandler from "./request-handler.service";
import AngelScheduler from "./scheduler.service";
import { CredentialModule } from "src/entities/credential/credential.module";
import { DematModule } from "src/entities/demat/demat.module";
import { BrokerModule } from "src/entities/broker/broker.module";

@Module({
    imports: [
        CredentialModule,
        DematModule,
        BrokerModule
    ],
    // providers are the classes that can be Injected into this module.
    providers: [ AngelService, AngelScheduler, AngelRequestHandler, AxiosFactory, Logger],
    // exports are the classes, which are part of this module, can be imported to some other module
    exports: [AngelService],
    controllers: [AngelController],
})
export default class AngelModule {}
