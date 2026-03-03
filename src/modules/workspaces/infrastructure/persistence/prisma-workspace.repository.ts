import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import {
  IWorkspaceRepository,
  CreateWorkspaceData,
} from '../../domain/repositories/workspaces.repository';
import { Workspace } from '../../domain/entities/workspace.entity';
import { WorkspaceMapper } from '../mappers/workspace.mapper';
import { MemberRole } from 'src/modules/members/domain/entities/member.entity';

@Injectable()
export class PrismaWorkspaceRepository implements IWorkspaceRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateWorkspaceData): Promise<Workspace> {
    const result = await this.prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name: data.name,
          description: data.description,
        },
      });

      await tx.member.create({
        data: {
          userId: data.creatorId,
          workspaceId: workspace.id,
          role: MemberRole.OWNER,
        },
      });

      return workspace;
    });

    return WorkspaceMapper.toEntity(result);
  }

  async save(workspace: Workspace): Promise<void> {
    await this.prisma.workspace.update({
      where: { id: workspace.id },
      data: {
        name: workspace.name,
        description: workspace.description,
      },
    });
  }

  async findAll(): Promise<Workspace[]> {
    const workspaces = await this.prisma.workspace.findMany({
      where: { deletedAt: null },
    });
    return workspaces.map((workspace) => WorkspaceMapper.toEntity(workspace));
  }

  async findById(id: string): Promise<Workspace | null> {
    const result = await this.prisma.workspace.findFirst({
      where: { id, deletedAt: null },
    });

    if (!result) {
      return null;
    }

    return WorkspaceMapper.toEntity(result);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.softDelete('workspace', id);
  }
}
