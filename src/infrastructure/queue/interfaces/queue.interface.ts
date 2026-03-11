import { JobOptions, JobResult, JobType } from '../types/job.types';

/**
 * Abstract Queue Service Interface
 * Provides a common interface for queue implementations (BullMQ or Sync fallback)
 */
export abstract class IQueueService {
  /**
   * Add a single job to the queue
   * @param type - The type of job to add
   * @param payload - The job data
   * @param options - Optional job configuration
   * @returns The job ID
   */
  abstract addJob<T>(
    type: JobType,
    payload: T,
    options?: JobOptions,
  ): Promise<string>;

  /**
   * Add multiple jobs to the queue in bulk
   * @param type - The type of jobs to add
   * @param payloads - Array of job data
   * @param options - Optional job configuration (applied to all jobs)
   * @returns Array of job IDs
   */
  abstract addBulk<T>(
    type: JobType,
    payloads: T[],
    options?: JobOptions,
  ): Promise<string[]>;

  /**
   * Get the status and result of a job
   * @param jobId - The job ID to check
   * @returns Job result or null if not found
   */
  abstract getJobStatus(jobId: string): Promise<JobResult | null>;

  /**
   * Remove a job from the queue
   * @param jobId - The job ID to remove
   * @returns True if removed, false otherwise
   */
  abstract removeJob(jobId: string): Promise<boolean>;

  /**
   * Check if the queue service is healthy
   * @returns True if healthy, false otherwise
   */
  abstract isHealthy(): Promise<boolean>;

  /**
   * Gracefully close queue connections
   */
  abstract close(): Promise<void>;
}
