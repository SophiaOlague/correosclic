export class PaymentStatusDto {
  paymentId: string;
  paymentIntentId: string | null;
  status: string;
  amount: number;
  currency: string;
  metodoPago: string | null;
  mensajeError: string | null;
}
