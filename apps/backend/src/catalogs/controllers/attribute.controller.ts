import {
  Body,
  Controller,
  Param,
  Post,
  UseGuards,
  Get,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

import { AttributeService } from '../application/services/attribute.service';

import { CreateAttributeDto } from '../application/dto/create-attribute.dto';
import { CreateAttributeValueDto } from '../application/dto/create-attribute-value.dto';

@Controller('admin/catalog/attributes') //
export class AttributeController {

  constructor(
    private readonly service: AttributeService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body()
    dto: CreateAttributeDto,
  ) {
    return this.service.create(dto);
  }
 @Post(':id/values')
createValue(
  @Param('id')
  attributeId: string,

  @Body()
  dto: CreateAttributeValueDto,
) {
  return this.service.createValue(
    attributeId,
    dto,
  );
}

@Get('/catalog/attributes')
findAll() {
  return this.service.findAll();
}
}