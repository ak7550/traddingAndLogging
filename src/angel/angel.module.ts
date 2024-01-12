import { Logger, Module } from "@nestjs/common";
import { UserModule } from "src/user/user.module";
import AngelService from "./angel.service";
import AxiosFactory from "./axios-factory.service";
import AngelRequestHandler from "./request-handler.service";

@Module({
    imports: [
        UserModule
    ],
    // providers are the classes that can be Injected into this module.
    providers: [ AngelService, AngelRequestHandler, AxiosFactory, Logger ],
    // exports are the classes, which are part of this module, can be imported to some other module
    exports: [AngelService],
})
export default class AngelModule {}
