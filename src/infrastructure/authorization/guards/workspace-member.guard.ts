import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { IMemberRepository } from 'src/modules/members/domain/repositories/member.repository';
import { ResourceResolverService } from '../services/resource-resolver.service';
import { WorkspaceContext } from '../interfaces/authorization.interfaces';
import { WORKSPACE_CONTEXT_KEY } from '../constants/permissions.constants';
import { JwtUser } from 'src/modules/auth/domain/entities/types/jwt-user.type';

interface RequestWithParams {
  params: {
    workspaceId?: string;
    projectId?: string;
    taskId?: string;
    id?: string; // Generic ID param, used for workspace routes
    [key: string]: string | undefined;
  };
  user?: JwtUser;
  route?: {
    path?: string;
  };
  [key: string]: unknown;
}

/**
 * Guard that validates user membership in a workspace.
 *
 * Extracts workspaceId from:
 * - :workspaceId param (direct)
 * - :projectId param (resolved through project)
 * - :taskId param (resolved through task -> project)
 *
 * Sets request[WORKSPACE_CONTEXT_KEY] with WorkspaceContext on success.
 */
@Injectable()
export class WorkspaceMemberGuard implements CanActivate {
  constructor(
    private readonly memberRepository: IMemberRepository,
    private readonly resourceResolver: ResourceResolverService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithParams>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const workspaceId = await this.resolveWorkspaceId(request);

    if (!workspaceId) {
      // No workspace context required for this route
      return true;
    }

    const member = await this.memberRepository.findByWorkspaceAndUser(
      workspaceId,
      user.id,
    );

    if (!member) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    // Attach workspace context to request for downstream guards/handlers
    const workspaceContext: WorkspaceContext = {
      workspaceId,
      userId: user.id,
      memberId: member.id,
      role: member.role,
    };

    request[WORKSPACE_CONTEXT_KEY] = workspaceContext;

    return true;
  }

  private async resolveWorkspaceId(
    request: RequestWithParams,
  ): Promise<string | null> {
    const params = request.params;

    // Direct workspace ID from params
    if (params.workspaceId) {
      return params.workspaceId;
    }

    // For workspace routes using :id param (e.g., /workspaces/:id)
    // Check if this is a workspace route by examining the path
    const routePath = request.route?.path ?? '';
    if (params.id && routePath.startsWith('/workspaces')) {
      return params.id;
    }

    // Resolve from project ID
    if (params.projectId) {
      try {
        return await this.resourceResolver.getWorkspaceIdFromProject(
          params.projectId,
        );
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        return null;
      }
    }

    // Resolve from task ID
    if (params.taskId) {
      try {
        return await this.resourceResolver.getWorkspaceIdFromTask(
          params.taskId,
        );
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        return null;
      }
    }

    // No workspace context available
    return null;
  }
}
