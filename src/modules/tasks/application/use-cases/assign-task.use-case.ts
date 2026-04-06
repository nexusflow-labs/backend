import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { Task } from '../../domain/entities/task.entity';
import { ITaskRepository } from '../../domain/repositories/task.repository';
import { IMemberRepository } from 'src/modules/members/domain/repositories/member.repository';
import { IProjectRepository } from 'src/modules/projects/domain/repositories/project.repository';
import { ActivityLogService } from 'src/modules/activity-logs/application/services/activity-log.service';
import {
  WebsocketEmitterService,
  RealtimeEvents,
} from 'src/infrastructure/realtime';
import { CreateNotificationUseCase } from 'src/modules/notifications/applications/use-case/create-notification.use-case';
import { NotificationType } from 'src/modules/notifications/domain/entities/notification.enum';
import { EntityType } from 'src/modules/activity-logs/domain/enums/entity-type.enum';

@Injectable()
export class AssignTaskUseCase {
  constructor(
    @Inject(ITaskRepository)
    private readonly taskRepository: ITaskRepository,
    @Inject(IProjectRepository)
    private readonly projectRepository: IProjectRepository,
    @Inject(IMemberRepository)
    private readonly memberRepository: IMemberRepository,
    private readonly activityLogService: ActivityLogService,
    private readonly wsEmitter: WebsocketEmitterService,
    private readonly createNotificationUseCase: CreateNotificationUseCase,
  ) {}

  async execute(
    taskId: string,
    assigneeId: string | null,
    userId: string,
  ): Promise<Task> {
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const previousAssigneeId = task.assigneeId;

    const project = await this.projectRepository.findById(task.projectId);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const workspaceId = project.workspaceId;

    // If assigning to someone (not unassigning)
    if (assigneeId) {
      // Verify assignee is a member of the workspace
      const member = await this.memberRepository.findByWorkspaceAndUser(
        workspaceId,
        assigneeId,
      );

      if (!member) {
        throw new BadRequestException(
          'Assignee is not a member of this workspace',
        );
      }
    }

    task.assign(assigneeId);
    await this.taskRepository.save(task);

    // Log the assignment/unassignment
    if (assigneeId) {
      await this.activityLogService.logAssign(
        taskId,
        userId,
        workspaceId,
        assigneeId,
      );
    } else if (previousAssigneeId) {
      await this.activityLogService.logUnassign(
        taskId,
        userId,
        workspaceId,
        previousAssigneeId,
      );
    }

    this.wsEmitter.emitToProject(task.projectId, RealtimeEvents.TASK_ASSIGNED, {
      taskId,
      assigneeId,
      previousAssigneeId,
      assignedBy: userId,
    });

    // Also notify the assignee directly
    if (assigneeId) {
      this.wsEmitter.emitToUser(assigneeId, RealtimeEvents.TASK_ASSIGNED, {
        taskId,
        taskTitle: task.title,
        projectId: task.projectId,
        assignedBy: userId,
      });

      // Create in-app notification for assignee (skip if self-assign)
      if (assigneeId !== userId) {
        await this.createNotificationUseCase.execute(
          assigneeId,
          NotificationType.TASK_ASSIGNED,
          EntityType.TASK,
          taskId,
          `You have been assigned to task: ${task.title}`,
          userId,
          workspaceId,
          undefined,
          { taskId, projectId: task.projectId },
        );
      }
    }

    return task;
  }
}
