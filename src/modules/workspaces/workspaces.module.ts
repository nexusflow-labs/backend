import { Module } from '@nestjs/common';
import { WorkspacesController } from './presentation/workspaces.controller';
import { IWorkspaceRepository } from './domain/repositories/workspaces.repository';
import { CreateWorkspaceUseCase } from './application/use-cases/create-workspace.use-case';
import { ListWorkspacesUseCase } from './application/use-cases/list-workspaces.use-case';
import { GetWorkspaceUseCase } from './application/use-cases/get-workspace.use-case';
import { UpdateWorkspaceUseCase } from './application/use-cases/update-workspace.use-case';
import { RemoveWorkspaceUseCase } from './application/use-cases/remove-workspace.use-case';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { ActivityLogService } from '../activity-logs/application/services/activity-log.service';

@Module({
  imports: [ActivityLogsModule],
  controllers: [WorkspacesController],
  providers: [
    {
      provide: CreateWorkspaceUseCase,
      inject: [IWorkspaceRepository, ActivityLogService],
      useFactory: (
        repo: IWorkspaceRepository,
        activityLogService: ActivityLogService,
      ) => new CreateWorkspaceUseCase(repo, activityLogService),
    },
    {
      provide: ListWorkspacesUseCase,
      inject: [IWorkspaceRepository],
      useFactory: (repo: IWorkspaceRepository) =>
        new ListWorkspacesUseCase(repo),
    },
    {
      provide: GetWorkspaceUseCase,
      inject: [IWorkspaceRepository],
      useFactory: (repo: IWorkspaceRepository) => new GetWorkspaceUseCase(repo),
    },
    {
      provide: UpdateWorkspaceUseCase,
      inject: [IWorkspaceRepository, ActivityLogService],
      useFactory: (
        repo: IWorkspaceRepository,
        activityLogService: ActivityLogService,
      ) => new UpdateWorkspaceUseCase(repo, activityLogService),
    },
    {
      provide: RemoveWorkspaceUseCase,
      inject: [IWorkspaceRepository, ActivityLogService],
      useFactory: (
        repo: IWorkspaceRepository,
        activityLogService: ActivityLogService,
      ) => new RemoveWorkspaceUseCase(repo, activityLogService),
    },
  ],
})
export class WorkspacesModule {}
