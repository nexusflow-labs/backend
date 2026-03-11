import { Injectable } from '@nestjs/common';
import { IJobProcessor } from '../../queue/interfaces/job-processor.interface';
import {
  JobType,
  EmailInvitationJobPayload,
} from '../../queue/types/job.types';
import { IEmailService } from '../interfaces/email.interface';

@Injectable()
export class EmailInvitationProcessor implements IJobProcessor {
  readonly jobType = JobType.EMAIL_INVITATION;

  constructor(private readonly emailService: IEmailService) {}

  async process(payload: EmailInvitationJobPayload): Promise<void> {
    await this.emailService.sendInvitation(payload.email, {
      inviterName: payload.inviterName,
      workspaceName: payload.workspaceName,
      inviteLink: payload.inviteLink,
      expiresAt: new Date(payload.expiresAt),
    });
  }
}
