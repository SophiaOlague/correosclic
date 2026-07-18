import { Injectable } from '@nestjs/common';

import { ProductoImagen } from '@correosclic/database';

import { ProductImageDto } from '../dto/product-image.dto';

@Injectable()
export class ProductImageMapper {

  toDto(
    image: ProductoImagen,
  ): ProductImageDto {

    return {

      id: image.id,

      url: image.url,

      esPrincipal: image.esPrincipal,

      orden: image.orden,

    };

  }

}