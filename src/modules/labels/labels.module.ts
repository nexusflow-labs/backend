import { Module } from '@nestjs/common';
import { LabelsController } from './presentation/labels.controller';
import { TaskLabelsController } from './presentation/task-labels.controller';
import { ILabelRepository } from './domain/repositories/label.repository';
import { PrismaLabelRepository } from './infrastructure/persistence/prisma-label.repository';
import { CreateLabelUseCase } from './application/use-cases/create-label.use-case';
import { ListLabelsUseCase } from './application/use-cases/list-labels.use-case';
import { UpdateLabelUseCase } from './application/use-cases/update-label.use-case';
import { DeleteLabelUseCase } from './application/use-cases/delete-label.use-case';
import { AddLabelToTaskUseCase } from './application/use-cases/add-label-to-task.use-case';
import { RemoveLabelFromTaskUseCase } from './application/use-cases/remove-label-from-task.use-case';
import { GetTaskLabelsUseCase } from './application/use-cases/get-task-labels.use-case';
import { ITaskRepository } from '../tasks/domain/repositories/task.repository';
import { PrismaTaskRepository } from '../tasks/infrastructure/persistence/prisma-task.repository';
import { IProjectRepository } from '../projects/domain/repositories/project.repository';
import { PrismaProjectRepository } from '../projects/infrastructure/persistence/prisma-project.repository';

@Module({
  controllers: [LabelsController, TaskLabelsController],
  providers: [
    {
      provide: ILabelRepository,
      useClass: PrismaLabelRepository,
    },
    {
      provide: ITaskRepository,
      useClass: PrismaTaskRepository,
    },
    {
      provide: IProjectRepository,
      useClass: PrismaProjectRepository,
    },
    {
      provide: CreateLabelUseCase,
      inject: [ILabelRepository],
      useFactory: (repo: ILabelRepository) => new CreateLabelUseCase(repo),
    },
    {
      provide: ListLabelsUseCase,
      inject: [ILabelRepository],
      useFactory: (repo: ILabelRepository) => new ListLabelsUseCase(repo),
    },
    {
      provide: UpdateLabelUseCase,
      inject: [ILabelRepository],
      useFactory: (repo: ILabelRepository) => new UpdateLabelUseCase(repo),
    },
    {
      provide: DeleteLabelUseCase,
      inject: [ILabelRepository],
      useFactory: (repo: ILabelRepository) => new DeleteLabelUseCase(repo),
    },
    {
      provide: AddLabelToTaskUseCase,
      inject: [ILabelRepository, ITaskRepository, IProjectRepository],
      useFactory: (
        labelRepo: ILabelRepository,
        taskRepo: ITaskRepository,
        projectRepo: IProjectRepository,
      ) => new AddLabelToTaskUseCase(labelRepo, taskRepo, projectRepo),
    },
    {
      provide: RemoveLabelFromTaskUseCase,
      inject: [ILabelRepository, ITaskRepository],
      useFactory: (labelRepo: ILabelRepository, taskRepo: ITaskRepository) =>
        new RemoveLabelFromTaskUseCase(labelRepo, taskRepo),
    },
    {
      provide: GetTaskLabelsUseCase,
      inject: [ILabelRepository, ITaskRepository],
      useFactory: (labelRepo: ILabelRepository, taskRepo: ITaskRepository) =>
        new GetTaskLabelsUseCase(labelRepo, taskRepo),
    },
  ],
  exports: [ILabelRepository],
})
export class LabelsModule {}
