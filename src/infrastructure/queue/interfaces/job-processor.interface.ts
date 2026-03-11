import { JobType } from '../types/job.types';

export interface IJobProcessor {
  readonly jobType: JobType;
  process(payload: unknown): Promise<void>;
}

export const JOB_PROCESSOR = 'JOB_PROCESSOR';
