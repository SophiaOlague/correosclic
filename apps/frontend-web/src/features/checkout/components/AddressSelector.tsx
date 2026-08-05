import { Check, MapPin, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { EmptyState } from '@/components/common/EmptyState';
import type { CheckoutAddressDto } from '@/types/checkout';

/**
 * Selección de la dirección de entrega.
 *
 * El diseño de Figma traía un formulario editable (nombre, calle, colonia, CP,
 * ciudad…), pero el backend **no expone alta ni edición de direcciones**: lo
 * único disponible es `GET /checkout/addresses`, que devuelve la dirección ya
 * compuesta en una sola cadena. Por eso aquí se eligen entre las existentes,
 * con las mismas tarjetas seleccionables del resto del diseño.
 *
 * TODO: Backend integration pending — faltan `POST/PATCH/DELETE /addresses`.
 */
export function AddressSelector({
  addresses,
  selectedId,
  onSelect,
  isLoading,
  isRecalculating,
}: {
  addresses: CheckoutAddressDto[];
  selectedId: string | undefined;
  onSelect: (direccionId: string) => void;
  isLoading: boolean;
  isRecalculating: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
      <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-primary" /> Dirección de envío
      </h2>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="h-20 bg-[#F5F6F8] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No tienes direcciones registradas"
          description="Necesitas una dirección de entrega para calcular el envío y completar tu compra."
        />
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => {
            const isSelected = address.id === selectedId;

            return (
              <label
                key={address.id}
                className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                } ${isRecalculating ? 'opacity-60 pointer-events-none' : ''}`}
              >
                <input
                  type="radio"
                  name="direccion"
                  className="sr-only"
                  checked={isSelected}
                  onChange={() => onSelect(address.id)}
                />

                <div
                  className={`w-5 h-5 mt-0.5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                    isSelected ? 'border-primary bg-primary' : 'border-border'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-foreground">{address.alias ?? 'Dirección'}</p>
                    {address.esPrincipal && (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-[#006847] bg-[#006847]/10 px-2 py-0.5 rounded-full">
                        Principal
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {address.direccionFormateada ?? 'Sin dirección registrada'}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      )}

      {/* TODO: Backend integration pending — no existe endpoint para crear direcciones. */}
      <button
        type="button"
        onClick={() =>
          toast.info('El alta de direcciones estará disponible próximamente.')
        }
        className="mt-4 flex items-center gap-2 text-sm font-bold text-primary hover:underline"
      >
        <Plus className="w-4 h-4" /> Agregar una dirección nueva
      </button>
    </div>
  );
}
