export class RoomBuilder {
  static workspace(id: string) {
    return `workspace:${id}`;
  }

  static project(id: string) {
    return `project:${id}`;
  }

  static task(id: string) {
    return `task:${id}`;
  }

  static user(id: string) {
    return `user:${id}`;
  }
}

export const RealtimeEvents = {
  // Task events
  TASK_CREATED: 'task:created',
  TASK_UPDATED: 'task:updated',
  TASK_DELETED: 'task:deleted',
  TASK_ASSIGNED: 'task:assigned',

  // Comment events
  COMMENT_CREATED: 'comment:created',
  COMMENT_UPDATED: 'comment:updated',
  COMMENT_DELETED: 'comment:deleted',

  // Project events
  PROJECT_CREATED: 'project:created',
  PROJECT_UPDATED: 'project:updated',
  PROJECT_DELETED: 'project:deleted',

  // Member events
  MEMBER_ADDED: 'member:added',
  MEMBER_REMOVED: 'member:removed',
  MEMBER_ROLE_CHANGED: 'member:role_changed',

  // Invitation events
  INVITATION_RECEIVED: 'invitation:received',
  INVITATION_ACCEPTED: 'invitation:accepted',
  INVITATION_REJECTED: 'invitation:rejected',

  // Typing indicators
  USER_TYPING: 'user:typing',
  USER_STOP_TYPING: 'user:stop_typing',

  // Presence
  PRESENCE_UPDATE: 'presence:update',

  // Notification events
  NOTIFICATION_RECEIVED: 'notification:received',
  NOTIFICATION_READ: 'notification:read',
  NOTIFICATION_READ_ALL: 'notification:read_all',
} as const;

export type RealtimeEvent =
  (typeof RealtimeEvents)[keyof typeof RealtimeEvents];
