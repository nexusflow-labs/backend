import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import {
  CreateInvitationData,
  IInvitationRepository,
} from '../../domain/repositories/invitation.repository';
import { Invitation } from '../../domain/entities/invitation.entity';
import { InvitationMapper } from '../mapper/invitation.mapper';
import { InvitationStatus } from '../../domain/enum/invitation.enum';

@Injectable()
export class PrismaInvitationRepository implements IInvitationRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Invitation | null> {
    const result = await this.prisma.invitation.findUnique({
      where: { id },
    });
    return result ? InvitationMapper.toEntity(result) : null;
  }

  async findByEmail(email: string): Promise<Invitation | null> {
    const result = await this.prisma.invitation.findFirst({
      where: { email },
    });
    return result ? InvitationMapper.toEntity(result) : null;
  }

  async findByToken(token: string): Promise<Invitation | null> {
    const result = await this.prisma.invitation.findUnique({
      where: { token },
    });
    return result ? InvitationMapper.toEntity(result) : null;
  }

  async listByWorkspace(workspaceId: string): Promise<Invitation[]> {
    const results = await this.prisma.invitation.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });
    return results.map((item) => InvitationMapper.toEntity(item));
  }

  async updateStatus(id: string, status: InvitationStatus): Promise<void> {
    await this.prisma.invitation.update({
      where: { id },
      data: { status },
    });
  }

  async create(data: CreateInvitationData): Promise<Invitation> {
    const result = await this.prisma.invitation.create({
      data: {
        email: data.email,
        role: data.role,
        token: data.token,
        status: data.status,
        workspaceId: data.workspaceId,
        invitedById: data.invitedById,
        expiresAt: data.expiresAt,
      },
    });

    return InvitationMapper.toEntity(result);
  }
}
