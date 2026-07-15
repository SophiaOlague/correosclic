import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';

import { AttributeService } from '../application/services/attribute.service';

@Controller('catalog/attributes')
export class CatalogAttributeController {

  constructor(
    private readonly service: AttributeService,
  ) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id/values')
findValuesByAttributeId(
  @Param('id')
  attributeId: string,
) {
  return this.service.findValuesByAttributeId(
    attributeId,
  );
}
}