import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CreateProjectUseCase } from '../application/use-cases/create-project.use-case';
import { ListProjectsUseCase } from '../application/use-cases/list-projects.use-case';
import { GetProjectUseCase } from '../application/use-cases/get-project.use-case';
import { UpdateProjectUseCase } from '../application/use-cases/update-project.use-case';
import { DeleteProjectUseCase } from '../application/use-cases/delete-project.use-case';
import { CreateProjectDto, UpdateProjectDto } from './dtos/project.request.dto';
import { ProjectResponseDto } from './dtos/project.response.dto';

@Controller('workspaces/:workspaceId/projects')
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
  ): Promise<ProjectResponseDto[]> {
    const projects = await this.listProjectsUseCase.execute(workspaceId);
    return ProjectResponseDto.fromEntities(projects);
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
  ): Promise<ProjectResponseDto> {
    const project = await this.createProjectUseCase.execute(
      dto.name,
      workspaceId,
      dto.ownerId,
      dto.description,
    );
    return ProjectResponseDto.fromEntity(project);
  }

  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    const project = await this.updateProjectUseCase.execute(id, dto);
    return ProjectResponseDto.fromEntity(project);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.deleteProjectUseCase.execute(id);
  }
}
