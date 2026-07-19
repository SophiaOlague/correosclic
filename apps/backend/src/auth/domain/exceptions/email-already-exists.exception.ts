export class EmailAlreadyExistsException extends Error {
  constructor() {
    super('El correo electrónico ya está registrado.');

    this.name = EmailAlreadyExistsException.name;
  }
}