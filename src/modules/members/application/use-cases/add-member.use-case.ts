import { Injectable, ConflictException } from '@nestjs/common';
import { Member, MemberRole } from '../../domain/entities/member.entity';
import { IMemberRepository } from '../../domain/repositories/member.repository';
import { ActivityLogService } from 'src/modules/activity-logs/application/services/activity-log.service';
import { EntityType } from 'src/modules/activity-logs/domain/enums/entity-type.enum';

@Injectable()
export class AddMemberUseCase {
  constructor(
    private readonly memberRepository: IMemberRepository,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async execute(
    workspaceId: string,
    userId: string,
    role: MemberRole,
    operatorId: string,
  ): Promise<Member> {
    const existing = await this.memberRepository.findByWorkspaceAndUser(
      workspaceId,
      userId,
    );

    if (existing) {
      throw new ConflictException('User is already a member of this workspace');
    }

    const member = await this.memberRepository.add({
      workspaceId,
      userId,
      role,
    });

    await this.activityLogService.logCreate(
      EntityType.MEMBER,
      member.id,
      operatorId,
      { workspaceId, userId, role },
    );

    return member;
  }
}
