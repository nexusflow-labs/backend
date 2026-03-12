import { Module } from '@nestjs/common';
import { ProjectsController } from './presentation/projects.controller';
import { IProjectRepository } from './domain/repositories/project.repository';
import { CreateProjectUseCase } from './application/use-cases/create-project.use-case';
import { ListProjectsUseCase } from './application/use-cases/list-projects.use-case';
import { GetProjectUseCase } from './application/use-cases/get-project.use-case';
import { UpdateProjectUseCase } from './application/use-cases/update-project.use-case';
import { DeleteProjectUseCase } from './application/use-cases/delete-project.use-case';
import { IMemberRepository } from '../members/domain/repositories/member.repository';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { ActivityLogService } from '../activity-logs/application/services/activity-log.service';
import {
  RealtimeModule,
  WebsocketEmitterService,
} from 'src/infrastructure/realtime';

@Module({
  imports: [ActivityLogsModule, RealtimeModule],
  controllers: [ProjectsController],
  providers: [
    {
      provide: CreateProjectUseCase,
      inject: [
        IProjectRepository,
        IMemberRepository,
        ActivityLogService,
        WebsocketEmitterService,
      ],
      useFactory: (
        projectRepo: IProjectRepository,
        memberRepo: IMemberRepository,
        activityLogService: ActivityLogService,
        wsEmitter: WebsocketEmitterService,
      ) =>
        new CreateProjectUseCase(
          projectRepo,
          memberRepo,
          activityLogService,
          wsEmitter,
        ),
    },
    {
      provide: ListProjectsUseCase,
      inject: [IProjectRepository],
      useFactory: (repo: IProjectRepository) => new ListProjectsUseCase(repo),
    },
    {
      provide: GetProjectUseCase,
      inject: [IProjectRepository],
      useFactory: (repo: IProjectRepository) => new GetProjectUseCase(repo),
    },
    {
      provide: UpdateProjectUseCase,
      inject: [IProjectRepository, ActivityLogService, WebsocketEmitterService],
      useFactory: (
        repo: IProjectRepository,
        activityLogService: ActivityLogService,
        wsEmitter: WebsocketEmitterService,
      ) => new UpdateProjectUseCase(repo, activityLogService, wsEmitter),
    },
    {
      provide: DeleteProjectUseCase,
      inject: [IProjectRepository, ActivityLogService, WebsocketEmitterService],
      useFactory: (
        repo: IProjectRepository,
        activityLogService: ActivityLogService,
        wsEmitter: WebsocketEmitterService,
      ) => new DeleteProjectUseCase(repo, activityLogService, wsEmitter),
    },
  ],
})
export class ProjectsModule {}
