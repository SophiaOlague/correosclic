export class AuthenticatedUserDto {
  readonly id: string;

  readonly email: string;

  readonly nombre: string;

  readonly apellidoPaterno: string;

  readonly apellidoMaterno?: string;

  readonly roles: string[];
}