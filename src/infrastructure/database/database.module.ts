import { Global, Module } from '@nestjs/common';

// Repository interfaces
import { IMemberRepository } from 'src/modules/members/domain/repositories/member.repository';
import { IProjectRepository } from 'src/modules/projects/domain/repositories/project.repository';
import { ITaskRepository } from 'src/modules/tasks/domain/repositories/task.repository';
import { ICommentRepository } from 'src/modules/comments/domain/repositories/comment.repository';
import { ILabelRepository } from 'src/modules/labels/domain/repositories/label.repository';
import { IWorkspaceRepository } from 'src/modules/workspaces/domain/repositories/workspaces.repository';
import { IUserRepository } from 'src/modules/auth/domain/repositories/user.repository';
import { IRefreshTokenRepository } from 'src/modules/auth/domain/repositories/refresh-token.repository';
import { IPasswordResetTokenRepository } from 'src/modules/auth/domain/repositories/password-reset-token.repository';
import { IActivityLogRepository } from 'src/modules/activity-logs/domain/repositories/activity-log.repository';
import { IStatisticsRepository } from 'src/modules/dashboard/domain/repositories/statistics.repository';
import { IInvitationRepository } from 'src/modules/invitations/domain/repositories/invitation.repository';
import { INotificationRepository } from 'src/modules/notifications/domain/repositories/notification.repository';

// Repository implementations
import { PrismaMemberRepository } from 'src/modules/members/infrastructure/persistence/prisma-member.repository';
import { PrismaProjectRepository } from 'src/modules/projects/infrastructure/persistence/prisma-project.repository';
import { PrismaTaskRepository } from 'src/modules/tasks/infrastructure/persistence/prisma-task.repository';
import { PrismaCommentRepository } from 'src/modules/comments/infrastructure/persistence/prisma-comment.repository';
import { PrismaLabelRepository } from 'src/modules/labels/infrastructure/persistence/prisma-label.repository';
import { PrismaWorkspaceRepository } from 'src/modules/workspaces/infrastructure/persistence/prisma-workspace.repository';
import { PrismaUserRepository } from 'src/modules/auth/infrastructure/persistence/prisma-users.repository';
import { PrismaRefreshTokenRepository } from 'src/modules/auth/infrastructure/persistence/prisma-refresh-token.repository';
import { PrismaPasswordResetTokenRepository } from 'src/modules/auth/infrastructure/persistence/prisma-password-reset-token.repository';
import { PrismaActivityLogRepository } from 'src/modules/activity-logs/infrastructure/persistence/prisma-activity-log.repository';
import { PrismaStatisticsRepository } from 'src/modules/dashboard/infrastructure/persistence/prisma-statistics.repository';
import { PrismaInvitationRepository } from 'src/modules/invitations/infrastructure/persistence/prisma-invitation.repository';
import { PrismaNotificationRepository } from 'src/modules/notifications/infrastructure/persistence/prisma-notification.repository';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * DatabaseModule provides all repository implementations globally.
 * This eliminates circular dependencies between feature modules.
 *
 * All repositories depend only on PrismaService, which is also global.
 */
@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    // Auth repositories
    { provide: IUserRepository, useClass: PrismaUserRepository },
    {
      provide: IRefreshTokenRepository,
      useClass: PrismaRefreshTokenRepository,
    },
    {
      provide: IPasswordResetTokenRepository,
      useClass: PrismaPasswordResetTokenRepository,
    },
    // Core domain repositories
    { provide: IWorkspaceRepository, useClass: PrismaWorkspaceRepository },
    { provide: IMemberRepository, useClass: PrismaMemberRepository },
    { provide: IProjectRepository, useClass: PrismaProjectRepository },
    { provide: ITaskRepository, useClass: PrismaTaskRepository },
    { provide: ICommentRepository, useClass: PrismaCommentRepository },
    { provide: ILabelRepository, useClass: PrismaLabelRepository },
    { provide: IInvitationRepository, useClass: PrismaInvitationRepository },
    // Supporting repositories
    { provide: IActivityLogRepository, useClass: PrismaActivityLogRepository },
    { provide: IStatisticsRepository, useClass: PrismaStatisticsRepository },
    {
      provide: INotificationRepository,
      useClass: PrismaNotificationRepository,
    },
  ],
  exports: [
    IUserRepository,
    IRefreshTokenRepository,
    IPasswordResetTokenRepository,
    IWorkspaceRepository,
    IMemberRepository,
    IProjectRepository,
    ITaskRepository,
    ICommentRepository,
    ILabelRepository,
    IInvitationRepository,
    IActivityLogRepository,
    IStatisticsRepository,
    INotificationRepository,
  ],
})
export class DatabaseModule {}
