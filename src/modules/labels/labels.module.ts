import { Module } from '@nestjs/common';
import { LabelsController } from './presentation/labels.controller';
import { TaskLabelsController } from './presentation/task-labels.controller';
import { ILabelRepository } from './domain/repositories/label.repository';
import { CreateLabelUseCase } from './application/use-cases/create-label.use-case';
import { ListLabelsUseCase } from './application/use-cases/list-labels.use-case';
import { UpdateLabelUseCase } from './application/use-cases/update-label.use-case';
import { DeleteLabelUseCase } from './application/use-cases/delete-label.use-case';
import { AddLabelToTaskUseCase } from './application/use-cases/add-label-to-task.use-case';
import { RemoveLabelFromTaskUseCase } from './application/use-cases/remove-label-from-task.use-case';
import { GetTaskLabelsUseCase } from './application/use-cases/get-task-labels.use-case';
import { ITaskRepository } from '../tasks/domain/repositories/task.repository';
import { IProjectRepository } from '../projects/domain/repositories/project.repository';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { ActivityLogService } from '../activity-logs/application/services/activity-log.service';

@Module({
  imports: [ActivityLogsModule],
  controllers: [LabelsController, TaskLabelsController],
  providers: [
    {
      provide: CreateLabelUseCase,
      inject: [ILabelRepository, ActivityLogService],
      useFactory: (
        repo: ILabelRepository,
        activityLogService: ActivityLogService,
      ) => new CreateLabelUseCase(repo, activityLogService),
    },
    {
      provide: ListLabelsUseCase,
      inject: [ILabelRepository],
      useFactory: (repo: ILabelRepository) => new ListLabelsUseCase(repo),
    },
    {
      provide: UpdateLabelUseCase,
      inject: [ILabelRepository, ActivityLogService],
      useFactory: (
        repo: ILabelRepository,
        activityLogService: ActivityLogService,
      ) => new UpdateLabelUseCase(repo, activityLogService),
    },
    {
      provide: DeleteLabelUseCase,
      inject: [ILabelRepository, ActivityLogService],
      useFactory: (
        repo: ILabelRepository,
        activityLogService: ActivityLogService,
      ) => new DeleteLabelUseCase(repo, activityLogService),
    },
    {
      provide: AddLabelToTaskUseCase,
      inject: [
        ILabelRepository,
        ITaskRepository,
        IProjectRepository,
        ActivityLogService,
      ],
      useFactory: (
        labelRepo: ILabelRepository,
        taskRepo: ITaskRepository,
        projectRepo: IProjectRepository,
        activityLogService: ActivityLogService,
      ) =>
        new AddLabelToTaskUseCase(
          labelRepo,
          taskRepo,
          projectRepo,
          activityLogService,
        ),
    },
    {
      provide: RemoveLabelFromTaskUseCase,
      inject: [ILabelRepository, ITaskRepository, ActivityLogService],
      useFactory: (
        labelRepo: ILabelRepository,
        taskRepo: ITaskRepository,
        activityLogService: ActivityLogService,
      ) =>
        new RemoveLabelFromTaskUseCase(labelRepo, taskRepo, activityLogService),
    },
    {
      provide: GetTaskLabelsUseCase,
      inject: [ILabelRepository, ITaskRepository],
      useFactory: (labelRepo: ILabelRepository, taskRepo: ITaskRepository) =>
        new GetTaskLabelsUseCase(labelRepo, taskRepo),
    },
  ],
})
export class LabelsModule {}
