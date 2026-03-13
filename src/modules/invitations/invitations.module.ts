import { Module } from '@nestjs/common';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { InvitationController } from './presentation/invitations.controller';
import { CreateInvitationUseCase } from './application/use-case/create-invitation.use-case';
import { AcceptInvitationUseCase } from './application/use-case/accept-invitation.use-case';
import { RejectInvitationUseCase } from './application/use-case/reject-invitation.use-case';
import { ListInvitationsUseCase } from './application/use-case/list-invitation.use-case';
import { CancelInvitationUseCase } from './application/use-case/cancel-invitation.use-case';
import { RealtimeModule } from 'src/infrastructure/realtime';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [ActivityLogsModule, RealtimeModule, NotificationsModule],
  controllers: [InvitationController],
  providers: [
    CreateInvitationUseCase,
    AcceptInvitationUseCase,
    RejectInvitationUseCase,
    ListInvitationsUseCase,
    CancelInvitationUseCase,
  ],
})
export class InvitationModule {}
