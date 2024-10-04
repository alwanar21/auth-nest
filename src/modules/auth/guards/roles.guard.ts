import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true; // Jika tidak ada roles, izinkan akses
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Asumsi bahwa `user` sudah ditetapkan dalam request

    // Periksa apakah user memiliki role yang diizinkan
    const hasRole = () => roles.includes(user.roles);
    if (user && user.roles && hasRole()) {
      return true;
    } else {
      return false;
    }
  }
}
