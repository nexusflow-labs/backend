import { Injectable, OnModuleInit } from '@nestjs/common';
import { IJobProcessor } from '../../../../infrastructure/queue/interfaces/job-processor.interface';
import { ProcessorRegistry } from '../../../../infrastructure/queue/services/processor-registry.service';
import {
  JobType,
  ActivityLogJobPayload,
} from '../../../../infrastructure/queue/types/job.types';
import { ActivityLogService } from '../../application/services/activity-log.service';
import { ActivityAction } from '../../domain/enums/activity-action.enum';
import { EntityType } from '../../domain/enums/entity-type.enum';

@Injectable()
export class ActivityLogProcessor implements IJobProcessor, OnModuleInit {
  readonly jobType = JobType.ACTIVITY_LOG;

  constructor(
    private readonly activityLogService: ActivityLogService,
    private readonly registry: ProcessorRegistry,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async process(payload: ActivityLogJobPayload): Promise<void> {
    const entityType = payload.entityType as EntityType;
    const action = payload.action as ActivityAction;

    switch (action) {
      case ActivityAction.CREATE:
        await this.activityLogService.logCreate(
          entityType,
          payload.entityId,
          payload.userId,
          payload.metadata ?? undefined,
        );
        break;

      case ActivityAction.UPDATE:
        await this.activityLogService.logUpdate(
          entityType,
          payload.entityId,
          payload.userId,
          payload.metadata ?? undefined,
        );
        break;

      case ActivityAction.DELETE:
        await this.activityLogService.logDelete(
          entityType,
          payload.entityId,
          payload.userId,
          payload.metadata ?? undefined,
        );
        break;

      default:
        throw new Error(`Unhandled activity action: ${action}`);
    }
  }
}
