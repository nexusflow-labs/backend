import { Module } from '@nestjs/common';
import { ProjectsController } from './presentation/projects.controller';
import { IProjectRepository } from './domain/repositories/project.repository';
import { PrismaProjectRepository } from './infrastructure/persistence/prisma-project.repository';
import { CreateProjectUseCase } from './application/use-cases/create-project.use-case';
import { ListProjectsUseCase } from './application/use-cases/list-projects.use-case';
import { GetProjectUseCase } from './application/use-cases/get-project.use-case';
import { UpdateProjectUseCase } from './application/use-cases/update-project.use-case';
import { DeleteProjectUseCase } from './application/use-cases/delete-project.use-case';
import { IMemberRepository } from '../members/domain/repositories/member.repository';
import { MemberModule } from '../members/members.module';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { ActivityLogService } from '../activity-logs/application/services/activity-log.service';

@Module({
  imports: [ActivityLogsModule, MemberModule],
  controllers: [ProjectsController],
  providers: [
    {
      provide: IProjectRepository,
      useClass: PrismaProjectRepository,
    },
    {
      provide: CreateProjectUseCase,
      inject: [IProjectRepository, IMemberRepository, ActivityLogService],
      useFactory: (
        projectRepo: IProjectRepository,
        memberRepo: IMemberRepository,
        activityLogService: ActivityLogService,
      ) =>
        new CreateProjectUseCase(projectRepo, memberRepo, activityLogService),
    },
    {
      provide: ListProjectsUseCase,
      inject: [IProjectRepository],
      useFactory: (repo: IProjectRepository) => new ListProjectsUseCase(repo),
    },
    {
      provide: GetProjectUseCase,
      inject: [IProjectRepository],
      useFactory: (repo: IProjectRepository) => new GetProjectUseCase(repo),
    },
    {
      provide: UpdateProjectUseCase,
      inject: [IProjectRepository, ActivityLogService],
      useFactory: (
        repo: IProjectRepository,
        activityLogService: ActivityLogService,
      ) => new UpdateProjectUseCase(repo, activityLogService),
    },
    {
      provide: DeleteProjectUseCase,
      inject: [IProjectRepository, ActivityLogService],
      useFactory: (
        repo: IProjectRepository,
        activityLogService: ActivityLogService,
      ) => new DeleteProjectUseCase(repo, activityLogService),
    },
  ],
  exports: [IProjectRepository],
})
export class ProjectsModule {}
