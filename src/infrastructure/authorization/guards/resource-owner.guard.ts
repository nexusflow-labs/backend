import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MemberRole } from 'src/modules/members/domain/entities/member.entity';
import {
  CHECK_OWNERSHIP_KEY,
  WORKSPACE_CONTEXT_KEY,
} from '../constants/permissions.constants';
import {
  CheckOwnershipOptions,
  WorkspaceContext,
} from '../interfaces/authorization.interfaces';
import { ResourceResolverService } from '../services/resource-resolver.service';

/**
 * Guard that validates resource ownership.
 *
 * - OWNER and ADMIN roles bypass this check (can modify any resource)
 * - MEMBER must own the resource to proceed
 *
 * Must be used after WorkspaceMemberGuard as it relies on
 * request[WORKSPACE_CONTEXT_KEY] being set.
 *
 * @example
 * @UseGuards(WorkspaceMemberGuard, ResourceOwnerGuard)
 * @CheckOwnership({ resourceType: ResourceType.PROJECT })
 * @Put(':id')
 * async update(@Param('id') id: string) {}
 */
@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly resourceResolver: ResourceResolverService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const checkOwnershipOptions =
      this.reflector.getAllAndOverride<CheckOwnershipOptions>(
        CHECK_OWNERSHIP_KEY,
        [context.getHandler(), context.getClass()],
      );

    // No ownership check required
    if (!checkOwnershipOptions) {
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

    // OWNER and ADMIN can modify any resource
    if (
      workspaceContext.role === MemberRole.OWNER ||
      workspaceContext.role === MemberRole.ADMIN
    ) {
      return true;
    }

    // MEMBER must own the resource
    const resourceIdParam = checkOwnershipOptions.resourceIdParam ?? 'id';
    const resourceId = request.params[resourceIdParam] as string | undefined;

    if (!resourceId) {
      throw new ForbiddenException(
        `Resource ID parameter "${resourceIdParam}" not found`,
      );
    }

    const resourceOwner = await this.resourceResolver.getResourceOwner(
      checkOwnershipOptions.resourceType,
      resourceId,
    );

    if (!resourceOwner) {
      throw new NotFoundException('Resource not found');
    }

    // Verify resource belongs to the same workspace
    if (resourceOwner.workspaceId !== workspaceContext.workspaceId) {
      throw new ForbiddenException(
        'Resource does not belong to this workspace',
      );
    }

    // Check if user owns the resource
    if (resourceOwner.ownerId !== workspaceContext.userId) {
      throw new ForbiddenException(
        'You do not have permission to modify this resource',
      );
    }

    return true;
  }
}
