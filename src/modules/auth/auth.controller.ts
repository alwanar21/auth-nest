import {
  Controller,
  Post,
  Body,
  HttpCode,
  Param,
  Get,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDTO } from './dto/register-user.dto';
import { LoginUserDTO } from './dto/login-user.dto';
import { EmailVerificationDTO } from './dto/email-verification.dto';
import { Request } from 'express';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(201)
  async registerUser(@Body() registerUserDto: RegisterUserDTO) {
    const result = await this.authService.register(registerUserDto);
    return result;
  }

  @Post('login')
  @HttpCode(200)
  async loginUser(@Body() loginUserDto: LoginUserDTO) {
    const result = await this.authService.login(loginUserDto);
    return result;
  }

  @Get('verify-email/:token')
  @HttpCode(200)
  async verifyEmailToken(@Param('token') token: string) {
    const result = await this.authService.verifyEmailToken(token);
    return result;
  }

  @Post('auth/email-verification')
  @HttpCode(200)
  async resendEmailverification(emailVerificationDto: EmailVerificationDTO) {
    const result =
      await this.authService.resendEmailVerification(emailVerificationDto);
    return result;
  }

  @Post('auth/refresh')
  @HttpCode(201)
  async refreshSessionToken(@Req() request: Request) {
    const result = await this.authService.refreshToken(request);
    return result;
  }
}
