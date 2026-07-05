import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { PasswordService } from '../domain/services/password.service';
import { RegisterResponseDto } from '../dto/register-response.dto';
import { RegisterDto } from '../dto/register.dto';
import { PasswordMismatchException } from '../domain/exceptions/password-mismatch.exception';
import { EmailAlreadyExistsException } from '../domain/exceptions/email-already-exists.exception';
import { UserRepository } from '../infrastructure/repositories/user.repository';
import { TokenService } from '../domain/services/token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async ping() {
    await this.prisma.$queryRaw`SELECT 1`;
    
    return {
      module: 'auth',
      database: 'connected',
    };
  }
  //validar contraseña y confirmacion de contraseña, si no coinciden lanzar excepcion
async register(
  dto: RegisterDto,
): Promise<RegisterResponseDto> {
  if (dto.password !== dto.confirmPassword) {
    throw new PasswordMismatchException();
  }
//Buscar si el correo electrónico ya existe en la base de datos, si existe lanzar excepcion
 const existingUser = await this.userRepository.findByEmail(
  dto.email,
);

  if (existingUser) {
    throw new EmailAlreadyExistsException();
  }
//hashear la contraseña usando el servicio de password
  const passwordHash = await this.passwordService.hash(dto.password);

const user = await this.userRepository.registerClient({
  email: dto.email,
  passwordHash,
  nombre: dto.nombre,
  apellidoPaterno: dto.apellidoPaterno,
  apellidoMaterno: dto.apellidoMaterno,
  telefono: dto.telefono,
});
const accessToken = await this.tokenService.generateAccessToken({
  sub: user.id,
  email: user.email,
});
const roles = await this.userRepository.getRoles(user.id);

return {
  accessToken,
  user: {
    id: user.id,
    email: user.email,
    nombre: user.nombre,
    apellidoPaterno: user.apellidoPaterno,
    apellidoMaterno: user.apellidoMaterno ?? undefined,
    roles,
  },
};
}
}