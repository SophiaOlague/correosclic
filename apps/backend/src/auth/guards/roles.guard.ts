import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthenticatedUserDto } from '../dto/authenticated-user.dto';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Exige que el usuario autenticado tenga al menos uno de los roles declarados
 * con `@Roles(...)`.
 *
 * `JwtStrategy` resuelve los roles contra la base de datos en cada petición en
 * vez de firmarlos en el token, así que revocar un rol surte efecto de
 * inmediato.
 *
 * Sin roles declarados el guard no restringe nada: la protección es siempre
 * explícita en el endpoint.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) {
      return true;
    }

    const user: AuthenticatedUserDto | undefined = context
      .switchToHttp()
      .getRequest().user;

    if (!user?.roles?.some((rol) => required.includes(rol))) {
      throw new ForbiddenException(
        'No tienes permiso para realizar esta acción.',
      );
    }

    return true;
  }
}
