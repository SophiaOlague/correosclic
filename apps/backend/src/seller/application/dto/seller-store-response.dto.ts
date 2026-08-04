export class SellerStoreResponseDto {
  id!: string;
  codigoPublico!: string;
  nombre!: string;
  descripcion!: string | null;
  logoUrl!: string | null;
  activa!: boolean;
  createdAt!: Date;
}
