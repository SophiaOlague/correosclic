export class PasswordMismatchException extends Error {
  constructor() {
    super('Las contraseñas no coinciden.');

    this.name = PasswordMismatchException.name;
  }
}