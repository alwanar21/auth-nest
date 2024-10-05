import { SetMetadata } from '@nestjs/common';

type Role = 'user' | 'admin';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
