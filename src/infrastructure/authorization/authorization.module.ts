import { Global, Module } from '@nestjs/common';
import { WorkspaceMemberGuard } from './guards/workspace-member.guard';
import { RolesGuard } from './guards/roles.guard';
import { ResourceOwnerGuard } from './guards/resource-owner.guard';
import { ResourceResolverService } from './services/resource-resolver.service';
import { IMemberRepository } from 'src/modules/members/domain/repositories/member.repository';
import { PrismaMemberRepository } from 'src/modules/members/infrastructure/persistence/prisma-member.repository';
import { IProjectRepository } from 'src/modules/projects/domain/repositories/project.repository';
import { PrismaProjectRepository } from 'src/modules/projects/infrastructure/persistence/prisma-project.repository';
import { ITaskRepository } from 'src/modules/tasks/domain/repositories/task.repository';
import { PrismaTaskRepository } from 'src/modules/tasks/infrastructure/persistence/prisma-task.repository';
import { ICommentRepository } from 'src/modules/comments/domain/repositories/comment.repository';
import { PrismaCommentRepository } from 'src/modules/comments/infrastructure/persistence/prisma-comment.repository';
import { ILabelRepository } from 'src/modules/labels/domain/repositories/label.repository';
import { PrismaLabelRepository } from 'src/modules/labels/infrastructure/persistence/prisma-label.repository';

@Global()
@Module({
  providers: [
    {
      provide: IMemberRepository,
      useClass: PrismaMemberRepository,
    },
    {
      provide: IProjectRepository,
      useClass: PrismaProjectRepository,
    },
    {
      provide: ITaskRepository,
      useClass: PrismaTaskRepository,
    },
    {
      provide: ICommentRepository,
      useClass: PrismaCommentRepository,
    },
    {
      provide: ILabelRepository,
      useClass: PrismaLabelRepository,
    },

    // Services
    ResourceResolverService,

    // Guards
    WorkspaceMemberGuard,
    RolesGuard,
    ResourceOwnerGuard,
  ],
  exports: [
    IMemberRepository,
    IProjectRepository,
    ITaskRepository,
    ICommentRepository,
    ILabelRepository,
    WorkspaceMemberGuard,
    RolesGuard,
    ResourceOwnerGuard,

    ResourceResolverService,
  ],
})
export class AuthorizationModule {}
