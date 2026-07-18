export class CategoryResponseDto {
  readonly id: string;

  readonly nombre: string;

  readonly slug: string;

  readonly descripcion?: string;

  readonly parentId?: string;

  readonly activa: boolean;

  readonly createdAt: Date;
}