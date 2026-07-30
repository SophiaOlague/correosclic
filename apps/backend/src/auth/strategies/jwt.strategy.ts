import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthenticatedUserDto } from '../dto/authenticated-user.dto';
import { UserRepository } from '../infrastructure/repositories/user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // El payload del token solo lleva { sub, email }, así que el resto de
  // AuthenticatedUserDto -- nombre, apellidos y roles -- se resuelve contra la
  // base de datos en cada petición. Consultarlo aquí, en vez de firmarlo dentro
  // del JWT, mantiene los roles al día: si a un usuario se le revoca el rol de
  // VENDEDOR deja de tenerlo en la siguiente petición, no al expirar su token.
  async validate(payload: {
    sub: string;
    email: string;
  }): Promise<AuthenticatedUserDto> {
    const user = await this.userRepository.findByIdWithRoles(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    return {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellidoPaterno: user.apellidoPaterno,
      apellidoMaterno: user.apellidoMaterno ?? undefined,
      roles: user.usuarioRoles.map((usuarioRol) => usuarioRol.rol.codigo),
    };
  }
}
