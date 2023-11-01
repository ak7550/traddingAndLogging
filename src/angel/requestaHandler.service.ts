import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class AngelRequestHandler{
    private readonly logger: Logger = new Logger(AngelRequestHandler.name);

    async execute<Type> (){
        
    }
}