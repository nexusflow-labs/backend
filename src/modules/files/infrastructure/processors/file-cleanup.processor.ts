import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { IJobProcessor } from '../../../../infrastructure/queue/interfaces/job-processor.interface';
import { ProcessorRegistry } from '../../../../infrastructure/queue/services/processor-registry.service';
import { IQueueService } from '../../../../infrastructure/queue/interfaces/queue.interface';
import { JobType } from '../../../../infrastructure/queue/types/job.types';
import { CleanupExpiredUploadsUseCase } from '../../application/use-cases/cleanup-expired-uploads.use-case';

/**
 * File Cleanup Processor
 *
 * Processes file cleanup jobs that remove:
 * - Expired pending uploads (URLs that were never used)
 * - Orphaned uploads (files uploaded but never attached)
 *
 * Jobs are scheduled via:
 * - Cron job (if @nestjs/schedule is available)
 * - Manual trigger via admin endpoint
 * - BullMQ repeatable job configuration
 */
@Injectable()
export class FileCleanupProcessor implements IJobProcessor, OnModuleInit {
  private readonly logger = new Logger(FileCleanupProcessor.name);
  readonly jobType = JobType.FILE_CLEANUP;

  constructor(
    private readonly cleanupUseCase: CleanupExpiredUploadsUseCase,
    private readonly registry: ProcessorRegistry,
    private readonly queueService: IQueueService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);

    // Schedule initial cleanup after a delay
    void this.scheduleInitialCleanup();
  }

  async process(): Promise<void> {
    this.logger.log('Starting file cleanup job...');

    try {
      const result = await this.cleanupUseCase.execute();

      this.logger.log(
        `File cleanup completed: ${result.expiredCount} expired, ${result.orphanedCount} orphaned`,
      );

      if (result.errors.length > 0) {
        this.logger.warn(`Cleanup had ${result.errors.length} errors`);
      }
    } catch (error) {
      this.logger.error(`File cleanup failed: ${error}`);
      throw error;
    }
  }

  /**
   * Schedule initial cleanup after app startup
   */
  private async scheduleInitialCleanup(): Promise<void> {
    await this.queueService.addJob(
      JobType.FILE_CLEANUP,
      {},
      {
        repeat: {
          cron: '0 0 * * * *',
        },
      },
    );
  }

  /**
   * Manually trigger a cleanup job
   */
  async triggerCleanup(): Promise<string> {
    return this.queueService.addJob(JobType.FILE_CLEANUP, {});
  }
}
