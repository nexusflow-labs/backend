import { Injectable } from '@nestjs/common';
import {
  InvitationEmailData,
  PasswordResetEmailData,
} from '../types/email.types';
import {
  renderInvitationHtml,
  renderInvitationText,
} from './templates/invitation.template';
import {
  renderPasswordResetHtml,
  renderPasswordResetText,
} from './templates/password-reset.template';

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

@Injectable()
export class TemplateService {
  renderInvitation(data: InvitationEmailData): RenderedEmail {
    return {
      subject: `You're invited to join ${data.workspaceName} on NexusFlow`,
      html: renderInvitationHtml(data),
      text: renderInvitationText(data),
    };
  }

  renderPasswordReset(data: PasswordResetEmailData): RenderedEmail {
    return {
      subject: 'Reset your NexusFlow password',
      html: renderPasswordResetHtml(data),
      text: renderPasswordResetText(data),
    };
  }
}
