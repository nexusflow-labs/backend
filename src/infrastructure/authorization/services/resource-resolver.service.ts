import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ResourceType,
  ResourceOwnerInfo,
} from '../interfaces/authorization.interfaces';
import { IProjectRepository } from 'src/modules/projects/domain/repositories/project.repository';
import { ITaskRepository } from 'src/modules/tasks/domain/repositories/task.repository';
import { ICommentRepository } from 'src/modules/comments/domain/repositories/comment.repository';
import { ILabelRepository } from 'src/modules/labels/domain/repositories/label.repository';

@Injectable()
export class ResourceResolverService {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly taskRepository: ITaskRepository,
    private readonly commentRepository: ICommentRepository,
    private readonly labelRepository: ILabelRepository,
  ) {}

  /**
   * Resolves the workspaceId for a given resource.
   * Used by WorkspaceMemberGuard to determine workspace membership.
   */
  async resolveWorkspaceId(
    resourceType: ResourceType,
    resourceId: string,
  ): Promise<string | null> {
    switch (resourceType) {
      case ResourceType.WORKSPACE:
        return resourceId;

      case ResourceType.PROJECT: {
        const project = await this.projectRepository.findById(resourceId);
        return project?.workspaceId ?? null;
      }

      case ResourceType.TASK: {
        const task = await this.taskRepository.findById(resourceId);
        if (!task) return null;

        // Task -> Project -> Workspace
        const project = await this.projectRepository.findById(task.projectId);
        return project?.workspaceId ?? null;
      }

      case ResourceType.COMMENT: {
        const comment = await this.commentRepository.findById(resourceId);
        if (!comment) return null;

        // Comment -> Task -> Project -> Workspace
        const task = await this.taskRepository.findById(comment.taskId);
        if (!task) return null;

        const project = await this.projectRepository.findById(task.projectId);
        return project?.workspaceId ?? null;
      }

      case ResourceType.LABEL: {
        const label = await this.labelRepository.findById(resourceId);
        return label?.workspaceId ?? null;
      }

      default:
        return null;
    }
  }

  /**
   * Gets the owner/creator ID and workspaceId for a given resource.
   * Used by ResourceOwnerGuard for ownership validation.
   */
  async getResourceOwner(
    resourceType: ResourceType,
    resourceId: string,
  ): Promise<ResourceOwnerInfo | null> {
    switch (resourceType) {
      case ResourceType.PROJECT: {
        const project = await this.projectRepository.findById(resourceId);
        if (!project) return null;
        return {
          ownerId: project.ownerId,
          workspaceId: project.workspaceId,
        };
      }

      case ResourceType.TASK: {
        const task = await this.taskRepository.findById(resourceId);
        if (!task) return null;

        const project = await this.projectRepository.findById(task.projectId);
        if (!project) return null;

        return {
          ownerId: task.creatorId,
          assigneeId: task.assigneeId,
          workspaceId: project.workspaceId,
        };
      }

      case ResourceType.COMMENT: {
        const comment = await this.commentRepository.findById(resourceId);
        if (!comment) return null;

        // Get workspace through task -> project chain
        const task = await this.taskRepository.findById(comment.taskId);
        if (!task) return null;

        const project = await this.projectRepository.findById(task.projectId);
        if (!project) return null;

        return {
          ownerId: comment.authorId,
          workspaceId: project.workspaceId,
        };
      }

      case ResourceType.LABEL: {
        // Labels don't have individual owners, they belong to the workspace
        // Only OWNER/ADMIN can manage labels
        const label = await this.labelRepository.findById(resourceId);
        if (!label) return null;
        return {
          ownerId: '', // No specific owner
          workspaceId: label.workspaceId,
        };
      }

      case ResourceType.WORKSPACE:
        // Workspace ownership is handled separately through membership
        return null;

      default:
        return null;
    }
  }

  /**
   * Resolves the workspaceId from a projectId parameter.
   * Used for routes like /projects/:projectId/tasks
   */
  async getWorkspaceIdFromProject(projectId: string): Promise<string> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException(`Project not found: ${projectId}`);
    }
    return project.workspaceId;
  }

  /**
   * Resolves the workspaceId from a taskId parameter.
   * Used for routes like /tasks/:taskId/comments
   */
  async getWorkspaceIdFromTask(taskId: string): Promise<string> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundException(`Task not found: ${taskId}`);
    }

    const project = await this.projectRepository.findById(task.projectId);
    if (!project) {
      throw new NotFoundException(`Project not found for task: ${taskId}`);
    }

    return project.workspaceId;
  }
}
