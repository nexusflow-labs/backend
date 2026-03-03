import { Injectable, ConflictException } from '@nestjs/common';
import { Member, MemberRole } from '../../domain/entities/member.entity';
import { IMemberRepository } from '../../domain/repositories/member.repository';

@Injectable()
export class AddMemberUseCase {
  constructor(private readonly memberRepository: IMemberRepository) {}

  async execute(
    workspaceId: string,
    userId: string,
    role: MemberRole,
  ): Promise<Member> {
    const existing = await this.memberRepository.findByWorkspaceAndUser(
      workspaceId,
      userId,
    );

    if (existing) {
      throw new ConflictException('User is already a member of this workspace');
    }

    return this.memberRepository.add({
      workspaceId,
      userId,
      role,
    });
  }
}
