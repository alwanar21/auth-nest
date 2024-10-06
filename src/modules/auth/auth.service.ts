import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { RegisterUserDTO } from './dto/register-user.dto';
import { nanoid } from 'nanoid';
import * as bcrypt from 'bcrypt';
import { LoginUserDTO } from './dto/login-user.dto';
import { EmailService } from '../../common/services/email.service';
import { EmailVerificationDTO } from './dto/email-verification.dto';
import { Request } from 'express';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { TokenJwtService } from 'src/common/services/jwt.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly jwtService: TokenJwtService,
  ) {}

  async register(registerUserDto: RegisterUserDTO) {
    //TODO: check email is exist or not
    const user = await this.prisma.user.findUnique({
      where: {
        email: registerUserDto.email,
      },
    });

    if (user) {
      throw new BadRequestException('Email already in use');
    }

    //TODO: create user data
    const userId = nanoid();
    const username = await this.generateUsername();
    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);

    await this.prisma.user.create({
      data: {
        id: userId,
        email: registerUserDto.email,
        password: hashedPassword,
        profile: {
          create: {
            username: username,
          },
        },
      },
    });

    //TODO: generate email verification Token & send it via email
    const payload = { id: userId };

    let emailVerificationToken = this.jwtService.generateJwtToken(
      payload,
      'emailVerification',
    );
    emailVerificationToken = `http://localhost:3000/verify-email/${emailVerificationToken}`;

    this.email.emailVerification(
      registerUserDto.email,
      username,
      emailVerificationToken,
    );

    return {
      message:
        'User registered successfully. Check your email to verify your account.',
    };
  }

  async login(loginUserDto: LoginUserDTO) {
    //TODO: check email is exist or not
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginUserDto.email,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid email or password');
    }

    //TODO: check password valid or not
    const matchPassword = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );

    if (!matchPassword) {
      throw new BadRequestException('Invalid email or password');
    }

    //TODO: check user's email valid or not, if not return error
    if (user.isActive == false) {
      throw new UnauthorizedException(
        'Your email is not verified. Please verify your email first',
      );
    }

    //TODO: generate access & refresh token, and store refresh token in database
    const payload = { id: user.id, roles: user.roles };

    const accessToken = this.jwtService.generateJwtToken(payload, 'access');
    const refreshToken = this.jwtService.generateJwtToken(payload, 'refresh');

    const sessionId = nanoid();
    await this.prisma.session.create({
      data: {
        id: sessionId,
        token: refreshToken,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userId: user.id,
      },
    });

    return {
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken: sessionId,
      },
    };
  }

  async resendEmailVerification(emailVerificationDto: EmailVerificationDTO) {
    //TODO: Check if the email exists
    //TODO: If the email does not exist or it already exists but is verified, throw an error
    const user = await this.prisma.user.findUnique({
      where: {
        email: emailVerificationDto.email,
      },
      include: {
        profile: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Email not registered');
    }

    if (user.isActive) {
      throw new ConflictException('Email is already verified.');
    }

    //TODO: resend email verification
    const payload = { id: user.id };
    let emailVerificationToken = this.jwtService.generateJwtToken(
      payload,
      'emailVerification',
    );
    emailVerificationToken = `http://localhost:3000/verify-email/${emailVerificationToken}`;

    this.email.emailVerification(
      user.email,
      user.profile.username,
      emailVerificationToken,
    );

    return {
      message: 'Email has been sent. Check your email to verify your account.',
    };
  }

  async verifyEmailToken(token: string) {
    //TODO: Check token valid or not
    const decodedToken = this.jwtService.verifyJwtToken(
      token,
      'emailVerification',
    );

    // TODO Mark the user's email as verified
    await this.prisma.user.update({
      where: {
        id: decodedToken.id,
      },
      data: {
        isActive: true,
      },
    });
    return {
      message: 'Email successfully verified',
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDTO) {
    //TODO: check email is exist or not
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
      include: {
        profile: {
          select: {
            username: true,
          },
        },
      },
    });
    if (!user) {
      throw new NotFoundException('Email not registered');
    }

    const payload = { id: user.id };
    let emailResetPasswordToken = this.jwtService.generateJwtToken(
      payload,
      'emailVerification',
    );

    emailResetPasswordToken = `http://localhost:3000/auth/reset-password/${emailResetPasswordToken}`;

    this.email.emailResetPassword(
      forgotPasswordDto.email,
      user.profile.username,
      emailResetPasswordToken,
    );

    return {
      message: 'Email has been sent. Check your email to verify your account',
    };
  }

  async resetPasswordValidator(token: string) {
    const decoded = this.jwtService.verifyJwtToken(token, 'emailVerification');
    const user = this.prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      throw new UnauthorizedException('user Not found');
    }
    return { message: 'user found' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const decoded = this.jwtService.verifyJwtToken(
      resetPasswordDto.token,
      'emailVerification',
    );

    const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 10);

    await this.prisma.user.update({
      where: {
        id: decoded.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    return { message: 'Password changed successfully' };
  }

  async refreshToken(request: Request) {
    //TODO: check token valid or not
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Token is invalid or has expired');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token is invalid or has expired');
    }

    //TODO: check if session is available
    const session = await this.prisma.session.findUnique({
      where: {
        id: token,
      },
    });

    if (!session) {
      throw new UnauthorizedException('Token is invalid or has expired');
    }

    //TODO: check token valid or not
    const decodedToken = this.jwtService.verifyJwtToken(
      session.token,
      'refresh',
    );

    //TODO: Generate a new token, invalidate the previous session, and save the new token.
    const payload = { id: decodedToken.id, roles: decodedToken.roles };
    const accessToken = this.jwtService.generateJwtToken(payload, 'access');
    const refreshToken = this.jwtService.generateJwtToken(payload, 'refresh');

    await this.prisma.session.delete({
      where: { id: session.id },
    });

    const sessionId = nanoid();
    await this.prisma.session.create({
      data: {
        id: sessionId,
        token: refreshToken,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userId: decodedToken.id,
      },
    });

    return {
      data: {
        accessToken,
        refreshToken: sessionId,
      },
    };
  }

  // ? Helper function

  /**
   * This function is used to generate username for new user
   * @returns Promise<string>
   */

  private async generateUsername() {
    let username: string;
    let userExists = true;

    while (userExists) {
      const randomNum = Math.floor(Math.random() * 10000000000);
      const paddedNum = String(randomNum).padStart(10, '0');
      username = `user${paddedNum}`;

      const user = await this.prisma.profile.findUnique({
        where: {
          username: username,
        },
      });

      userExists = !!user;
    }

    return username;
  }
}
