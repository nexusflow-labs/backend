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
import { PrismaMemberRepository } from '../members/infrastructure/persistence/prisma-member.repository';

@Module({
  controllers: [ProjectsController],
  providers: [
    {
      provide: IProjectRepository,
      useClass: PrismaProjectRepository,
    },
    {
      provide: IMemberRepository,
      useClass: PrismaMemberRepository,
    },
    {
      provide: CreateProjectUseCase,
      inject: [IProjectRepository, IMemberRepository],
      useFactory: (
        projectRepo: IProjectRepository,
        memberRepo: IMemberRepository,
      ) => new CreateProjectUseCase(projectRepo, memberRepo),
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
      inject: [IProjectRepository],
      useFactory: (repo: IProjectRepository) => new UpdateProjectUseCase(repo),
    },
    {
      provide: DeleteProjectUseCase,
      inject: [IProjectRepository],
      useFactory: (repo: IProjectRepository) => new DeleteProjectUseCase(repo),
    },
  ],
  exports: [IProjectRepository],
})
export class ProjectsModule {}
