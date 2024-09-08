import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { BrokerService } from './broker.service';
import { HttpStatusCode } from 'axios';
import CreateBrokerDto from './dto/create-broker.dto';
import { IntegratedBroker } from '../../common/globalConstants.constant';

@Controller('broker')
export class BrokerController {
  constructor(private readonly brokerService: BrokerService) {}

  //TODO: need code to handle error like scenarios, if there's any problem, the server is not supposed to stop, but handle it properly with an error response
  //TODO: create some middlewares who'll be checking if this routes should be open or not dynamically as per the environments
  @Post()
  async create(@Body() createBrokerDto: CreateBrokerDto): Promise<CreateBrokerDto> {
    try {
      await this.brokerService.create(createBrokerDto);
      return createBrokerDto;
  } catch (error) {
      throw new HttpException(
          HttpStatusCode.Forbidden.toString(),
          HttpStatus.FORBIDDEN,
      );
  }
  }

  @Get()
  findAll() {
    return this.brokerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: IntegratedBroker) {
    return this.brokerService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: IntegratedBroker) {
    return this.brokerService.remove(+id);
  }
}
