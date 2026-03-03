import { Module } from '@nestjs/common';
import { WorkspacesController } from './presentation/workspaces.controller';
import { IWorkspaceRepository } from './domain/repositories/workspaces.repository';
import { CreateWorkspaceUseCase } from './application/use-cases/create-workspace.use-case';
import { ListWorkspacesUseCase } from './application/use-cases/list-workspaces.use-case';
import { GetWorkspaceUseCase } from './application/use-cases/get-workspace.use-case';
import { UpdateWorkspaceUseCase } from './application/use-cases/update-workspace.use-case';
import { RemoveWorkspaceUseCase } from './application/use-cases/remove-workspace.use-case';
import { PrismaWorkspaceRepository } from './infrastructure/persistence/prisma-workspace.repository';

@Module({
  controllers: [WorkspacesController],
  providers: [
    {
      provide: IWorkspaceRepository,
      useClass: PrismaWorkspaceRepository,
    },
    {
      provide: CreateWorkspaceUseCase,
      inject: [IWorkspaceRepository],
      useFactory: (repo: IWorkspaceRepository) =>
        new CreateWorkspaceUseCase(repo),
    },
    {
      provide: ListWorkspacesUseCase,
      inject: [IWorkspaceRepository],
      useFactory: (repo: IWorkspaceRepository) =>
        new ListWorkspacesUseCase(repo),
    },
    {
      provide: GetWorkspaceUseCase,
      inject: [IWorkspaceRepository],
      useFactory: (repo: IWorkspaceRepository) => new GetWorkspaceUseCase(repo),
    },
    {
      provide: UpdateWorkspaceUseCase,
      inject: [IWorkspaceRepository],
      useFactory: (repo: IWorkspaceRepository) =>
        new UpdateWorkspaceUseCase(repo),
    },
    {
      provide: RemoveWorkspaceUseCase,
      inject: [IWorkspaceRepository],
      useFactory: (repo: IWorkspaceRepository) =>
        new RemoveWorkspaceUseCase(repo),
    },
  ],
})
export class WorkspacesModule {}
