import { Injectable, NotFoundException } from '@nestjs/common';
import { Project } from '../../domain/entities/project.entity';
import { IProjectRepository } from '../../domain/repositories/project.repository';
import { IMemberRepository } from 'src/modules/members/domain/repositories/member.repository';

@Injectable()
export class CreateProjectUseCase {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly memberRepository: IMemberRepository,
  ) {}

  async execute(
    name: string,
    workspaceId: string,
    ownerId: string,
    description?: string,
  ): Promise<Project> {
    // Validate business rules
    if (name.length < 2) {
      throw new Error('Project name must be at least 2 characters');
    }

    // Verify user is a member of the workspace
    const member = await this.memberRepository.findByWorkspaceAndUser(
      workspaceId,
      ownerId,
    );

    if (!member) {
      throw new NotFoundException('User is not a member of this workspace');
    }

    return this.projectRepository.create({
      name,
      description,
      workspaceId,
      ownerId,
    });
  }
}
