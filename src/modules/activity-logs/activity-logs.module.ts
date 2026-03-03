import { Module } from '@nestjs/common';
import { ActivityLogsController } from './presentation/activity-logs.controller';
import { IActivityLogRepository } from './domain/repositories/activity-log.repository';
import { PrismaActivityLogRepository } from './infrastructure/persistence/prisma-activity-log.repository';
import { ActivityLogService } from './application/services/activity-log.service';
import { ListActivitiesUseCase } from './application/use-cases/list-activities.use-case';

@Module({
  controllers: [ActivityLogsController],
  providers: [
    {
      provide: IActivityLogRepository,
      useClass: PrismaActivityLogRepository,
    },
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
  ],
  exports: [ActivityLogService, IActivityLogRepository],
})
export class ActivityLogsModule {}
