import { PartialType } from '@nestjs/mapped-types';
import CreateDematAccountDto from './create-demat-account.dto';


export class UpdateDematDto extends PartialType(CreateDematAccountDto) {}
