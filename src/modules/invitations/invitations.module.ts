import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { ActivityLogService } from '../activity-logs/application/services/activity-log.service';
import { IQueueService } from 'src/infrastructure/queue/interfaces/queue.interface';
import { IInvitationRepository } from './domain/repositories/invitation.repository';
import { PrismaInvitationRepository } from './infrastructure/persistence/prisma-invitation.repository';
import { InvitationController } from './presentation/invitations.controller';
import { CreateInvitationUseCase } from './application/use-case/create-invitation.use-case';
import { AcceptInvitationUseCase } from './application/use-case/accept-invitation.use-case';
import { RejectInvitationUseCase } from './application/use-case/reject-invitation.use-case';
import { ListInvitationsUseCase } from './application/use-case/list-invitation.use-case';
import { CancelInvitationUseCase } from './application/use-case/cancel-invitation.use-case';
import { IMemberRepository } from '../members/domain/repositories/member.repository';
import { MemberModule } from '../members/members.module';
import { IWorkspaceRepository } from '../workspaces/domain/repositories/workspaces.repository';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { IUserRepository } from '../auth/domain/repositories/user.repository';
import { AuthModule } from '../auth/auth.module';
import {
  RealtimeModule,
  WebsocketEmitterService,
} from 'src/infrastructure/realtime';

@Module({
  imports: [
    ActivityLogsModule,
    WorkspacesModule,
    MemberModule,
    AuthModule,
    RealtimeModule,
  ],
  controllers: [InvitationController],
  providers: [
    {
      provide: IInvitationRepository,
      useClass: PrismaInvitationRepository,
    },
    {
      provide: CreateInvitationUseCase,
      inject: [
        IMemberRepository,
        IWorkspaceRepository,
        IInvitationRepository,
        IUserRepository,
        ActivityLogService,
        IQueueService,
        ConfigService,
        WebsocketEmitterService,
      ],
      useFactory: (
        memberRepo: IMemberRepository,
        workspaceRepo: IWorkspaceRepository,
        invitationRepo: IInvitationRepository,
        userRepo: IUserRepository,
        activityLogService: ActivityLogService,
        queueService: IQueueService,
        configService: ConfigService,
        wsEmitter: WebsocketEmitterService,
      ) =>
        new CreateInvitationUseCase(
          invitationRepo,
          workspaceRepo,
          memberRepo,
          userRepo,
          activityLogService,
          queueService,
          configService,
          wsEmitter,
        ),
    },
    {
      provide: AcceptInvitationUseCase,
      inject: [
        IInvitationRepository,
        IMemberRepository,
        IUserRepository,
        ActivityLogService,
        WebsocketEmitterService,
      ],
      useFactory: (
        invitationRepo: IInvitationRepository,
        memberRepo: IMemberRepository,
        userRepo: IUserRepository,
        activityLogService: ActivityLogService,
        wsEmitter: WebsocketEmitterService,
      ) =>
        new AcceptInvitationUseCase(
          invitationRepo,
          memberRepo,
          userRepo,
          activityLogService,
          wsEmitter,
        ),
    },
    {
      provide: RejectInvitationUseCase,
      inject: [
        IInvitationRepository,
        IUserRepository,
        ActivityLogService,
        WebsocketEmitterService,
      ],
      useFactory: (
        invitationRepo: IInvitationRepository,
        userRepo: IUserRepository,
        activityLogService: ActivityLogService,
        wsEmitter: WebsocketEmitterService,
      ) =>
        new RejectInvitationUseCase(
          invitationRepo,
          userRepo,
          activityLogService,
          wsEmitter,
        ),
    },
    {
      provide: ListInvitationsUseCase,
      inject: [IInvitationRepository],
      useFactory: (invitationRepo: IInvitationRepository) =>
        new ListInvitationsUseCase(invitationRepo),
    },
    {
      provide: CancelInvitationUseCase,
      inject: [IInvitationRepository, ActivityLogService],
      useFactory: (
        invitationRepo: IInvitationRepository,
        activityLogService: ActivityLogService,
      ) => new CancelInvitationUseCase(invitationRepo, activityLogService),
    },
  ],
})
export class InvitationModule {}
