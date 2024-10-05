import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenJwtService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Generates a JWT token based on the provided payload and token type.
   *
   * @param payload - The data to be encoded in the token, including user ID and optional roles.
   * @param type - The type of token to generate: 'access', 'refresh', or 'emailVerification'.
   * @returns The signed JWT token as a string.
   */
  generateJwtToken(
    payload: { id: string; roles?: 'user' | 'admin' },
    type: 'access' | 'refresh' | 'emailVerification',
  ): string {
    let expiresIn: string;

    switch (type) {
      case 'access':
        expiresIn = '1h';
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

  /**
   * Verifies the provided JWT token based on its type (access, refresh, or email verification).
   *
   * @param token - The JWT token to be verified.
   * @param type - The type of token, which can be 'access', 'refresh', or 'emailVerification'.
   * @returns An object containing the user's ID and optionally their roles.
   * @throws UnauthorizedException if the token is invalid or expired.
   */
  verifyJwtToken(
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
}
