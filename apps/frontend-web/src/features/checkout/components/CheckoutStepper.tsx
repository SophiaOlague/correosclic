import { Check } from 'lucide-react';

/**
 * Indicador de pasos del diseño de Figma.
 *
 * Se conservan los cuatro pasos originales para no romper el diseño, pero solo
 * los dos primeros tienen respaldo en el contrato actual: `GET /checkout` llega
 * hasta el resumen. "Pago" y "Confirmación" se muestran atenuados hasta que se
 * integren `POST /orders` (Módulo 5) y `POST /payments/intent` (Módulo 6).
 */
const STEPS = [
  { n: 1, label: 'Dirección', disponible: true },
  { n: 2, label: 'Envío', disponible: true },
  { n: 3, label: 'Pago', disponible: false },
  { n: 4, label: 'Confirmación', disponible: false },
];

export function CheckoutStepper({ current }: { current: number }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5 mb-8 shadow-sm">
      <div className="flex items-center justify-between relative max-w-3xl mx-auto">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-[#F5F6F8] -z-10" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 transition-all duration-500"
          style={{ width: `${((current - 1) / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step) => (
          <div key={step.n} className="flex flex-col items-center gap-2 relative bg-white px-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 border-2 ${
                current > step.n
                  ? 'bg-primary border-primary text-white'
                  : current === step.n
                    ? 'bg-white border-primary text-primary'
                    : 'bg-white border-[#F5F6F8] text-muted-foreground'
              } ${step.disponible ? '' : 'opacity-50'}`}
            >
              {current > step.n ? <Check className="w-4 h-4" /> : step.n}
            </div>
            <span
              className={`text-xs font-semibold absolute top-10 whitespace-nowrap ${
                current >= step.n ? 'text-foreground' : 'text-muted-foreground'
              } ${step.disponible ? '' : 'opacity-50'}`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
