import { Module } from '@nestjs/common';
import { TasksController } from './presentation/tasks.controller';
import { CreateTaskUseCase } from './application/use-cases/create-task.use-case';
import { ListTasksUseCase } from './application/use-cases/list-tasks.use-case';
import { GetTaskUseCase } from './application/use-cases/get-task.use-case';
import { UpdateTaskUseCase } from './application/use-cases/update-task.use-case';
import { AssignTaskUseCase } from './application/use-cases/assign-task.use-case';
import { DeleteTaskUseCase } from './application/use-cases/delete-task.use-case';
import { GetSubtasksUseCase } from './application/use-cases/get-subtasks.use-case';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { RealtimeModule } from 'src/infrastructure/realtime';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [ActivityLogsModule, RealtimeModule, NotificationsModule],
  controllers: [TasksController],
  providers: [
    CreateTaskUseCase,
    ListTasksUseCase,
    GetTaskUseCase,
    UpdateTaskUseCase,
    AssignTaskUseCase,
    DeleteTaskUseCase,
    GetSubtasksUseCase,
  ],
})
export class TasksModule {}
