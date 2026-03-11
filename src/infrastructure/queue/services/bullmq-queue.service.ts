import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker, Job, ConnectionOptions } from 'bullmq';
import { IQueueService } from '../interfaces/queue.interface';
import { ProcessorRegistry } from './processor-registry.service';
import {
  JobOptions,
  JobResult,
  JobType,
  QueueName,
  JOB_TYPE_TO_QUEUE,
  DEFAULT_JOB_OPTIONS,
} from '../types/job.types';

@Injectable()
export class BullMQQueueService
  implements IQueueService, OnModuleDestroy, OnModuleInit
{
  private readonly logger = new Logger(BullMQQueueService.name);
  private readonly connectionOpts: ConnectionOptions;
  private readonly queues: Map<QueueName, Queue> = new Map();
  private readonly workers: Map<QueueName, Worker> = new Map();
  private readonly prefix: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly registry: ProcessorRegistry,
  ) {
    const redisUrl = this.configService.get<string>(
      'REDIS_URL',
      'redis://localhost:6379',
    );
    this.prefix = this.configService.get<string>('QUEUE_PREFIX', 'nexusflow');

    const url = new URL(redisUrl);
    this.connectionOpts = {
      host: url.hostname,
      port: parseInt(url.port, 10) || 6379,
      password: url.password || undefined,
      maxRetriesPerRequest: null,
    };

    this.logger.log(
      `BullMQ connecting to Redis at ${url.hostname}:${url.port}`,
    );
  }

  onModuleInit() {
    this.initializeQueues();
    this.initializeWorkers();
  }

  private initializeQueues(): void {
    for (const queueName of Object.values(QueueName)) {
      const queue = new Queue(queueName, {
        connection: this.connectionOpts,
        prefix: this.prefix,
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      });

      this.queues.set(queueName, queue);
      this.logger.log(`Queue "${queueName}" initialized`);
    }
  }

  private createWorker(queueName: QueueName, concurrency: number): Worker {
    const worker = new Worker(
      queueName,
      async (job: Job) => this.processJob(job),
      {
        connection: this.connectionOpts,
        prefix: this.prefix,
        concurrency,
      },
    );

    worker.on('completed', (job) =>
      this.logger.debug(`[${queueName}] Job ${job.id} completed`),
    );

    worker.on('failed', (job, err) => {
      this.logger.error(
        `[${queueName}] Job ${job?.id} failed: ${err.message}`,
        err.stack,
      );

      if (job && job.attemptsMade >= (job.opts.attempts ?? 1)) {
        this.logger.error(
          `[${queueName}] Job ${job.id} permanently failed after ${job.attemptsMade} attempts`,
        );
      }
    });

    return worker;
  }

  private initializeWorkers(): void {
    this.workers.set(QueueName.EMAIL, this.createWorker(QueueName.EMAIL, 5));
    this.logger.log('Email worker initialized');

    this.workers.set(
      QueueName.ACTIVITY,
      this.createWorker(QueueName.ACTIVITY, 10),
    );
    this.logger.log('Activity worker initialized');
  }

  private async processJob(job: Job): Promise<void> {
    const processor = this.registry.get(job.name as JobType);

    if (!processor) {
      this.logger.warn(`No processor registered for job type: ${job.name}`);
      return;
    }

    await processor.process(job.data);
  }

  async addJob<T>(
    type: JobType,
    payload: T,
    options?: JobOptions,
  ): Promise<string> {
    const queueName = JOB_TYPE_TO_QUEUE[type];
    const queue = this.queues.get(queueName);

    if (!queue) {
      throw new Error(`Queue "${queueName}" not found`);
    }

    const mergedOptions = { ...DEFAULT_JOB_OPTIONS[type], ...options };

    const job = await queue.add(type, payload, {
      priority: mergedOptions.priority,
      attempts: mergedOptions.attempts,
      backoff: mergedOptions.backoff,
      delay: mergedOptions.delay,
      removeOnComplete: mergedOptions.removeOnComplete,
      removeOnFail: mergedOptions.removeOnFail,
    });

    this.logger.debug(`Job ${job.id} added to queue "${queueName}"`);
    return job.id!;
  }

  async addBulk<T>(
    type: JobType,
    payloads: T[],
    options?: JobOptions,
  ): Promise<string[]> {
    const queueName = JOB_TYPE_TO_QUEUE[type];
    const queue = this.queues.get(queueName);

    if (!queue) {
      throw new Error(`Queue "${queueName}" not found`);
    }

    const mergedOptions = { ...DEFAULT_JOB_OPTIONS[type], ...options };

    const jobs = payloads.map((payload) => ({
      name: type,
      data: payload,
      opts: {
        priority: mergedOptions.priority,
        attempts: mergedOptions.attempts,
        backoff: mergedOptions.backoff,
        delay: mergedOptions.delay,
        removeOnComplete: mergedOptions.removeOnComplete,
        removeOnFail: mergedOptions.removeOnFail,
      },
    }));

    const addedJobs = await queue.addBulk(jobs);
    const jobIds = addedJobs.map((job) => job.id!);

    this.logger.debug(
      `${jobIds.length} jobs added to queue "${queueName}" in bulk`,
    );
    return jobIds;
  }

  async getJobStatus(jobId: string): Promise<JobResult | null> {
    for (const queue of this.queues.values()) {
      const job = await queue.getJob(jobId);
      if (job) {
        const state = await job.getState();
        return {
          id: job.id!,
          status: state as JobResult['status'],
          progress: job.progress as number,
          result: job.returnvalue,
          failedReason: job.failedReason,
          attemptsMade: job.attemptsMade,
          processedOn: job.processedOn ? new Date(job.processedOn) : undefined,
          finishedOn: job.finishedOn ? new Date(job.finishedOn) : undefined,
        };
      }
    }
    return null;
  }

  async removeJob(jobId: string): Promise<boolean> {
    for (const queue of this.queues.values()) {
      const job = await queue.getJob(jobId);
      if (job) {
        await job.remove();
        this.logger.debug(`Job ${jobId} removed`);
        return true;
      }
    }
    return false;
  }

  async isHealthy(): Promise<boolean> {
    try {
      const clients = await Promise.all(
        [...this.queues.values()].map((q) => q.client),
      );
      const pongs = await Promise.all(clients.map((c) => c.ping()));
      return pongs.every((p) => p === 'PONG');
    } catch {
      return false;
    }
  }

  async close(): Promise<void> {
    this.logger.log('Closing BullMQ connections...');

    for (const [name, worker] of this.workers) {
      await worker.close();
      this.logger.debug(`Worker "${name}" closed`);
    }

    for (const [name, queue] of this.queues) {
      await queue.close();
      this.logger.debug(`Queue "${name}" closed`);
    }

    this.logger.log('BullMQ connections closed');
  }

  async onModuleDestroy(): Promise<void> {
    await this.close();
  }
}
