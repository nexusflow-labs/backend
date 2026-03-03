import { Module } from '@nestjs/common';
import { TasksController } from './presentation/tasks.controller';
import { ITaskRepository } from './domain/repositories/task.repository';
import { PrismaTaskRepository } from './infrastructure/persistence/prisma-task.repository';
import { CreateTaskUseCase } from './application/use-cases/create-task.use-case';
import { ListTasksUseCase } from './application/use-cases/list-tasks.use-case';
import { GetTaskUseCase } from './application/use-cases/get-task.use-case';
import { UpdateTaskUseCase } from './application/use-cases/update-task.use-case';
import { AssignTaskUseCase } from './application/use-cases/assign-task.use-case';
import { DeleteTaskUseCase } from './application/use-cases/delete-task.use-case';
import { GetSubtasksUseCase } from './application/use-cases/get-subtasks.use-case';
import { IProjectRepository } from '../projects/domain/repositories/project.repository';
import { PrismaProjectRepository } from '../projects/infrastructure/persistence/prisma-project.repository';
import { IMemberRepository } from '../members/domain/repositories/member.repository';
import { PrismaMemberRepository } from '../members/infrastructure/persistence/prisma-member.repository';

@Module({
  controllers: [TasksController],
  providers: [
    {
      provide: ITaskRepository,
      useClass: PrismaTaskRepository,
    },
    {
      provide: IProjectRepository,
      useClass: PrismaProjectRepository,
    },
    {
      provide: IMemberRepository,
      useClass: PrismaMemberRepository,
    },
    {
      provide: CreateTaskUseCase,
      inject: [ITaskRepository, IProjectRepository],
      useFactory: (
        taskRepo: ITaskRepository,
        projectRepo: IProjectRepository,
      ) => new CreateTaskUseCase(taskRepo, projectRepo),
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
      inject: [ITaskRepository],
      useFactory: (repo: ITaskRepository) => new UpdateTaskUseCase(repo),
    },
    {
      provide: AssignTaskUseCase,
      inject: [ITaskRepository, IProjectRepository, IMemberRepository],
      useFactory: (
        taskRepo: ITaskRepository,
        projectRepo: IProjectRepository,
        memberRepo: IMemberRepository,
      ) => new AssignTaskUseCase(taskRepo, projectRepo, memberRepo),
    },
    {
      provide: DeleteTaskUseCase,
      inject: [ITaskRepository],
      useFactory: (repo: ITaskRepository) => new DeleteTaskUseCase(repo),
    },
    {
      provide: GetSubtasksUseCase,
      inject: [ITaskRepository],
      useFactory: (repo: ITaskRepository) => new GetSubtasksUseCase(repo),
    },
  ],
  exports: [ITaskRepository],
})
export class TasksModule {}
