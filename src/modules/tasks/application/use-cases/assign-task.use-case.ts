import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Task } from '../../domain/entities/task.entity';
import { ITaskRepository } from '../../domain/repositories/task.repository';
import { IMemberRepository } from 'src/modules/members/domain/repositories/member.repository';
import { IProjectRepository } from 'src/modules/projects/domain/repositories/project.repository';

@Injectable()
export class AssignTaskUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly memberRepository: IMemberRepository,
  ) {}

  async execute(taskId: string, assigneeId: string | null): Promise<Task> {
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // If assigning to someone (not unassigning)
    if (assigneeId) {
      // Get the project to find the workspace
      const project = await this.projectRepository.findById(task.projectId);
      if (!project) {
        throw new NotFoundException('Project not found');
      }

      // Verify assignee is a member of the workspace
      const member = await this.memberRepository.findByWorkspaceAndUser(
        project.workspaceId,
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
    return task;
  }
}
