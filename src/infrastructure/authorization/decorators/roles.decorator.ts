import { SetMetadata } from '@nestjs/common';
import { MemberRole } from 'src/modules/members/domain/entities/member.entity';
import { ROLES_KEY } from '../constants/permissions.constants';

/**
 * Decorator to specify which roles are allowed to access an endpoint.
 * @example
 * @Roles(MemberRole.OWNER, MemberRole.ADMIN)
 * @Post()
 * async addMember() {}
 */
export const Roles = (...roles: MemberRole[]) => SetMetadata(ROLES_KEY, roles);
