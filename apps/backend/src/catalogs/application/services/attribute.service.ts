import {
  Injectable,
} from '@nestjs/common';

import { AttributeRepository } from '../../infrastructure/repositories/attribute.repository';

import { CreateAttributeDto } from '../dto/create-attribute.dto';
import { AttributeResponseDto } from '../dto/attribute-response.dto';

import { AttributeAlreadyExistsException } from '../../domain/exceptions/attribute-already-exists.exception';

import { CreateAttributeValueDto } from '../dto/create-attribute-value.dto';
import { AttributeValueResponseDto } from '../dto/attribute-value-response.dto';

import { AttributeValueAlreadyExistsException } from '../../domain/exceptions/attribute-value-already-exists.exception';
import { AttributeListItemDto } from '../dto/attribute-list-item.dto';
import { AttributeValueListItemDto } from '../dto/attribute-value-list-item.dto';

@Injectable()
export class AttributeService {

  constructor(
    private readonly repository: AttributeRepository,
  ) {}

  async create(
    dto: CreateAttributeDto,
  ): Promise<AttributeResponseDto> {

    const nombre =
      this.normalizeText(
        dto.nombre,
      );

    const existing =
      await this.repository.findByName(
        nombre,
      );

    if (existing) {
      throw new AttributeAlreadyExistsException();
    }

    const attribute =
      await this.repository.create(
        nombre,
      );

    return {
      id: attribute.id,
      nombre: attribute.nombre,
      createdAt: attribute.createdAt,
    };
  }

  async createValue(
    attributeId: string,
    dto: CreateAttributeValueDto,
  ): Promise<AttributeValueResponseDto> {

    const valor =
      this.normalizeText(
        dto.valor,
      );

    const existing =
      await this.repository.findValue(
        attributeId,
        valor,
      );

    if (existing) {
      throw new AttributeValueAlreadyExistsException();
    }

    const value =
      await this.repository.createValue(
        attributeId,
        valor,
      );

    return {
      id: value.id,
      atributoId: value.atributoId,
      valor: value.valor,
      createdAt: value.createdAt,
    };
  }

  private normalizeText(
    value: string,
  ): string {

    return value
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .replace(
        /\b\w/g,
        letter => letter.toUpperCase(),
      );
  }

  async findAll(): Promise<
  AttributeListItemDto[]
> {

  const attributes =
    await this.repository.findAll();

  return attributes.map(attribute => ({
    id: attribute.id,
    nombre: attribute.nombre,
  }));

}

async findValuesByAttributeId(
  attributeId: string,
): Promise<AttributeValueListItemDto[]> {

  const values =
    await this.repository.findValuesByAttributeId(
      attributeId,
    );

  return values.map(value => ({
    id: value.id,
    valor: value.valor,
  }));

}
}