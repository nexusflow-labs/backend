import { Injectable, Logger } from '@nestjs/common';
import { IJobProcessor } from '../interfaces/job-processor.interface';
import { JobType } from '../types/job.types';

/**
 * ProcessorRegistry - Central registry for job processors
 *
 * This solves the NestJS limitation where multi-providers with the same token
 * across different modules don't automatically aggregate into an array.
 *
 * Each processor registers itself during OnModuleInit, ensuring all processors
 * are collected regardless of which module they belong to.
 */
@Injectable()
export class ProcessorRegistry {
  private readonly logger = new Logger(ProcessorRegistry.name);
  private readonly processors = new Map<JobType, IJobProcessor>();

  /**
   * Register a processor for a specific job type
   * Called by processors during their OnModuleInit lifecycle
   */
  register(processor: IJobProcessor): void {
    if (this.processors.has(processor.jobType)) {
      this.logger.warn(
        `Processor for ${processor.jobType} already registered, overwriting`,
      );
    }

    this.processors.set(processor.jobType, processor);
    this.logger.debug(`Registered processor for ${processor.jobType}`);
  }

  /**
   * Get a processor by job type
   */
  get(jobType: JobType): IJobProcessor | undefined {
    return this.processors.get(jobType);
  }

  /**
   * Get all registered processors
   */
  getAll(): IJobProcessor[] {
    return Array.from(this.processors.values());
  }

  /**
   * Get count of registered processors
   */
  get count(): number {
    return this.processors.size;
  }

  /**
   * Check if a processor is registered for a job type
   */
  has(jobType: JobType): boolean {
    return this.processors.has(jobType);
  }

  /**
   * Get all registered job types
   */
  getRegisteredTypes(): JobType[] {
    return Array.from(this.processors.keys());
  }
}
