import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { TokenService } from './token.service';

@Injectable()
export class JwtTokenService extends TokenService {
  constructor(
    private readonly jwtService: JwtService,
  ) {
    super();
  }

  async generateAccessToken(payload: {
    sub: string;
    email: string;
  }): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}