import { MemberRole } from 'src/modules/members/domain/entities/member.entity';
import { Permission } from '../interfaces/authorization.interfaces';

export const ROLES_KEY = 'roles';
export const PERMISSIONS_KEY = 'permissions';
export const CHECK_OWNERSHIP_KEY = 'check_ownership';
export const WORKSPACE_CONTEXT_KEY = 'workspace_context';

/**
 * Permissions granted to each role.
 * Higher roles include all permissions of lower roles.
 */
export const ROLE_PERMISSIONS: Record<MemberRole, Permission[]> = {
  [MemberRole.OWNER]: [
    // All workspace permissions
    Permission.WORKSPACE_VIEW,
    Permission.WORKSPACE_UPDATE,
    Permission.WORKSPACE_DELETE,

    // All member permissions
    Permission.MEMBER_VIEW,
    Permission.MEMBER_ADD,
    Permission.MEMBER_REMOVE,
    Permission.MEMBER_UPDATE_ROLE,

    // All project permissions
    Permission.PROJECT_VIEW,
    Permission.PROJECT_CREATE,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_DELETE,
    Permission.PROJECT_UPDATE_OWN,
    Permission.PROJECT_DELETE_OWN,

    // All task permissions
    Permission.TASK_VIEW,
    Permission.TASK_CREATE,
    Permission.TASK_UPDATE,
    Permission.TASK_DELETE,
    Permission.TASK_UPDATE_OWN,
    Permission.TASK_DELETE_OWN,
    Permission.TASK_ASSIGN,

    // All comment permissions
    Permission.COMMENT_VIEW,
    Permission.COMMENT_CREATE,
    Permission.COMMENT_UPDATE,
    Permission.COMMENT_DELETE,
    Permission.COMMENT_UPDATE_OWN,
    Permission.COMMENT_DELETE_OWN,

    // All label permissions
    Permission.LABEL_VIEW,
    Permission.LABEL_CREATE,
    Permission.LABEL_UPDATE,
    Permission.LABEL_DELETE,
    Permission.LABEL_ATTACH,
    Permission.LABEL_DETACH,

    // All view permissions
    Permission.DASHBOARD_VIEW,
    Permission.ACTIVITY_VIEW,
  ],

  [MemberRole.ADMIN]: [
    // Workspace permissions (no delete)
    Permission.WORKSPACE_VIEW,
    Permission.WORKSPACE_UPDATE,

    // Member permissions (all except changing OWNER role)
    Permission.MEMBER_VIEW,
    Permission.MEMBER_ADD,
    Permission.MEMBER_REMOVE,
    Permission.MEMBER_UPDATE_ROLE,

    // All project permissions
    Permission.PROJECT_VIEW,
    Permission.PROJECT_CREATE,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_DELETE,
    Permission.PROJECT_UPDATE_OWN,
    Permission.PROJECT_DELETE_OWN,

    // All task permissions
    Permission.TASK_VIEW,
    Permission.TASK_CREATE,
    Permission.TASK_UPDATE,
    Permission.TASK_DELETE,
    Permission.TASK_UPDATE_OWN,
    Permission.TASK_DELETE_OWN,
    Permission.TASK_ASSIGN,

    // All comment permissions
    Permission.COMMENT_VIEW,
    Permission.COMMENT_CREATE,
    Permission.COMMENT_UPDATE,
    Permission.COMMENT_DELETE,
    Permission.COMMENT_UPDATE_OWN,
    Permission.COMMENT_DELETE_OWN,

    // All label permissions
    Permission.LABEL_VIEW,
    Permission.LABEL_CREATE,
    Permission.LABEL_UPDATE,
    Permission.LABEL_DELETE,
    Permission.LABEL_ATTACH,
    Permission.LABEL_DETACH,

    // All view permissions
    Permission.DASHBOARD_VIEW,
    Permission.ACTIVITY_VIEW,
  ],

  [MemberRole.MEMBER]: [
    // Workspace view only
    Permission.WORKSPACE_VIEW,

    // Member view only
    Permission.MEMBER_VIEW,

    // Project permissions (create + own)
    Permission.PROJECT_VIEW,
    Permission.PROJECT_CREATE,
    Permission.PROJECT_UPDATE_OWN,
    Permission.PROJECT_DELETE_OWN,

    // Task permissions (create + own)
    Permission.TASK_VIEW,
    Permission.TASK_CREATE,
    Permission.TASK_UPDATE_OWN,
    Permission.TASK_DELETE_OWN,
    Permission.TASK_ASSIGN,

    // Comment permissions (create + own)
    Permission.COMMENT_VIEW,
    Permission.COMMENT_CREATE,
    Permission.COMMENT_UPDATE_OWN,
    Permission.COMMENT_DELETE_OWN,

    // Label permissions (view + attach/detach)
    Permission.LABEL_VIEW,
    Permission.LABEL_ATTACH,
    Permission.LABEL_DETACH,

    // All view permissions
    Permission.DASHBOARD_VIEW,
    Permission.ACTIVITY_VIEW,
  ],
};

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(
  role: MemberRole,
  permission: Permission,
): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if a role can manage another role.
 * - OWNER can manage all roles
 * - ADMIN can manage ADMIN and MEMBER, but not OWNER
 * - MEMBER cannot manage any role
 */
export function canManageRole(
  actorRole: MemberRole,
  targetRole: MemberRole,
): boolean {
  if (actorRole === MemberRole.OWNER) {
    return true;
  }

  if (actorRole === MemberRole.ADMIN) {
    return targetRole !== MemberRole.OWNER;
  }

  return false;
}
