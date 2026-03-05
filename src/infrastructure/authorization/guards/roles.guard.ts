import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MemberRole } from 'src/modules/members/domain/entities/member.entity';
import {
  ROLES_KEY,
  WORKSPACE_CONTEXT_KEY,
} from '../constants/permissions.constants';
import { WorkspaceContext } from '../interfaces/authorization.interfaces';

/**
 * Guard that validates user role against required roles.
 *
 * Must be used after WorkspaceMemberGuard as it relies on
 * request[WORKSPACE_CONTEXT_KEY] being set.
 *
 * @example
 * @UseGuards(WorkspaceMemberGuard, RolesGuard)
 * @Roles(MemberRole.OWNER, MemberRole.ADMIN)
 * @Post()
 * async addMember() {}
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<MemberRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No roles required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const workspaceContext = request[WORKSPACE_CONTEXT_KEY] as
      | WorkspaceContext
      | undefined;

    if (!workspaceContext) {
      throw new ForbiddenException(
        'Workspace context not available. Ensure WorkspaceMemberGuard runs first.',
      );
    }

    const hasRole = requiredRoles.includes(workspaceContext.role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required role: ${requiredRoles.join(' or ')}`,
      );
    }

    return true;
  }
}
