import { Injectable } from '@nestjs/common';

const SUFFIX_LENGTH = 6;

// Sin caracteres ambiguos (0/O, 1/I/L)
const SUFFIX_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

@Injectable()
export class OrderCodeGenerator {
  generate(referenceDate: Date = new Date()): string {
    return `ORD-${this.formatTimestamp(referenceDate)}-${this.randomSuffix()}`;
  }

  private formatTimestamp(date: Date): string {
    const pad = (value: number): string =>
      value.toString().padStart(2, '0');

    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate()),
      pad(date.getHours()),
      pad(date.getMinutes()),
      pad(date.getSeconds()),
    ].join('');
  }

  private randomSuffix(): string {
    let suffix = '';

    for (let i = 0; i < SUFFIX_LENGTH; i++) {
      const index = Math.floor(
        Math.random() * SUFFIX_ALPHABET.length,
      );

      suffix += SUFFIX_ALPHABET[index];
    }

    return suffix;
  }
}
