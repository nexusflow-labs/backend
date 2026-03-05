import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { WorkspaceContext } from '../interfaces/authorization.interfaces';
import { WORKSPACE_CONTEXT_KEY } from '../constants/permissions.constants';

/**
 * Parameter decorator to extract workspace context from the request.
 * The context is set by WorkspaceMemberGuard after validating membership.
 *
 * @example
 * @Get()
 * async list(@WorkspaceCtx() ctx: WorkspaceContext) {
 *   // ctx.workspaceId, ctx.userId, ctx.memberId, ctx.role
 * }
 */
export const WorkspaceCtx = createParamDecorator(
  (data: keyof WorkspaceContext | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const workspaceContext = request[WORKSPACE_CONTEXT_KEY] as
      | WorkspaceContext
      | undefined;

    if (!workspaceContext) {
      return null;
    }

    return data ? workspaceContext[data] : workspaceContext;
  },
);
