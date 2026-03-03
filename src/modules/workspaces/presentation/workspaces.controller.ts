import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Put,
  Delete,
} from '@nestjs/common';
import { UpdateWorkspaceUseCase } from '../application/use-cases/update-workspace.use-case';
import { CreateWorkspaceUseCase } from '../application/use-cases/create-workspace.use-case';
import { ListWorkspacesUseCase } from '../application/use-cases/list-workspaces.use-case';
import { GetWorkspaceUseCase } from '../application/use-cases/get-workspace.use-case';
import { RemoveWorkspaceUseCase } from '../application/use-cases/remove-workspace.use-case';
import { WorkspaceResponseMapper } from './mappers/workspace.response.mapper';
import {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
} from './dtos/workspace.request.dto';

@Controller('workspaces')
export class WorkspacesController {
  constructor(
    private readonly createWorkspaceUseCase: CreateWorkspaceUseCase,
    private readonly listWorkspacesUseCase: ListWorkspacesUseCase,
    private readonly getWorkspaceUseCase: GetWorkspaceUseCase,
    private readonly updateWorkspaceUseCase: UpdateWorkspaceUseCase,
    private readonly removeWorkspaceUseCase: RemoveWorkspaceUseCase,
  ) {}

  @Get()
  async list() {
    const workspaces = await this.listWorkspacesUseCase.execute();
    return workspaces.map((ws) =>
      WorkspaceResponseMapper.entitytoWorkspaceResponse(ws),
    );
  }

  @Get(':id')
  async get(@Param('id', new ParseUUIDPipe()) id: string) {
    const workspace = await this.getWorkspaceUseCase.execute(id);
    return WorkspaceResponseMapper.entitytoWorkspaceResponse(workspace);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateWorkspaceDto) {
    const workspace = await this.createWorkspaceUseCase.execute(
      dto.name,
      dto.creatorId,
    );
    return WorkspaceResponseMapper.entitytoWorkspaceResponse(workspace);
  }

  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateWorkspaceDto,
  ) {
    const workspace = await this.updateWorkspaceUseCase.execute(id, dto.name);
    return WorkspaceResponseMapper.entitytoWorkspaceResponse(workspace);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.removeWorkspaceUseCase.execute(id);
  }
}
