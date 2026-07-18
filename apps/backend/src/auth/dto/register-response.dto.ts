import { AuthenticatedUserDto } from './authenticated-user.dto';

export class RegisterResponseDto {
  readonly accessToken: string;

  readonly user: AuthenticatedUserDto;
}