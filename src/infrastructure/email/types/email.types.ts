export enum EmailProvider {
  SENDGRID = 'sendgrid',
  NODEMAILER = 'nodemailer',
  CONSOLE = 'console',
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface InvitationEmailData {
  inviterName: string;
  workspaceName: string;
  inviteLink: string;
  expiresAt: Date;
}

export interface PasswordResetEmailData {
  userName: string;
  resetLink: string;
  expiresAt: Date;
}
