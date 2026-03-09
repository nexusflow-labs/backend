import { Module } from '@nestjs/common';
import { MemberController } from './presentation/members.controller';
import { AddMemberUseCase } from './application/use-cases/add-member.use-case';
import { UpdateMemberRoleUseCase } from './application/use-cases/update-member-role.use-case';
import { RemoveMemberUseCase } from './application/use-cases/remove-member.use-case';
import { GetWorkspaceMembersUseCase } from './application/use-cases/get-workspace-members.use-case';
import { IMemberRepository } from './domain/repositories/member.repository';
import { PrismaMemberRepository } from './infrastructure/persistence/prisma-member.repository';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { ActivityLogService } from '../activity-logs/application/services/activity-log.service';

@Module({
  imports: [ActivityLogsModule],
  controllers: [MemberController],
  providers: [
    {
      provide: IMemberRepository,
      useClass: PrismaMemberRepository,
    },
    {
      provide: AddMemberUseCase,
      inject: [IMemberRepository, ActivityLogService],
      useFactory: (
        repo: IMemberRepository,
        activityLogService: ActivityLogService,
      ) => new AddMemberUseCase(repo, activityLogService),
    },
    {
      provide: UpdateMemberRoleUseCase,
      inject: [IMemberRepository, ActivityLogService],
      useFactory: (
        repo: IMemberRepository,
        activityLogService: ActivityLogService,
      ) => new UpdateMemberRoleUseCase(repo, activityLogService),
    },
    {
      provide: RemoveMemberUseCase,
      inject: [IMemberRepository, ActivityLogService],
      useFactory: (
        repo: IMemberRepository,
        activityLogService: ActivityLogService,
      ) => new RemoveMemberUseCase(repo, activityLogService),
    },
    {
      provide: GetWorkspaceMembersUseCase,
      inject: [IMemberRepository],
      useFactory: (repo: IMemberRepository) =>
        new GetWorkspaceMembersUseCase(repo),
    },
  ],
  exports: [IMemberRepository],
})
export class MemberModule {}
