import { Module } from '@nestjs/common';
import { WorkspacesController } from './presentation/workspaces.controller';
import { CreateWorkspaceUseCase } from './application/use-cases/create-workspace.use-case';
import { ListWorkspacesUseCase } from './application/use-cases/list-workspaces.use-case';
import { GetWorkspaceUseCase } from './application/use-cases/get-workspace.use-case';
import { UpdateWorkspaceUseCase } from './application/use-cases/update-workspace.use-case';
import { RemoveWorkspaceUseCase } from './application/use-cases/remove-workspace.use-case';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';

@Module({
  imports: [ActivityLogsModule],
  controllers: [WorkspacesController],
  providers: [
    CreateWorkspaceUseCase,
    ListWorkspacesUseCase,
    GetWorkspaceUseCase,
    UpdateWorkspaceUseCase,
    RemoveWorkspaceUseCase,
  ],
})
export class WorkspacesModule {}
