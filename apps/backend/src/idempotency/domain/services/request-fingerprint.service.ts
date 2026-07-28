import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

/**
 * Huella determinista del body de una solicitud, para detectar cuando un
 * Idempotency-Key se reutiliza indebidamente con parámetros distintos
 * (mismo patrón que usa Stripe para su header Idempotency-Key).
 */
@Injectable()
export class RequestFingerprintService {
  hash(payload: unknown): string {
    const serialized = this.stableStringify(payload ?? {});

    return createHash('sha256')
      .update(serialized)
      .digest('hex');
  }

  private stableStringify(value: unknown): string {
    if (value === null || typeof value !== 'object') {
      return JSON.stringify(value);
    }

    if (Array.isArray(value)) {
      const items = value.map((item) =>
        this.stableStringify(item),
      );

      return `[${items.join(',')}]`;
    }

    const record = value as Record<string, unknown>;

    const entries = Object.keys(record)
      .sort()
      .map(
        (key) =>
          `${JSON.stringify(key)}:${this.stableStringify(record[key])}`,
      );

    return `{${entries.join(',')}}`;
  }
}
