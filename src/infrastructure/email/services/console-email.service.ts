import { Injectable, Logger } from '@nestjs/common';
import { IEmailService } from '../interfaces/email.interface';
import { TemplateService } from '../templates/template.service';
import {
  InvitationEmailData,
  PasswordResetEmailData,
  SendEmailOptions,
} from '../types/email.types';

@Injectable()
export class ConsoleEmailService extends IEmailService {
  private readonly logger = new Logger(ConsoleEmailService.name);

  constructor(private readonly templateService: TemplateService) {
    super();
  }

  send(options: SendEmailOptions): Promise<void> {
    const recipients = Array.isArray(options.to)
      ? options.to.join(', ')
      : options.to;

    this.logger.log('='.repeat(60));
    this.logger.log('EMAIL SENT (Console Mode)');
    this.logger.log('='.repeat(60));
    this.logger.log(`To: ${recipients}`);
    this.logger.log(`From: ${options.from || 'default'}`);
    this.logger.log(`Subject: ${options.subject}`);
    this.logger.log('-'.repeat(60));
    this.logger.log('HTML Content:');
    this.logger.log(options.html.substring(0, 500) + '...');
    this.logger.log('-'.repeat(60));
    if (options.text) {
      this.logger.log('Text Content:');
      this.logger.log(options.text);
    }
    this.logger.log('='.repeat(60));
    return Promise.resolve();
  }

  sendInvitation(email: string, data: InvitationEmailData): Promise<void> {
    const rendered = this.templateService.renderInvitation(data);

    this.logger.log('='.repeat(60));
    this.logger.log('INVITATION EMAIL (Console Mode)');
    this.logger.log('='.repeat(60));
    this.logger.log(`To: ${email}`);
    this.logger.log(`Subject: ${rendered.subject}`);
    this.logger.log(`Inviter: ${data.inviterName}`);
    this.logger.log(`Workspace: ${data.workspaceName}`);
    this.logger.log(`Invite Link: ${data.inviteLink}`);
    this.logger.log(`Expires At: ${data.expiresAt.toISOString()}`);
    this.logger.log('='.repeat(60));
    return Promise.resolve();
  }

  sendPasswordReset(
    email: string,
    data: PasswordResetEmailData,
  ): Promise<void> {
    const rendered = this.templateService.renderPasswordReset(data);

    this.logger.log('='.repeat(60));
    this.logger.log('PASSWORD RESET EMAIL (Console Mode)');
    this.logger.log('='.repeat(60));
    this.logger.log(`To: ${email}`);
    this.logger.log(`Subject: ${rendered.subject}`);
    this.logger.log(`User: ${data.userName}`);
    this.logger.log(`Reset Link: ${data.resetLink}`);
    this.logger.log(`Expires At: ${data.expiresAt.toISOString()}`);
    this.logger.log('='.repeat(60));
    return Promise.resolve();
  }
}
