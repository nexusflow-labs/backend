import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from './infrastructure/config/config.module';
import { CacheModule } from './infrastructure/cache/cache.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { LoggerMiddleware } from './infrastructure/common/middlewares/logger.middleware';
import { requestTracker } from './infrastructure/common/middlewares/request-tracker.middleware';
import { ContextMiddleware } from './infrastructure/common/middlewares/context.middleware';
import { UserModule } from './modules/users/users.module';
import { MemberModule } from './modules/members/members.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { CommentsModule } from './modules/comments/comments.module';
import { LabelsModule } from './modules/labels/labels.module';
import { ActivityLogsModule } from './modules/activity-logs/activity-logs.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule,
    CacheModule,
    WorkspacesModule,
    UserModule,
    MemberModule,
    ProjectsModule,
    TasksModule,
    CommentsModule,
    LabelsModule,
    ActivityLogsModule,
    DashboardModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(requestTracker, ContextMiddleware, LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
