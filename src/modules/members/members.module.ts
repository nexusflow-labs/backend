import { Module } from '@nestjs/common';
import { MemberController } from './presentation/members.controller';
import { AddMemberUseCase } from './application/use-cases/add-member.use-case';
import { UpdateMemberRoleUseCase } from './application/use-cases/update-member-role.use-case';
import { RemoveMemberUseCase } from './application/use-cases/remove-member.use-case';
import { GetWorkspaceMembersUseCase } from './application/use-cases/get-workspace-members.use-case';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { RealtimeModule } from 'src/infrastructure/realtime';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [ActivityLogsModule, RealtimeModule, NotificationsModule],
  controllers: [MemberController],
  providers: [
    AddMemberUseCase,
    UpdateMemberRoleUseCase,
    RemoveMemberUseCase,
    GetWorkspaceMembersUseCase,
  ],
})
export class MemberModule {}
