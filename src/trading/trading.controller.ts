import {
    Body,
    Controller,
    Get,
    Headers,
    Ip,
    Param,
    Post,
    Put,
    Query
} from "@nestjs/common";
import GlobalConstant, { tradingViewWebhookIp } from "../common/globalConstants.constant";
import Strategy, { daily21EMARetestBuy, strategies } from "../common/strategies";
import AlertRequestDTO from "./dtos/alert.request.dto";
import HoldingInfoDTO from "./dtos/holding-info.dto";
import OrderResponseDTO from "./dtos/order.response.dto";
import { TradingService } from './trading.service';

//docs: [how to handle exception and exception filters in Nest](https://docs.nestjs.com/exception-filters)
@Controller("trading")
export default class TradingController {
    constructor(
        private readonly tradingService: TradingService
    ) { }

    @Get("holdings/user/:userId")
    async getAllHoldings(
        @Param( 'userId' ) userId: number,
        @Query(GlobalConstant.BROKER)
        broker: string
    ): Promise<HoldingInfoDTO[]> {
        return await this.tradingService.getHoldings( userId, broker );
    }

    @Put("update-credentials")
    async updateCredentials(): Promise<string> {
        // await this.schedular.updateCredentials();
        return "credentials updated successfully for all the existing users of Angel";
    }

    @Get("hi")
    public sayhi(): string {
        return "hello";
    }

    @Post( "order" )
    public async placeOrder (
        @Query( 'user' ) userId: number,
        @Query('broker') broker: string,
        @Body() strategyNumber: number[] 
    ): Promise<OrderResponseDTO[]> {
        const strategy: Strategy[] = strategyNumber.reduce((acc, val) => {
                    if(val<strategies.length){
                        acc.push(strategies[val]);
                    }
                    return acc;
                }, []);
        return await this.tradingService.placeOrders(strategy, userId, broker);
    }

    //TODO: make sure that we get the webhook payload in json format,
    //DOCS: https://www.tradingview.com/support/solutions/43000529348-about-webhooks/
    //DOCS: https://stackoverflow.com/questions/73495506/how-to-get-client-ip-in-nestjs
    @Post('tradingview')
    public async tradingViewAlert(@Body() body: AlertRequestDTO, @Ip() ip: string, @Headers('content-type') contentType: string){
        const ipV6Prefix = '::ffff:';
        if(ip.includes(ipV6Prefix)){
            ip = ip.split(ipV6Prefix)[1];
        }
        if(tradingViewWebhookIp.includes(ip) && contentType === 'application/json'){
            this.tradingService.handleTradingViewAlert(body);
        }
    }
}
