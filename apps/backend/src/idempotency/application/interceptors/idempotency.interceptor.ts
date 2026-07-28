import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { EstadoIdempotencia } from '@correosclic/database';

import { IdempotencyRepository } from '../../infrastructure/repositories/idempotency.repository';
import { RequestFingerprintService } from '../../domain/services/request-fingerprint.service';

import { IdempotencyKeyRequiredException } from '../../domain/exceptions/idempotency-key-required.exception';
import { IdempotencyKeyMismatchException } from '../../domain/exceptions/idempotency-key-mismatch.exception';
import { IdempotencyInProgressException } from '../../domain/exceptions/idempotency-in-progress.exception';

const IDEMPOTENCY_HEADER = 'idempotency-key';

/**
 * Interceptor genérico de idempotencia (patrón Stripe): se agrega con
 * @UseInterceptors(IdempotencyInterceptor) a cualquier endpoint crítico que
 * no deba ejecutarse dos veces por reintentos de red o doble clic.
 *
 * Requiere correr DESPUÉS de un guard de autenticación (necesita
 * request.user para acotar la clave por usuario).
 *
 * Flujo:
 * 1. Intenta "reservar" (usuarioId, clave, ruta) con un INSERT atómico.
 * 2. Si lo logra: ejecuta el handler real; al terminar guarda la respuesta
 *    (éxito) o libera la clave (error, para permitir reintentar).
 * 3. Si ya existía: si el body coincide y ya terminó -> devuelve la misma
 *    respuesta sin ejecutar el handler. Si el body no coincide -> 422
 *    (mal uso de la clave). Si todavía está en proceso -> 409.
 */
@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(
    private readonly idempotencyRepository: IdempotencyRepository,
    private readonly fingerprintService: RequestFingerprintService,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const request = context.switchToHttp().getRequest();

    const idempotencyKey = request.headers[IDEMPOTENCY_HEADER];

    if (
      !idempotencyKey ||
      typeof idempotencyKey !== 'string'
    ) {
      throw new IdempotencyKeyRequiredException();
    }

    const usuario = request.user;

    if (!usuario) {
      throw new UnauthorizedException();
    }

    const ruta = `${request.method}:${request.route?.path ?? request.originalUrl}`;
    const huella = this.fingerprintService.hash(
      request.body,
    );
    const statusCodeEsperado =
      request.method === 'POST' ? 201 : 200;

    return from(
      this.idempotencyRepository.claim(
        usuario.id,
        idempotencyKey,
        ruta,
        huella,
      ),
    ).pipe(
      switchMap((claim) => {
        if (!claim.claimed) {
          if (claim.existing.huellaSolicitud !== huella) {
            throw new IdempotencyKeyMismatchException();
          }

          if (
            claim.existing.estado ===
            EstadoIdempotencia.COMPLETADA
          ) {
            return of(claim.existing.respuesta);
          }

          throw new IdempotencyInProgressException();
        }

        return next.handle().pipe(
          switchMap((data) =>
            from(
              this.idempotencyRepository.complete(
                claim.id,
                statusCodeEsperado,
                data,
              ),
            ).pipe(map(() => data)),
          ),
          catchError((error) =>
            from(
              this.idempotencyRepository.release(
                claim.id,
              ),
            ).pipe(
              switchMap(() => throwError(() => error)),
            ),
          ),
        );
      }),
    );
  }
}
