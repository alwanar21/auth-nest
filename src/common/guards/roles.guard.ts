import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Determines if the user has the required roles to access a route.
   *
   * @param context - The execution context containing details about the request.
   * @returns boolean - Returns true if access is granted, otherwise false.
   */
  canActivate(context: ExecutionContext): boolean {
    // Retrieve the roles metadata from the handler
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    // If no roles are defined, allow access
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Assumes `user` has been set in the request

    // Check if the user has one of the required roles
    const hasRole = () => roles.includes(user.roles);

    // Return true if the user has the required role, otherwise false
    if (user && user.roles && hasRole()) {
      return true;
    } else {
      return false;
    }
  }
}
