import { Module } from '@nestjs/common';
import { ActivityLogsController } from './presentation/activity-logs.controller';
import { ActivityLogService } from './application/services/activity-log.service';
import { ListActivitiesUseCase } from './application/use-cases/list-activities.use-case';
import { ActivityLogProcessor } from './infrastructure/processors/activity-log.processor';

@Module({
  controllers: [ActivityLogsController],
  providers: [ActivityLogService, ListActivitiesUseCase, ActivityLogProcessor],
  exports: [ActivityLogService],
})
export class ActivityLogsModule {}
