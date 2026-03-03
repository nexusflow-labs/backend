import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import {
  IProjectRepository,
  CreateProjectData,
  ProjectQueryFilters,
  ProjectPaginationParams,
} from '../../domain/repositories/project.repository';
import {
  Project,
  PROJECT_SORT_FIELDS,
  ProjectSortField,
} from '../../domain/entities/project.entity';
import { ProjectMapper } from '../mappers/project.mapper';
import {
  PaginatedResult,
  buildOffsetPagination,
  createOffsetPaginatedResult,
} from 'src/infrastructure/common/pagination';

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

  async findByWorkspacePaginated(
    workspaceId: string,
    filters: ProjectQueryFilters,
    pagination: ProjectPaginationParams,
  ): Promise<PaginatedResult<Project>> {
    const where = this.buildWhereClause(workspaceId, filters);
    const orderBy = this.buildOrderBy(
      pagination.sortBy,
      pagination.sortDirection,
    );
    const { skip, take } = buildOffsetPagination({
      page: pagination.page,
      pageSize: pagination.pageSize,
    });

    const [projects, totalProjects] = await Promise.all([
      this.prisma.project.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      this.prisma.project.count({ where }),
    ]);

    return createOffsetPaginatedResult(
      projects.map((p) => ProjectMapper.toEntity(p)),
      totalProjects,
      pagination.page,
      pagination.pageSize,
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.softDelete('project', id);
  }

  private buildWhereClause(
    workspaceId: string,
    filters: ProjectQueryFilters,
  ): Prisma.ProjectWhereInput {
    const where: Prisma.ProjectWhereInput = {
      workspaceId,
      deletedAt: null,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.ownerId) {
      where.ownerId = filters.ownerId;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private buildOrderBy(
    sortBy: string,
    sortDirection: 'asc' | 'desc',
  ): Prisma.ProjectOrderByWithRelationInput[] {
    const validSortBy = PROJECT_SORT_FIELDS.includes(sortBy as ProjectSortField)
      ? sortBy
      : 'createdAt';
    return [{ [validSortBy]: sortDirection }];
  }
}
