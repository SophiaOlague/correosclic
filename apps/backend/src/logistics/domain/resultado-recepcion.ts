/**
 * Lo que el recepcionista certifica al escanear una guía. No es un enum de
 * Prisma: no se persiste como tal, sino que determina a qué `EstadoEnvio`
 * queda el envío tras la recepción.
 *
 * El recepcionista sigue sin tomar ninguna decisión logística -- no elige
 * ruta, ni vehículo, ni repartidor. Solo constata en cuál de los tres estados
 * físicos llegó el paquete.
 */
export enum ResultadoRecepcion {
  /** Paquete en buen estado: entra a la red y el motor sigue su curso. */
  ACEPTADO = 'ACEPTADO',
  /** Paquete recibido con daño: no entra a la red. Estado terminal DANADO. */
  DANADO = 'DANADO',
  /** Paquete no aceptado en la sucursal: nunca inicia su ciclo. Terminal CANCELADO. */
  RECHAZADO = 'RECHAZADO',
}
