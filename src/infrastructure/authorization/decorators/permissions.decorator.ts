import { SetMetadata } from '@nestjs/common';
import { Permission } from '../interfaces/authorization.interfaces';
import { PERMISSIONS_KEY } from '../constants/permissions.constants';

/**
 * Decorator to specify which permissions are required to access an endpoint.
 * @example
 * @RequirePermissions(Permission.MEMBER_ADD)
 * @Post()
 * async addMember() {}
 */
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
