import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IEmailService } from './interfaces/email.interface';
import { ConsoleEmailService } from './services/console-email.service';
import { NodemailerEmailService } from './services/nodemailer-email.service';
import { SendGridEmailService } from './services/sendgrid-email.service';
import { TemplateService } from './templates/template.service';
import { EmailInvitationProcessor } from './processors/email-invitation.processor';
import { EmailPasswordResetProcessor } from './processors/email-password-reset.processor';

@Global()
@Module({
  providers: [
    TemplateService,
    {
      provide: IEmailService,
      useFactory: (
        configService: ConfigService,
        templateService: TemplateService,
      ): IEmailService => {
        const logger = new Logger('EmailModule');
        const provider = configService.get<string>('EMAIL_PROVIDER', 'console');

        // Try SendGrid first if configured
        if (
          provider === 'sendgrid' ||
          configService.get<string>('SENDGRID_API_KEY')
        ) {
          const apiKey = configService.get<string>('SENDGRID_API_KEY');
          if (apiKey) {
            logger.log('Using SendGrid email service');
            return new SendGridEmailService(configService, templateService);
          }
        }

        // Try nodemailer if SMTP configured
        if (
          provider === 'nodemailer' ||
          configService.get<string>('SMTP_HOST')
        ) {
          const host = configService.get<string>('SMTP_HOST');
          if (host) {
            logger.log('Using Nodemailer email service');
            return new NodemailerEmailService(configService, templateService);
          }
        }

        // Fallback to console logger
        logger.warn('No email provider configured, using console logging');
        return new ConsoleEmailService(templateService);
      },
      inject: [ConfigService, TemplateService],
    },
    // Processors register themselves with ProcessorRegistry via OnModuleInit
    EmailInvitationProcessor,
    EmailPasswordResetProcessor,
  ],
  exports: [IEmailService, TemplateService],
})
export class EmailModule {}
