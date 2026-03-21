import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './modules/auth/infrastructure/guards/jwt-auth.guard';
import { ConfigModule } from './infrastructure/config/config.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { CacheModule } from './infrastructure/cache/cache.module';
import { EmailModule } from './infrastructure/email/email.module';
import { AuthorizationModule } from './infrastructure/authorization/authorization.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { LoggerMiddleware } from './infrastructure/common/middlewares/logger.middleware';
import { requestTracker } from './infrastructure/common/middlewares/request-tracker.middleware';
import { ContextMiddleware } from './infrastructure/common/middlewares/context.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { MemberModule } from './modules/members/members.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { CommentsModule } from './modules/comments/comments.module';
import { LabelsModule } from './modules/labels/labels.module';
import { ActivityLogsModule } from './modules/activity-logs/activity-logs.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { InvitationModule } from './modules/invitations/invitations.module';
import { QueueModule } from './infrastructure/queue/queue.module';
import { RealtimeModule } from './infrastructure/realtime/realtime.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { FilesModule } from './modules/files/files.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    DatabaseModule,
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: configService.get<number>('THROTTLE_TTL', 60000),
            limit: configService.get<number>('THROTTLE_LIMIT', 60),
          },
        ],
      }),
    }),
    CacheModule,
    HealthModule,
    AuthorizationModule,
    // QueueModule must be imported BEFORE modules with processors
    // so ProcessorRegistry is available for injection
    QueueModule,
    EmailModule,
    ActivityLogsModule,
    WorkspacesModule,
    AuthModule,
    MemberModule,
    ProjectsModule,
    TasksModule,
    CommentsModule,
    LabelsModule,
    DashboardModule,
    InvitationModule,
    RealtimeModule,
    NotificationsModule,
    FilesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(requestTracker, ContextMiddleware, LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
