import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { Task, TaskPriority } from '../../domain/entities/task.entity';
import { ITaskRepository } from '../../domain/repositories/task.repository';
import { IProjectRepository } from 'src/modules/projects/domain/repositories/project.repository';
import { ActivityLogService } from 'src/modules/activity-logs/application/services/activity-log.service';
import { EntityType } from 'src/modules/activity-logs/domain/enums/entity-type.enum';
import {
  WebsocketEmitterService,
  RealtimeEvents,
} from 'src/infrastructure/realtime';

@Injectable()
export class CreateTaskUseCase {
  constructor(
    @Inject(ITaskRepository)
    private readonly taskRepository: ITaskRepository,
    @Inject(IProjectRepository)
    private readonly projectRepository: IProjectRepository,
    private readonly activityLogService: ActivityLogService,
    private readonly wsEmitter: WebsocketEmitterService,
  ) {}

  async execute(
    title: string,
    projectId: string,
    creatorId: string,
    description?: string,
    dueDate?: Date,
    priority?: TaskPriority,
    parentId?: string,
  ): Promise<Task> {
    // Validate business rules
    if (title.length < 2) {
      throw new Error('Task title must be at least 2 characters');
    }

    // Verify project exists
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // If parentId is provided, validate parent task
    if (parentId) {
      const parentTask = await this.taskRepository.findById(parentId);
      if (!parentTask) {
        throw new NotFoundException('Parent task not found');
      }
      if (parentTask.projectId !== projectId) {
        throw new BadRequestException(
          'Parent task must be in the same project',
        );
      }
    }

    const task = await this.taskRepository.create({
      title,
      description,
      projectId,
      creatorId,
      dueDate,
      priority,
      parentId,
    });

    await this.activityLogService.logCreate(
      EntityType.TASK,
      task.id,
      creatorId,
      {
        title: task.title,
        projectId,
        parentId,
      },
    );

    this.wsEmitter.emitToProject(projectId, RealtimeEvents.TASK_CREATED, {
      task: {
        id: task.id,
        title: task.title,
        projectId: task.projectId,
        creatorId: task.creatorId,
        status: task.status,
        priority: task.priority,
        parentId: task.parentId,
      },
    });

    return task;
  }
}
