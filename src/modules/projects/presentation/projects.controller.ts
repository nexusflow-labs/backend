import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { CreateProjectUseCase } from '../application/use-cases/create-project.use-case';
import { ListProjectsUseCase } from '../application/use-cases/list-projects.use-case';
import { GetProjectUseCase } from '../application/use-cases/get-project.use-case';
import { UpdateProjectUseCase } from '../application/use-cases/update-project.use-case';
import { DeleteProjectUseCase } from '../application/use-cases/delete-project.use-case';
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectQueryDto,
} from './dtos/project.request.dto';
import { ProjectResponseDto } from './dtos/project.response.dto';
import { PaginatedResult } from 'src/infrastructure/common/pagination';
import { ProjectQueryFilters } from '../domain/repositories/project.repository';
import { CurrentUser } from 'src/modules/auth/presentation/decorators/current-user.decorator';
import type { JwtUser } from 'src/modules/auth/domain/entities/types/jwt-user.type';
import { WorkspaceMemberGuard } from 'src/infrastructure/authorization/guards/workspace-member.guard';
import { ResourceOwnerGuard } from 'src/infrastructure/authorization/guards/resource-owner.guard';
import { CheckOwnership } from 'src/infrastructure/authorization/decorators/check-ownership.decorator';
import { ResourceType } from 'src/infrastructure/authorization/interfaces/authorization.interfaces';

@Controller('workspaces/:workspaceId/projects')
@UseGuards(WorkspaceMemberGuard)
export class ProjectsController {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly listProjectsUseCase: ListProjectsUseCase,
    private readonly getProjectUseCase: GetProjectUseCase,
    private readonly updateProjectUseCase: UpdateProjectUseCase,
    private readonly deleteProjectUseCase: DeleteProjectUseCase,
  ) {}

  @Get()
  async list(
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Query() query: ProjectQueryDto,
  ): Promise<PaginatedResult<ProjectResponseDto>> {
    const filters: ProjectQueryFilters = {
      search: query.search,
      status: query.status,
      ownerId: query.ownerId,
    };

    const pagination = {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
      sortBy: query.sortBy ?? 'createdAt',
      sortDirection: query.sortDirection ?? 'desc',
    };

    const result = await this.listProjectsUseCase.executePaginated(
      workspaceId,
      filters,
      pagination,
    );

    return {
      items: ProjectResponseDto.fromEntities(result.items),
      meta: result.meta,
    };
  }

  @Get(':id')
  async get(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ProjectResponseDto> {
    const project = await this.getProjectUseCase.execute(id);
    return ProjectResponseDto.fromEntity(project);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Body() dto: CreateProjectDto,
    @CurrentUser() user: JwtUser,
  ): Promise<ProjectResponseDto> {
    const project = await this.createProjectUseCase.execute(
      dto.name,
      workspaceId,
      user.id,
      dto.description,
    );
    return ProjectResponseDto.fromEntity(project);
  }

  @Put(':id')
  @UseGuards(ResourceOwnerGuard)
  @CheckOwnership({ resourceType: ResourceType.PROJECT })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    const project = await this.updateProjectUseCase.execute(id, dto);
    return ProjectResponseDto.fromEntity(project);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ResourceOwnerGuard)
  @CheckOwnership({ resourceType: ResourceType.PROJECT })
  async delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.deleteProjectUseCase.execute(id);
  }
}
