import { Module } from '@nestjs/common';
import { MemberController } from './presentation/members.controller';
import { AddMemberUseCase } from './application/use-cases/add-member.use-case';
import { UpdateMemberRoleUseCase } from './application/use-cases/update-member-role.use-case';
import { RemoveMemberUseCase } from './application/use-cases/remove-member.use-case';
import { GetWorkspaceMembersUseCase } from './application/use-cases/get-workspace-members.use-case';
import { IMemberRepository } from './domain/repositories/member.repository';
import { PrismaMemberRepository } from './infrastructure/persistence/prisma-member.repository';

@Module({
  controllers: [MemberController],
  providers: [
    {
      provide: IMemberRepository,
      useClass: PrismaMemberRepository,
    },
    {
      provide: AddMemberUseCase,
      inject: [IMemberRepository],
      useFactory: (repo: IMemberRepository) => new AddMemberUseCase(repo),
    },
    {
      provide: UpdateMemberRoleUseCase,
      inject: [IMemberRepository],
      useFactory: (repo: IMemberRepository) =>
        new UpdateMemberRoleUseCase(repo),
    },
    {
      provide: RemoveMemberUseCase,
      inject: [IMemberRepository],
      useFactory: (repo: IMemberRepository) => new RemoveMemberUseCase(repo),
    },
    {
      provide: GetWorkspaceMembersUseCase,
      inject: [IMemberRepository],
      useFactory: (repo: IMemberRepository) =>
        new GetWorkspaceMembersUseCase(repo),
    },
  ],
})
export class MemberModule {}
