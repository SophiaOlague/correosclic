import { EstadoEnvio } from '@correosclic/database';

export class ShipmentSummaryDto {
  id!: string;
  trackingInterno!: string;
  estado!: EstadoEnvio;
  vendedorId?: string;
  fechaEntregaEstimada?: Date | null;
  fechaEntregaReal?: Date | null;
  createdAt?: Date;
}
