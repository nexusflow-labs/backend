import { Module } from '@nestjs/common';
import { ProjectsController } from './presentation/projects.controller';
import { CreateProjectUseCase } from './application/use-cases/create-project.use-case';
import { ListProjectsUseCase } from './application/use-cases/list-projects.use-case';
import { GetProjectUseCase } from './application/use-cases/get-project.use-case';
import { UpdateProjectUseCase } from './application/use-cases/update-project.use-case';
import { DeleteProjectUseCase } from './application/use-cases/delete-project.use-case';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { RealtimeModule } from 'src/infrastructure/realtime';

@Module({
  imports: [ActivityLogsModule, RealtimeModule],
  controllers: [ProjectsController],
  providers: [
    CreateProjectUseCase,
    ListProjectsUseCase,
    GetProjectUseCase,
    UpdateProjectUseCase,
    DeleteProjectUseCase,
  ],
})
export class ProjectsModule {}
