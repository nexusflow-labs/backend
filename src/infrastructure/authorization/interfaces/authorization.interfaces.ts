import { MemberRole } from 'src/modules/members/domain/entities/member.entity';

export interface WorkspaceContext {
  workspaceId: string;
  userId: string;
  memberId: string;
  role: MemberRole;
}

export enum Permission {
  // Workspace permissions
  WORKSPACE_VIEW = 'WORKSPACE_VIEW',
  WORKSPACE_UPDATE = 'WORKSPACE_UPDATE',
  WORKSPACE_DELETE = 'WORKSPACE_DELETE',

  // Member permissions
  MEMBER_VIEW = 'MEMBER_VIEW',
  MEMBER_ADD = 'MEMBER_ADD',
  MEMBER_REMOVE = 'MEMBER_REMOVE',
  MEMBER_UPDATE_ROLE = 'MEMBER_UPDATE_ROLE',

  // Project permissions
  PROJECT_VIEW = 'PROJECT_VIEW',
  PROJECT_CREATE = 'PROJECT_CREATE',
  PROJECT_UPDATE = 'PROJECT_UPDATE',
  PROJECT_DELETE = 'PROJECT_DELETE',
  PROJECT_UPDATE_OWN = 'PROJECT_UPDATE_OWN',
  PROJECT_DELETE_OWN = 'PROJECT_DELETE_OWN',

  // Task permissions
  TASK_VIEW = 'TASK_VIEW',
  TASK_CREATE = 'TASK_CREATE',
  TASK_UPDATE = 'TASK_UPDATE',
  TASK_DELETE = 'TASK_DELETE',
  TASK_UPDATE_OWN = 'TASK_UPDATE_OWN',
  TASK_DELETE_OWN = 'TASK_DELETE_OWN',
  TASK_ASSIGN = 'TASK_ASSIGN',

  // Comment permissions
  COMMENT_VIEW = 'COMMENT_VIEW',
  COMMENT_CREATE = 'COMMENT_CREATE',
  COMMENT_UPDATE = 'COMMENT_UPDATE',
  COMMENT_DELETE = 'COMMENT_DELETE',
  COMMENT_UPDATE_OWN = 'COMMENT_UPDATE_OWN',
  COMMENT_DELETE_OWN = 'COMMENT_DELETE_OWN',

  // Label permissions
  LABEL_VIEW = 'LABEL_VIEW',
  LABEL_CREATE = 'LABEL_CREATE',
  LABEL_UPDATE = 'LABEL_UPDATE',
  LABEL_DELETE = 'LABEL_DELETE',
  LABEL_ATTACH = 'LABEL_ATTACH',
  LABEL_DETACH = 'LABEL_DETACH',

  // Dashboard permissions
  DASHBOARD_VIEW = 'DASHBOARD_VIEW',

  // Activity log permissions
  ACTIVITY_VIEW = 'ACTIVITY_VIEW',
}

export enum ResourceType {
  WORKSPACE = 'WORKSPACE',
  PROJECT = 'PROJECT',
  TASK = 'TASK',
  COMMENT = 'COMMENT',
  LABEL = 'LABEL',
}

export interface CheckOwnershipOptions {
  resourceType: ResourceType;
  resourceIdParam?: string; // Default: 'id'
}

export interface ResourceOwnerInfo {
  ownerId: string;
  workspaceId: string;
}
