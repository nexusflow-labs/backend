import { Module, forwardRef } from '@nestjs/common';
import { MemberController } from './presentation/members.controller';
import { AddMemberUseCase } from './application/use-cases/add-member.use-case';
import { UpdateMemberRoleUseCase } from './application/use-cases/update-member-role.use-case';
import { RemoveMemberUseCase } from './application/use-cases/remove-member.use-case';
import { GetWorkspaceMembersUseCase } from './application/use-cases/get-workspace-members.use-case';
import { IMemberRepository } from './domain/repositories/member.repository';
import { PrismaMemberRepository } from './infrastructure/persistence/prisma-member.repository';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { ActivityLogService } from '../activity-logs/application/services/activity-log.service';
import {
  RealtimeModule,
  WebsocketEmitterService,
} from 'src/infrastructure/realtime';

@Module({
  imports: [ActivityLogsModule, forwardRef(() => RealtimeModule)],
  controllers: [MemberController],
  providers: [
    {
      provide: IMemberRepository,
      useClass: PrismaMemberRepository,
    },
    {
      provide: AddMemberUseCase,
      inject: [IMemberRepository, ActivityLogService, WebsocketEmitterService],
      useFactory: (
        repo: IMemberRepository,
        activityLogService: ActivityLogService,
        wsEmitter: WebsocketEmitterService,
      ) => new AddMemberUseCase(repo, activityLogService, wsEmitter),
    },
    {
      provide: UpdateMemberRoleUseCase,
      inject: [IMemberRepository, ActivityLogService, WebsocketEmitterService],
      useFactory: (
        repo: IMemberRepository,
        activityLogService: ActivityLogService,
        wsEmitter: WebsocketEmitterService,
      ) => new UpdateMemberRoleUseCase(repo, activityLogService, wsEmitter),
    },
    {
      provide: RemoveMemberUseCase,
      inject: [IMemberRepository, ActivityLogService, WebsocketEmitterService],
      useFactory: (
        repo: IMemberRepository,
        activityLogService: ActivityLogService,
        wsEmitter: WebsocketEmitterService,
      ) => new RemoveMemberUseCase(repo, activityLogService, wsEmitter),
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
