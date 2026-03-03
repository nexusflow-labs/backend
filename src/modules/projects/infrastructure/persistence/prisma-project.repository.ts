import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import {
  IProjectRepository,
  CreateProjectData,
} from '../../domain/repositories/project.repository';
import { Project } from '../../domain/entities/project.entity';
import { ProjectMapper } from '../mappers/project.mapper';

@Injectable()
export class PrismaProjectRepository implements IProjectRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateProjectData): Promise<Project> {
    const result = await this.prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        workspaceId: data.workspaceId,
        ownerId: data.ownerId,
      },
    });

    return ProjectMapper.toEntity(result);
  }

  async save(project: Project): Promise<void> {
    await this.prisma.project.update({
      where: { id: project.id },
      data: {
        name: project.name,
        description: project.description,
        status: project.status,
      },
    });
  }

  async findById(id: string): Promise<Project | null> {
    const result = await this.prisma.project.findFirst({
      where: { id, deletedAt: null },
    });

    if (!result) {
      return null;
    }

    return ProjectMapper.toEntity(result);
  }

  async findByWorkspace(workspaceId: string): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      where: { workspaceId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    return projects.map((p) => ProjectMapper.toEntity(p));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.softDelete('project', id);
  }
}
