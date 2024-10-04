import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RegisterUserDTO } from './dto/register-user.dto';
// import { LoginUserDTO } from './dto/login-user.dto';
import { nanoid } from 'nanoid';
import * as bcrypt from 'bcrypt';
import { LoginUserDTO } from './dto/login-user.dto';
import { EmailService } from '../common/email.service';
import { JwtService } from '@nestjs/jwt';
import { EmailVerificationDTO } from './dto/email-verification.dto';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly email: EmailService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerUserDto: RegisterUserDTO) {
    //check data applied is available or not
    const user = await this.prisma.user.findUnique({
      where: {
        email: registerUserDto.email,
      },
    });

    if (user) {
      throw new BadRequestException('Email already in use');
    }

    //create data user
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

    // Generate email verification Token & send email
    const payload = { id: userId };

    let emailVerificationToken = this.generateToken(
      payload,
      'emailVerification',
    );
    emailVerificationToken = `http://localhost:3000/api/verify-email/${emailVerificationToken}`;

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
    // cek email and password
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginUserDto.email,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid email or password');
    }

    const matchPassword = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );

    if (!matchPassword) {
      throw new BadRequestException('Invalid email or password');
    }

    if (user.isActive == false) {
      throw new UnauthorizedException(
        'Your email is not verified. Please verify yaour email first',
      );
    }

    const payload = { id: user.id, roles: user.roles };

    const accessToken = this.generateToken(payload, 'access');
    const refreshToken = this.generateToken(payload, 'refresh');

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

  async verifyEmailToken(token: string) {
    const decodedToken = this.verifyToken(token, 'emailVerification');

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

  async resendEmailVerification(emailVerificationDto: EmailVerificationDTO) {
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
      throw new BadRequestException('Email is already verified.');
    }

    const payload = { id: user.id };

    // Generate email verification Token
    // Generate email verification Token & send email
    let emailVerificationToken = this.generateToken(
      payload,
      'emailVerification',
    );
    emailVerificationToken = `http://localhost:3000/api/verify-email/${emailVerificationToken}`;

    this.email.emailVerification(
      user.email,
      user.profile.username,
      emailVerificationToken,
    );

    return {
      message: 'Email has been sent. Check your email to verify your account.',
    };
  }

  async refreshToken(request: Request) {
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header not found');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token is invalid or has expired');
    }

    const session = await this.prisma.session.findUnique({
      where: {
        id: token,
      },
    });

    if (!session) {
      throw new UnauthorizedException('Token is invalid or has expired');
    }

    const decodedToken = this.verifyToken(session.token, 'refresh');
    const payload = { id: decodedToken.id, roles: decodedToken.roles };
    const accessToken = this.generateToken(payload, 'access');
    const refreshToken = this.generateToken(payload, 'refresh');

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

  // resetPassword(id: number) {
  //   return `This action removes a #${id} auth`;
  // }

  //helper

  private generateToken(
    payload: { id: string; roles?: 'user' | 'admin' },
    type: 'access' | 'refresh' | 'emailVerification',
  ): string {
    let expiresIn: string;

    switch (type) {
      case 'access':
        expiresIn = '1m';
        return this.jwtService.sign(payload, {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn,
        });
      case 'refresh':
        expiresIn = '7d';
        return this.jwtService.sign(payload, {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn,
        });
      case 'emailVerification':
        expiresIn = '10m';
        return this.jwtService.sign(payload, {
          secret: process.env.JWT_EMAIL_VERIFICATION_SECRET,
          expiresIn,
        });
    }
  }

  verifyToken(
    token: string,
    type: 'access' | 'refresh' | 'emailVerification',
  ): { id: string; roles?: 'user' | 'admin' } {
    let secret: string;

    switch (type) {
      case 'access':
        secret = process.env.JWT_ACCESS_SECRET;
        break;
      case 'refresh':
        secret = process.env.JWT_REFRESH_SECRET;
        break;
      case 'emailVerification':
        secret = process.env.JWT_EMAIL_VERIFICATION_SECRET;
        break;
    }

    try {
      const decoded = this.jwtService.verify(token, { secret });

      return decoded;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new UnauthorizedException('Token is invalid or has expired');
    }
  }

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
