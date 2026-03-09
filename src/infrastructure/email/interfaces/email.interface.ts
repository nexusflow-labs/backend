import {
  InvitationEmailData,
  PasswordResetEmailData,
  SendEmailOptions,
} from '../types/email.types';

export abstract class IEmailService {
  abstract send(options: SendEmailOptions): Promise<void>;
  abstract sendInvitation(
    email: string,
    data: InvitationEmailData,
  ): Promise<void>;
  abstract sendPasswordReset(
    email: string,
    data: PasswordResetEmailData,
  ): Promise<void>;
}
