import { Injectable, OnModuleInit } from '@nestjs/common';
import { IJobProcessor } from '../../queue/interfaces/job-processor.interface';
import { ProcessorRegistry } from '../../queue/services/processor-registry.service';
import {
  JobType,
  EmailPasswordResetJobPayload,
} from '../../queue/types/job.types';
import { IEmailService } from '../interfaces/email.interface';

@Injectable()
export class EmailPasswordResetProcessor
  implements IJobProcessor, OnModuleInit
{
  readonly jobType = JobType.EMAIL_PASSWORD_RESET;

  constructor(
    private readonly emailService: IEmailService,
    private readonly registry: ProcessorRegistry,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async process(payload: EmailPasswordResetJobPayload): Promise<void> {
    await this.emailService.sendPasswordReset(payload.email, {
      userName: payload.userName,
      resetLink: payload.resetLink,
      expiresAt: new Date(payload.expiresAt),
    });
  }
}
