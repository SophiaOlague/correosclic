export class PaymentIntentResponseDto {
  paymentId: string;
  paymentIntentId: string;
  clientSecret: string;
  status: string;
  amount: number;
  currency: string;
}
