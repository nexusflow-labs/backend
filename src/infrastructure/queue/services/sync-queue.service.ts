import { Injectable, Logger, Inject } from '@nestjs/common';
import { IQueueService } from '../interfaces/queue.interface';
import {
  IJobProcessor,
  JOB_PROCESSOR,
} from '../interfaces/job-processor.interface';
import { JobOptions, JobResult, JobType } from '../types/job.types';

/**
 * Synchronous Queue Service - Fallback implementation when Redis is unavailable
 * Processes jobs immediately instead of queuing them
 */
@Injectable()
export class SyncQueueService implements IQueueService {
  private readonly logger = new Logger(SyncQueueService.name);
  private readonly processors: Map<JobType, IJobProcessor> = new Map();
  private jobCounter = 0;
  private readonly completedJobs: Map<string, JobResult> = new Map();

  constructor(
    @Inject(JOB_PROCESSOR)
    jobProcessors: IJobProcessor[],
  ) {
    // Register all processors
    for (const processor of jobProcessors) {
      this.processors.set(processor.jobType, processor);
    }

    this.logger.warn(
      'Using synchronous queue execution. Jobs will be processed immediately.',
    );
  }

  async addJob<T>(
    type: JobType,
    payload: T,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options?: JobOptions,
  ): Promise<string> {
    const jobId = `sync-${++this.jobCounter}-${Date.now()}`;
    this.logger.debug(`Processing job ${jobId} synchronously (${type})`);

    try {
      const processor = this.processors.get(type);

      if (!processor) {
        this.logger.warn(`No processor registered for job type: ${type}`);
      } else {
        await processor.process(payload);
      }

      this.completedJobs.set(jobId, {
        id: jobId,
        status: 'completed',
        attemptsMade: 1,
        finishedOn: new Date(),
      });

      // Keep only last 100 completed jobs in memory
      if (this.completedJobs.size > 100) {
        const firstKey = this.completedJobs.keys().next().value as
          | string
          | undefined;
        if (firstKey) {
          this.completedJobs.delete(firstKey);
        }
      }

      this.logger.debug(`Job ${jobId} completed synchronously`);
      return jobId;
    } catch (error) {
      this.logger.error(
        `Job ${jobId} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      this.completedJobs.set(jobId, {
        id: jobId,
        status: 'failed',
        failedReason: error instanceof Error ? error.message : 'Unknown error',
        attemptsMade: 1,
        finishedOn: new Date(),
      });

      throw error;
    }
  }

  async addBulk<T>(
    type: JobType,
    payloads: T[],
    options?: JobOptions,
  ): Promise<string[]> {
    const jobIds: string[] = [];

    for (const payload of payloads) {
      const jobId = await this.addJob(type, payload, options);
      jobIds.push(jobId);
    }

    return jobIds;
  }

  getJobStatus(jobId: string): Promise<JobResult | null> {
    return Promise.resolve(this.completedJobs.get(jobId) ?? null);
  }

  removeJob(jobId: string): Promise<boolean> {
    return Promise.resolve(this.completedJobs.delete(jobId));
  }

  isHealthy(): Promise<boolean> {
    // Sync service is always healthy
    return Promise.resolve(true);
  }

  close(): Promise<void> {
    // Nothing to close for sync service
    this.completedJobs.clear();
    return Promise.resolve();
  }
}
