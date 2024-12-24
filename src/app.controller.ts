import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { CustomConfigService as ConfigService } from './vault/custom-config.service';

@Controller()
export class AppController {
  constructor (
    private readonly appService: AppService,
    private readonly configService: ConfigService
  ) {}

  @Get()
  async getHello (): Promise<string> {
    console.log(`vault secret ${await this.configService.getOrThrow("PLACE_ORDER")}`); 
    return this.appService.getHello();
  }

  @Get("ping")
  getTesting(): string {
    return "for testing only";
  }
}
