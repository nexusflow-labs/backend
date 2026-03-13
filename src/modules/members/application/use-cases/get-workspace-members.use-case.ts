import { Injectable, Inject } from '@nestjs/common';
import { IMemberRepository } from '../../domain/repositories/member.repository';
import { MemberWithUser } from '../../domain/entities/member-with-user.entity';

@Injectable()
export class GetWorkspaceMembersUseCase {
  constructor(
    @Inject(IMemberRepository)
    private readonly memberRepository: IMemberRepository,
  ) {}

  async execute(workspaceId: string): Promise<MemberWithUser[]> {
    return this.memberRepository.listMembersWithUser(workspaceId);
  }
}
