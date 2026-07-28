export class OrderListItemDto {
  orderId: string;
  orderNumber: string;
  fecha: Date;
  estado: string;
  total: number;
  cantidadArticulos: number;
  numeroVendedores: number;
  miniaturaUrl: string | null;
}

export class OrderListResponseDto {
  orders: OrderListItemDto[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
