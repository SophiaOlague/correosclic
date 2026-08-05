/**
 * Marca de actividad de un registro de la red operativa.
 *
 * Las etiquetas se pasan desde fuera porque el género cambia con el sujeto
 * ("sucursal activa", "vehículo activo").
 */
export function ActiveBadge({
  activo,
  etiquetas,
}: {
  activo: boolean;
  etiquetas: { si: string; no: string };
}) {
  return (
    <span
      className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-md ${
        activo ? 'bg-[#006847]/10 text-[#006847]' : 'bg-[#F5F6F8] text-muted-foreground'
      }`}
    >
      {activo ? etiquetas.si : etiquetas.no}
    </span>
  );
}
