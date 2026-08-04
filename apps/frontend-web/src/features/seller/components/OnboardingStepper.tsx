import { Check } from 'lucide-react';

import {
  ONBOARDING_STEPS,
  stepIndex,
  type OnboardingStepKey,
} from '../lib/onboarding-steps';

/**
 * Indicador de progreso del onboarding.
 *
 * Conserva el stepper del diseño de Figma —círculos unidos por una barra que
 * se rellena— pero con los tres pasos reales del backend en vez de los cuatro
 * del mockup, cuyo último tramo ("Panel Vendedor") no es un paso del proceso
 * sino su consecuencia.
 */
export function OnboardingStepper({ current }: { current: OnboardingStepKey }) {
  const actual = stepIndex(current);
  const total = ONBOARDING_STEPS.length;
  const progreso = total > 1 ? (actual / (total - 1)) * 100 : 0;

  return (
    <ol className="relative flex justify-between items-start mb-10">
      <div
        aria-hidden
        className="absolute top-5 left-0 right-0 h-1 bg-[#F5F6F8] rounded-full"
      />
      <div
        aria-hidden
        className="absolute top-5 left-0 h-1 bg-primary rounded-full transition-all duration-500"
        style={{ width: `${progreso}%` }}
      />

      {ONBOARDING_STEPS.map((paso, index) => {
        const completado = index < actual;
        const esActual = index === actual;
        const Icon = paso.icon;

        return (
          <li
            key={paso.key}
            className="relative z-10 flex flex-col items-center gap-3 flex-1 px-1"
            aria-current={esActual ? 'step' : undefined}
          >
            <span
              className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-colors ${
                completado
                  ? 'bg-[#006847] text-white'
                  : esActual
                    ? 'bg-primary text-white'
                    : 'bg-[#F5F6F8] text-muted-foreground'
              }`}
            >
              {completado ? <Check className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
            </span>

            <span className="text-center">
              <span
                className={`block text-xs font-bold ${
                  esActual ? 'text-primary' : 'text-foreground'
                }`}
              >
                {paso.label}
              </span>
              <span className="hidden sm:block text-[11px] text-muted-foreground mt-0.5 leading-snug">
                {paso.description}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
