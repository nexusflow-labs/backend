import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { IStatisticsRepository } from './domain/repositories/statistics.repository';
import { PrismaStatisticsRepository } from './infrastructure/persistence/prisma-statistics.repository';
import { GetWorkspaceStatisticsUseCase } from './application/use-cases/get-workspace-statistics.use-case';
import { DashboardController } from './presentation/dashboard.controller';

@Module({
  imports: [PrismaModule, WorkspacesModule],
  controllers: [DashboardController],
  providers: [
    {
      provide: IStatisticsRepository,
      useClass: PrismaStatisticsRepository,
    },
    GetWorkspaceStatisticsUseCase,
  ],
  exports: [GetWorkspaceStatisticsUseCase],
})
export class DashboardModule {}
