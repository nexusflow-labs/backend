import { Module } from '@nestjs/common';
import { LabelsController } from './presentation/labels.controller';
import { TaskLabelsController } from './presentation/task-labels.controller';
import { CreateLabelUseCase } from './application/use-cases/create-label.use-case';
import { ListLabelsUseCase } from './application/use-cases/list-labels.use-case';
import { UpdateLabelUseCase } from './application/use-cases/update-label.use-case';
import { DeleteLabelUseCase } from './application/use-cases/delete-label.use-case';
import { AddLabelToTaskUseCase } from './application/use-cases/add-label-to-task.use-case';
import { RemoveLabelFromTaskUseCase } from './application/use-cases/remove-label-from-task.use-case';
import { GetTaskLabelsUseCase } from './application/use-cases/get-task-labels.use-case';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';

@Module({
  imports: [ActivityLogsModule],
  controllers: [LabelsController, TaskLabelsController],
  providers: [
    CreateLabelUseCase,
    ListLabelsUseCase,
    UpdateLabelUseCase,
    DeleteLabelUseCase,
    AddLabelToTaskUseCase,
    RemoveLabelFromTaskUseCase,
    GetTaskLabelsUseCase,
  ],
})
export class LabelsModule {}
