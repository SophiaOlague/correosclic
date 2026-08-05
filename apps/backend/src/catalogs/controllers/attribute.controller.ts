import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ROLES } from '../../auth/constants/roles.constants';

import { AttributeService } from '../application/services/attribute.service';

import { CreateAttributeDto } from '../application/dto/create-attribute.dto';
import { CreateAttributeValueDto } from '../application/dto/create-attribute-value.dto';

/**
 * Escritura de la taxonomía de atributos.
 *
 * Ninguno de los dos endpoints estaba protegido como corresponde: el alta de
 * atributo solo exigía sesión —cualquier cliente podía crear uno— y el alta de
 * valores **no tenía guard alguno**, así que aceptaba peticiones anónimas pese
 * a colgar de una ruta `admin/`. Ambos respondían 201.
 *
 * La lectura vive en `CatalogAttributeController` (`GET /catalog/attributes`) y
 * sigue siendo pública: es el vocabulario que necesita cualquiera que clasifique
 * o filtre productos.
 */
@Controller('admin/catalog/attributes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.SUPER_ADMIN)
export class AttributeController {

  constructor(
    private readonly service: AttributeService,
  ) {}

  @Post()
  create(
    @Body()
    dto: CreateAttributeDto,
  ) {
    return this.service.create(dto);
  }

  @Post(':id/values')
  createValue(
    @Param('id', ParseUUIDPipe)
    attributeId: string,

    @Body()
    dto: CreateAttributeValueDto,
  ) {
    return this.service.createValue(
      attributeId,
      dto,
    );
  }
}
