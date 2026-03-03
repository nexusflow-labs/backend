import { Injectable } from '@nestjs/common';
import {
  IMemberRepository,
  AddMemberData,
} from '../../domain/repositories/member.repository';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { Member, MemberRole } from '../../domain/entities/member.entity';
import { MemberWithUser } from '../../domain/entities/member-with-user.entity';

@Injectable()
export class PrismaMemberRepository extends IMemberRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async add(data: AddMemberData): Promise<Member> {
    const result = await this.prisma.member.create({
      data: {
        userId: data.userId,
        workspaceId: data.workspaceId,
        role: data.role,
      },
    });

    return Member.reconstitute({
      id: result.id,
      userId: result.userId,
      workspaceId: result.workspaceId,
      role: result.role as MemberRole,
      createdAt: result.createdAt,
    });
  }

  async updateRole(id: string, role: MemberRole): Promise<void> {
    await this.prisma.member.update({
      where: { id },
      data: { role },
    });
  }

  async listMembersWithUser(workspaceId: string): Promise<MemberWithUser[]> {
    const records = await this.prisma.member.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return records.map((record) =>
      MemberWithUser.create({
        id: record.id,
        userId: record.userId,
        workspaceId: record.workspaceId,
        role: record.role as MemberRole,
        user: {
          id: record.user.id,
          fullName: record.user.fullName,
          email: record.user.email,
          avatar: record.user.avatar ?? undefined,
        },
      }),
    );
  }

  async removeMember(workspaceId: string, userId: string): Promise<void> {
    await this.prisma.member.delete({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });
  }

  async findByWorkspaceAndUser(
    workspaceId: string,
    userId: string,
  ): Promise<Member | null> {
    const record = await this.prisma.member.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!record) {
      return null;
    }

    return Member.reconstitute({
      id: record.id,
      userId: record.userId,
      workspaceId: record.workspaceId,
      role: record.role as MemberRole,
      createdAt: record.createdAt,
    });
  }

  async listByWorkspace(workspaceId: string): Promise<Member[]> {
    const records = await this.prisma.member.findMany({
      where: { workspaceId },
    });

    return records.map((record) =>
      Member.reconstitute({
        id: record.id,
        userId: record.userId,
        workspaceId: record.workspaceId,
        role: record.role as MemberRole,
        createdAt: record.createdAt,
      }),
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.member.delete({
      where: { id },
    });
  }
}
