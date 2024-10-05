import {
  Controller,
  Post,
  Body,
  HttpCode,
  Param,
  Get,
  Req,
  Put,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDTO } from './dto/register-user.dto';
import { LoginUserDTO } from './dto/login-user.dto';
import { EmailVerificationDTO } from './dto/email-verification.dto';
import { Request } from 'express';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

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

  @Post('auth/email-verification')
  @HttpCode(200)
  async resendEmailverification(
    @Body() emailVerificationDto: EmailVerificationDTO,
  ) {
    const result =
      await this.authService.resendEmailVerification(emailVerificationDto);
    return result;
  }

  @Get('verify-email/:token')
  @HttpCode(200)
  async verifyEmailToken(@Param('token') token: string) {
    const result = await this.authService.verifyEmailToken(token);
    return result;
  }

  @Put('auth/forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDTO) {
    const result = await this.authService.forgotPassword(forgotPasswordDto);
    return result;
  }

  @Get('auth/reset-password/:token')
  @HttpCode(200)
  async resetPasswordValidotor(@Param('token') token: string) {
    const result = await this.authService.resetPasswordValidator(token);
    return result;
  }

  @Put('auth/reset-password')
  @HttpCode(200)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const result = await this.authService.resetPassword(resetPasswordDto);
    return result;
  }

  @Post('auth/refresh')
  @HttpCode(201)
  async refreshSessionToken(@Req() request: Request) {
    const result = await this.authService.refreshToken(request);
    return result;
  }
}
