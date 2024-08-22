import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpException } from '@nestjs/common';
import { DematService } from './demat.service';
import CreateDematAccountDto from './dto/create-demat-account.dto';
import { HttpStatusCode } from 'axios';
import { UpdateDematDto } from './dto/update-demat.dto';

@Controller('demat')
export class DematController {
  constructor(private readonly dematService: DematService) {}

  //TODO
  @Post()
    async createUserBrokerRelationShip(
        @Body()
        dematAccountDto: CreateDematAccountDto,
    ): Promise<CreateDematAccountDto | string> {
        try {
            return await this.dematService.create(dematAccountDto);
        } catch (error) {
            throw new HttpException(
                HttpStatusCode.Forbidden.toString(),
                HttpStatus.FORBIDDEN,
            );
        }
    }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dematService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDematDto: UpdateDematDto) {
    return this.dematService.update(+id, updateDematDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dematService.remove(+id);
  }
}
