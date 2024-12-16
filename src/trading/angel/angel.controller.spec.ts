import { Test } from "@nestjs/testing";
import { AngelController } from "./angel.controller";

describe('AngelController', () => {
    let controller : AngelController;
    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [AngelController]
        }).compile();

        controller = moduleRef.get<AngelController>(AngelController);
    });

    afterAll(async () => {

    });
});