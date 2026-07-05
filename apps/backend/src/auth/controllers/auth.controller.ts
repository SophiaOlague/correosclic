import { Body, Controller, Get, Post } from '@nestjs/common';

import { AuthService } from '../application/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Get('ping')
  async ping() {
    return this.authService.ping();
  }

  @Post('register')
async register(
  @Body() dto: RegisterDto,
) {
  return this.authService.register(dto);
}

@Post('login')
async login(
  @Body() dto: LoginDto,
) {
  return this.authService.login(dto);
}
}