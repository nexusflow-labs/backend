import { Module } from '@nestjs/common';
import { ActivityLogsController } from './presentation/activity-logs.controller';
import { IActivityLogRepository } from './domain/repositories/activity-log.repository';
import { ActivityLogService } from './application/services/activity-log.service';
import { ListActivitiesUseCase } from './application/use-cases/list-activities.use-case';
import { ActivityLogProcessor } from './infrastructure/processors/activity-log.processor';

@Module({
  controllers: [ActivityLogsController],
  providers: [
    {
      provide: ActivityLogService,
      inject: [IActivityLogRepository],
      useFactory: (repo: IActivityLogRepository) =>
        new ActivityLogService(repo),
    },
    {
      provide: ListActivitiesUseCase,
      inject: [IActivityLogRepository],
      useFactory: (repo: IActivityLogRepository) =>
        new ListActivitiesUseCase(repo),
    },
    ActivityLogProcessor,
  ],
  exports: [ActivityLogService],
})
export class ActivityLogsModule {}
