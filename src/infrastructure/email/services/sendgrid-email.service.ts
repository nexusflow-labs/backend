import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import { IEmailService } from '../interfaces/email.interface';
import { TemplateService } from '../templates/template.service';
import {
  InvitationEmailData,
  PasswordResetEmailData,
  SendEmailOptions,
} from '../types/email.types';

@Injectable()
export class SendGridEmailService extends IEmailService {
  private readonly logger = new Logger(SendGridEmailService.name);
  private readonly defaultFrom: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly templateService: TemplateService,
  ) {
    super();

    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (apiKey) {
      sgMail.setApiKey(apiKey);
    }

    const fromName = this.configService.get<string>(
      'EMAIL_FROM_NAME',
      'NexusFlow',
    );
    const fromAddress = this.configService.get<string>(
      'EMAIL_FROM_ADDRESS',
      'noreply@nexusflow.com',
    );
    this.defaultFrom = `${fromName} <${fromAddress}>`;

    this.logger.log('SendGrid email service initialized');
  }

  async send(options: SendEmailOptions): Promise<void> {
    try {
      const msg = {
        to: options.to,
        from: options.from || this.defaultFrom,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const [response] = await sgMail.send(msg);

      this.logger.log(
        `Email sent successfully via SendGrid: ${response.statusCode}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send email via SendGrid: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async sendInvitation(
    email: string,
    data: InvitationEmailData,
  ): Promise<void> {
    const rendered = this.templateService.renderInvitation(data);

    await this.send({
      to: email,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });

    this.logger.log(`Invitation email sent to ${email} via SendGrid`);
  }

  async sendPasswordReset(
    email: string,
    data: PasswordResetEmailData,
  ): Promise<void> {
    const rendered = this.templateService.renderPasswordReset(data);

    await this.send({
      to: email,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });

    this.logger.log(`Password reset email sent to ${email} via SendGrid`);
  }
}
