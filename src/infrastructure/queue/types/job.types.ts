/**
 * Job Types and Payloads for BullMQ Background Jobs
 */

// Job Type Enum - identifies the type of job to process
export enum JobType {
  EMAIL_INVITATION = 'email:invitation',
  EMAIL_PASSWORD_RESET = 'email:password-reset',
  ACTIVITY_LOG = 'activity:log',
  FILE_CLEANUP = 'file:cleanup',
}

// Job Priority Levels
export enum JobPriority {
  LOW = 4,
  NORMAL = 3,
  HIGH = 2,
  CRITICAL = 1,
}

// Queue Names (one queue per job category)
export enum QueueName {
  EMAIL = 'email',
  ACTIVITY = 'activity',
  FILES = 'files',
}

// Map job types to their queues
export const JOB_TYPE_TO_QUEUE: Record<JobType, QueueName> = {
  [JobType.EMAIL_INVITATION]: QueueName.EMAIL,
  [JobType.EMAIL_PASSWORD_RESET]: QueueName.EMAIL,
  [JobType.ACTIVITY_LOG]: QueueName.ACTIVITY,
  [JobType.FILE_CLEANUP]: QueueName.FILES,
};

// Job Options Interface
export interface JobOptions {
  priority?: JobPriority;
  attempts?: number;
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  };
  delay?: number; // milliseconds
  removeOnComplete?: boolean | number;
  removeOnFail?: boolean | number;
  repeat?: {
    cron?: string;
    every?: number; // milliseconds
    limit?: number;
  };
}

// Default job options per job type
export const DEFAULT_JOB_OPTIONS: Record<JobType, JobOptions> = {
  [JobType.EMAIL_INVITATION]: {
    priority: JobPriority.HIGH,
    attempts: 5,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
  [JobType.EMAIL_PASSWORD_RESET]: {
    priority: JobPriority.CRITICAL,
    attempts: 5,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
  [JobType.ACTIVITY_LOG]: {
    priority: JobPriority.LOW,
    attempts: 3,
    backoff: { type: 'fixed', delay: 500 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
  [JobType.FILE_CLEANUP]: {
    priority: JobPriority.LOW,
    attempts: 3,
    backoff: { type: 'fixed', delay: 5000 },
    removeOnComplete: 10,
    removeOnFail: 10,
  },
};

// Job Payload Interfaces

export interface EmailInvitationJobPayload {
  email: string;
  inviterName: string;
  workspaceName: string;
  inviteLink: string;
  expiresAt: string;
}

export interface EmailPasswordResetJobPayload {
  email: string;
  userName: string;
  resetLink: string;
  expiresAt: string;
}

export interface ActivityLogJobPayload {
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  workspaceId: string;
  metadata?: Record<string, any> | null;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FileCleanupJobPayload {
  // Empty payload - cleanup runs with default settings
}

// Union type for all job payloads
export type JobPayload =
  | EmailInvitationJobPayload
  | EmailPasswordResetJobPayload
  | ActivityLogJobPayload
  | FileCleanupJobPayload;

// Job Result Interface
export interface JobResult {
  id: string;
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
  progress?: number;
  result?: any;
  failedReason?: string;
  attemptsMade?: number;
  processedOn?: Date;
  finishedOn?: Date;
}
