import { Injectable } from "@nestjs/common";
import AngelService from "./angel.service";
import { Cron, SchedulerRegistry } from "@nestjs/schedule";

@Injectable()
export default class AngelScheduler {
    constructor(
        private readonly angelService: AngelService,
        private readonly schedulerRegistry: SchedulerRegistry,
    ) {}

    @Cron("0 30 10 ? * MON,TUE,WED,THU,FRI *", {
        name: "Angel Daily Stop loss order",
        timeZone: "Asia/Kolkata",
    })
    private placeDailyStopLossOrder() {
        this.angelService.placeDailyStopLossOrders();
    }
}