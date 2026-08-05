import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Loader2, Lock } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { formatMoney } from '@/utils/format';

/**
 * Formulario de pago.
 *
 * Stripe Elements es lo único que toca los datos de la tarjeta: viajan del
 * iframe de Stripe directo a sus servidores y nunca pasan por nuestro código,
 * nuestro estado ni nuestra red. Aquí no hay lógica PCI propia.
 *
 * `confirmPayment` devuelve el resultado de Stripe, pero ese resultado **no se
 * usa para dar el pago por bueno**: solo sirve para saber que la confirmación
 * salió sin error del lado del cliente. Quien decide es el webhook, y por eso
 * al terminar se avisa al contenedor para que empiece a sondear al backend.
 */
export function PaymentForm({
  amount,
  currency,
  returnUrl,
  onConfirmed,
}: {
  amount: number;
  currency: string;
  returnUrl: string;
  onConfirmed: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listo, setListo] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || enviando) return;

    setEnviando(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
      // Con tarjeta la confirmación se resuelve aquí; solo se redirige si el
      // método lo exige (por ejemplo un 3D Secure que no cabe en modal).
      redirect: 'if_required',
    });

    if (stripeError) {
      // `card_error` y `validation_error` traen un mensaje pensado para el
      // usuario final; el resto son fallos que no conviene detallar.
      const esMostrable =
        stripeError.type === 'card_error' || stripeError.type === 'validation_error';

      setError(
        esMostrable && stripeError.message
          ? stripeError.message
          : 'No pudimos procesar tu pago. Revisa los datos e inténtalo de nuevo.',
      );

      setEnviando(false);
      return;
    }

    // Sin error de Stripe: a partir de aquí manda el backend.
    onConfirmed();
    setEnviando(false);
  };

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-border p-6 shadow-sm">
      <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
        <Lock className="w-5 h-5 text-primary" /> Datos de pago
      </h2>

      <PaymentElement
        options={{
          layout: 'tabs',
          // Solo tarjeta en esta primera integración. Los métodos asíncronos
          // (OXXO, SPEI) y las wallets quedan fuera del frontend por ahora.
          paymentMethodOrder: ['card'],
          fields: { billingDetails: 'auto' },
        }}
        onReady={() => setListo(true)}
      />

      {error && (
        <p role="alert" className="mt-4 text-sm font-semibold text-destructive">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || !listo || enviando}
        className="w-full mt-6 bg-primary text-white h-14 rounded-xl font-bold hover:bg-[#C4006A] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {enviando ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Procesando pago...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            Pagar {formatMoney(amount, { cents: true })}
          </>
        )}
      </button>

      <p className="mt-3 text-xs text-center text-muted-foreground">
        Pago procesado por Stripe en {currency}. CorreosClic no almacena los datos de tu tarjeta.
      </p>
    </form>
  );
}
