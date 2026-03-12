import { Module } from '@nestjs/common';
import { TasksController } from './presentation/tasks.controller';
import { ITaskRepository } from './domain/repositories/task.repository';
import { CreateTaskUseCase } from './application/use-cases/create-task.use-case';
import { ListTasksUseCase } from './application/use-cases/list-tasks.use-case';
import { GetTaskUseCase } from './application/use-cases/get-task.use-case';
import { UpdateTaskUseCase } from './application/use-cases/update-task.use-case';
import { AssignTaskUseCase } from './application/use-cases/assign-task.use-case';
import { DeleteTaskUseCase } from './application/use-cases/delete-task.use-case';
import { GetSubtasksUseCase } from './application/use-cases/get-subtasks.use-case';
import { IProjectRepository } from '../projects/domain/repositories/project.repository';
import { IMemberRepository } from '../members/domain/repositories/member.repository';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { ActivityLogService } from '../activity-logs/application/services/activity-log.service';
import { RealtimeModule } from 'src/infrastructure/realtime';
import { WebsocketEmitterService } from 'src/infrastructure/realtime';
import { NotificationsModule } from '../notifications/notifications.module';
import { CreateNotificationUseCase } from '../notifications/applications/use-case/create-notification.use-case';

@Module({
  imports: [ActivityLogsModule, RealtimeModule, NotificationsModule],
  controllers: [TasksController],
  providers: [
    {
      provide: CreateTaskUseCase,
      inject: [
        ITaskRepository,
        IProjectRepository,
        ActivityLogService,
        WebsocketEmitterService,
      ],
      useFactory: (
        taskRepo: ITaskRepository,
        projectRepo: IProjectRepository,
        activityLogService: ActivityLogService,
        wsEmitter: WebsocketEmitterService,
      ) =>
        new CreateTaskUseCase(
          taskRepo,
          projectRepo,
          activityLogService,
          wsEmitter,
        ),
    },
    {
      provide: ListTasksUseCase,
      inject: [ITaskRepository],
      useFactory: (repo: ITaskRepository) => new ListTasksUseCase(repo),
    },
    {
      provide: GetTaskUseCase,
      inject: [ITaskRepository],
      useFactory: (repo: ITaskRepository) => new GetTaskUseCase(repo),
    },
    {
      provide: UpdateTaskUseCase,
      inject: [ITaskRepository, ActivityLogService, WebsocketEmitterService],
      useFactory: (
        repo: ITaskRepository,
        activityLogService: ActivityLogService,
        wsEmitter: WebsocketEmitterService,
      ) => new UpdateTaskUseCase(repo, activityLogService, wsEmitter),
    },
    {
      provide: AssignTaskUseCase,
      inject: [
        ITaskRepository,
        IProjectRepository,
        IMemberRepository,
        ActivityLogService,
        WebsocketEmitterService,
        CreateNotificationUseCase,
      ],
      useFactory: (
        taskRepo: ITaskRepository,
        projectRepo: IProjectRepository,
        memberRepo: IMemberRepository,
        activityLogService: ActivityLogService,
        wsEmitter: WebsocketEmitterService,
        createNotificationUseCase: CreateNotificationUseCase,
      ) =>
        new AssignTaskUseCase(
          taskRepo,
          projectRepo,
          memberRepo,
          activityLogService,
          wsEmitter,
          createNotificationUseCase,
        ),
    },
    {
      provide: DeleteTaskUseCase,
      inject: [ITaskRepository, ActivityLogService, WebsocketEmitterService],
      useFactory: (
        repo: ITaskRepository,
        activityLogService: ActivityLogService,
        wsEmitter: WebsocketEmitterService,
      ) => new DeleteTaskUseCase(repo, activityLogService, wsEmitter),
    },
    {
      provide: GetSubtasksUseCase,
      inject: [ITaskRepository],
      useFactory: (repo: ITaskRepository) => new GetSubtasksUseCase(repo),
    },
  ],
})
export class TasksModule {}
