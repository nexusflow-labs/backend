import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Task, TaskPriority } from '../../domain/entities/task.entity';
import { ITaskRepository } from '../../domain/repositories/task.repository';
import { IProjectRepository } from 'src/modules/projects/domain/repositories/project.repository';

@Injectable()
export class CreateTaskUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly projectRepository: IProjectRepository,
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

    return this.taskRepository.create({
      title,
      description,
      projectId,
      creatorId,
      dueDate,
      priority,
      parentId,
    });
  }
}
