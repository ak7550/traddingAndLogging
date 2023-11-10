import { Module } from "@nestjs/common";
import DhaanService from "./dhaan.service";
import DhaanRequestHandler from "./requestHandler.service";

@Module({
    providers: [DhaanService, DhaanRequestHandler],
    exports: [DhaanService],
})
export default class DhaanModule {}
