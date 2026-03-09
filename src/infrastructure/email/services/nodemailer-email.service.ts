import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { IEmailService } from '../interfaces/email.interface';
import { TemplateService } from '../templates/template.service';
import {
  InvitationEmailData,
  PasswordResetEmailData,
  SendEmailOptions,
} from '../types/email.types';

@Injectable()
export class NodemailerEmailService extends IEmailService {
  private readonly logger = new Logger(NodemailerEmailService.name);
  private readonly transporter: Transporter;
  private readonly defaultFrom: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly templateService: TemplateService,
  ) {
    super();

    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const secure = this.configService.get<string>('SMTP_SECURE') === 'true';
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASSWORD');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth:
        user && pass
          ? {
              user,
              pass,
            }
          : undefined,
    });

    const fromName = this.configService.get<string>(
      'EMAIL_FROM_NAME',
      'NexusFlow',
    );
    const fromAddress = this.configService.get<string>(
      'EMAIL_FROM_ADDRESS',
      'noreply@nexusflow.com',
    );
    this.defaultFrom = `${fromName} <${fromAddress}>`;

    this.logger.log(`Nodemailer configured with SMTP host: ${host}:${port}`);
  }

  async send(options: SendEmailOptions): Promise<void> {
    try {
      const result = await this.transporter.sendMail({
        from: options.from || this.defaultFrom,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      this.logger.log(`Email sent successfully: ${result.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
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

    this.logger.log(`Invitation email sent to ${email}`);
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

    this.logger.log(`Password reset email sent to ${email}`);
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      this.logger.error(`SMTP connection failed: ${error.message}`);
      return false;
    }
  }
}
