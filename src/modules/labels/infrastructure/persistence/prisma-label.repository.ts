import { Injectable } from '@nestjs/common';
import {
  ILabelRepository,
  CreateLabelData,
} from '../../domain/repositories/label.repository';
import { Label } from '../../domain/entities/label.entity';
import { LabelMapper } from '../mappers/label.mapper';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class PrismaLabelRepository implements ILabelRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateLabelData): Promise<Label> {
    const result = await this.prisma.label.create({
      data: {
        name: data.name,
        color: data.color ?? '#6B7280',
        workspaceId: data.workspaceId,
      },
    });

    return LabelMapper.toEntity(result);
  }

  async save(label: Label): Promise<void> {
    await this.prisma.label.update({
      where: { id: label.id },
      data: {
        name: label.name,
        color: label.color,
      },
    });
  }

  async findById(id: string): Promise<Label | null> {
    const result = await this.prisma.label.findUnique({
      where: { id },
    });

    if (!result) {
      return null;
    }

    return LabelMapper.toEntity(result);
  }

  async findByWorkspace(workspaceId: string): Promise<Label[]> {
    const labels = await this.prisma.label.findMany({
      where: { workspaceId },
      orderBy: { name: 'asc' },
    });

    return labels.map((l) => LabelMapper.toEntity(l));
  }

  async findByNameInWorkspace(
    workspaceId: string,
    name: string,
  ): Promise<Label | null> {
    const result = await this.prisma.label.findUnique({
      where: {
        workspaceId_name: {
          workspaceId,
          name,
        },
      },
    });

    if (!result) {
      return null;
    }

    return LabelMapper.toEntity(result);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.label.delete({
      where: { id },
    });
  }

  async addLabelToTask(taskId: string, labelId: string): Promise<void> {
    await this.prisma.taskLabel.create({
      data: {
        taskId,
        labelId,
      },
    });
  }

  async removeLabelFromTask(taskId: string, labelId: string): Promise<void> {
    await this.prisma.taskLabel.delete({
      where: {
        taskId_labelId: {
          taskId,
          labelId,
        },
      },
    });
  }

  async findByTask(taskId: string): Promise<Label[]> {
    const taskLabels = await this.prisma.taskLabel.findMany({
      where: { taskId },
      include: { label: true },
      orderBy: { label: { name: 'asc' } },
    });

    return taskLabels.map((tl) => LabelMapper.toEntity(tl.label));
  }

  async isLabelAttachedToTask(
    taskId: string,
    labelId: string,
  ): Promise<boolean> {
    const taskLabel = await this.prisma.taskLabel.findUnique({
      where: {
        taskId_labelId: {
          taskId,
          labelId,
        },
      },
    });

    return taskLabel !== null;
  }
}
