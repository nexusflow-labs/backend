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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
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
import { ProjectResponseDto, PaginatedProjectResponseDto } from './dtos/project.response.dto';
import { PaginatedResult } from 'src/infrastructure/common/pagination';
import { ProjectQueryFilters } from '../domain/repositories/project.repository';
import { CurrentUser } from 'src/modules/auth/presentation/decorators/current-user.decorator';
import type { JwtUser } from 'src/modules/auth/domain/entities/types/jwt-user.type';
import { WorkspaceMemberGuard } from 'src/infrastructure/authorization/guards/workspace-member.guard';
import { ResourceOwnerGuard } from 'src/infrastructure/authorization/guards/resource-owner.guard';
import { CheckOwnership } from 'src/infrastructure/authorization/decorators/check-ownership.decorator';
import { ResourceType } from 'src/infrastructure/authorization/interfaces/authorization.interfaces';

@ApiTags('Projects')
@ApiBearerAuth('JWT-auth')
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
  @ApiOperation({ summary: 'List projects with pagination and filters' })
  @ApiParam({ name: 'workspaceId', description: 'Workspace ID', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Paginated list of projects', type: PaginatedProjectResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not a workspace member' })
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
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiParam({ name: 'workspaceId', description: 'Workspace ID', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'id', description: 'Project ID', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Project details', type: ProjectResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not a workspace member' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async get(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ProjectResponseDto> {
    const project = await this.getProjectUseCase.execute(id);
    return ProjectResponseDto.fromEntity(project);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new project' })
  @ApiParam({ name: 'workspaceId', description: 'Workspace ID', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Project created', type: ProjectResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not a workspace member' })
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
  @ApiOperation({ summary: 'Update project (owner or ADMIN/OWNER role)' })
  @ApiParam({ name: 'workspaceId', description: 'Workspace ID', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'id', description: 'Project ID', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Project updated', type: ProjectResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() user: JwtUser,
  ): Promise<ProjectResponseDto> {
    const project = await this.updateProjectUseCase.execute(id, dto, user.id);
    return ProjectResponseDto.fromEntity(project);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ResourceOwnerGuard)
  @CheckOwnership({ resourceType: ResourceType.PROJECT })
  @ApiOperation({ summary: 'Delete project (owner or ADMIN/OWNER role)' })
  @ApiParam({ name: 'workspaceId', description: 'Workspace ID', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'id', description: 'Project ID', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Project deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<void> {
    await this.deleteProjectUseCase.execute(id, user.id);
  }
}
