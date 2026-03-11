import { Injectable, OnModuleInit } from '@nestjs/common';
import { IJobProcessor } from '../../queue/interfaces/job-processor.interface';
import { ProcessorRegistry } from '../../queue/services/processor-registry.service';
import {
  JobType,
  EmailInvitationJobPayload,
} from '../../queue/types/job.types';
import { IEmailService } from '../interfaces/email.interface';

@Injectable()
export class EmailInvitationProcessor implements IJobProcessor, OnModuleInit {
  readonly jobType = JobType.EMAIL_INVITATION;

  constructor(
    private readonly emailService: IEmailService,
    private readonly registry: ProcessorRegistry,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async process(payload: EmailInvitationJobPayload): Promise<void> {
    await this.emailService.sendInvitation(payload.email, {
      inviterName: payload.inviterName,
      workspaceName: payload.workspaceName,
      inviteLink: payload.inviteLink,
      expiresAt: new Date(payload.expiresAt),
    });
  }
}
