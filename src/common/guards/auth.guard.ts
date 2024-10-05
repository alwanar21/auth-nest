import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { TokenJwtService } from '../services/jwt.service';
import { UserRequest } from '../interfaces/user-request.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: TokenJwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request: UserRequest = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Token is invalid or has expired');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token is invalid or has expired');
    }

    const decoded = this.jwtService.verifyJwtToken(token, 'access');
    request.user = decoded;
    return true;
  }
}
