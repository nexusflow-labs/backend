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
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
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
import { WorkspaceResponseDto } from './dtos/workspace.response.dto';
import { CurrentUser } from 'src/modules/auth/presentation/decorators/current-user.decorator';
import type { JwtUser } from 'src/modules/auth/domain/entities/types/jwt-user.type';
import { WorkspaceMemberGuard } from 'src/infrastructure/authorization/guards/workspace-member.guard';
import { RolesGuard } from 'src/infrastructure/authorization/guards/roles.guard';
import { Roles } from 'src/infrastructure/authorization/decorators/roles.decorator';
import { MemberRole } from 'src/modules/members/domain/entities/member.entity';

@ApiTags('Workspaces')
@ApiBearerAuth('JWT-auth')
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
  @ApiOperation({ summary: 'List all workspaces for current user' })
  @ApiResponse({
    status: 200,
    description: 'List of workspaces',
    type: [WorkspaceResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async list(): Promise<WorkspaceResponseDto[]> {
    const workspaces = await this.listWorkspacesUseCase.execute();
    return workspaces.map((ws) =>
      WorkspaceResponseMapper.entitytoWorkspaceResponse(ws),
    );
  }

  @Get(':id')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({ summary: 'Get workspace by ID' })
  @ApiParam({
    name: 'id',
    description: 'Workspace ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Workspace details',
    type: WorkspaceResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not a workspace member' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  async get(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<WorkspaceResponseDto> {
    const workspace = await this.getWorkspaceUseCase.execute(id);
    return WorkspaceResponseMapper.entitytoWorkspaceResponse(workspace);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new workspace' })
  @ApiResponse({
    status: 201,
    description: 'Workspace created',
    type: WorkspaceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() dto: CreateWorkspaceDto,
    @CurrentUser() user: JwtUser,
  ): Promise<WorkspaceResponseDto> {
    const workspace = await this.createWorkspaceUseCase.execute(
      dto.name,
      user.id,
    );
    return WorkspaceResponseMapper.entitytoWorkspaceResponse(workspace);
  }

  @Put(':id')
  @UseGuards(WorkspaceMemberGuard, RolesGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @ApiOperation({ summary: 'Update workspace (OWNER/ADMIN only)' })
  @ApiParam({
    name: 'id',
    description: 'Workspace ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Workspace updated',
    type: WorkspaceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateWorkspaceDto,
    @CurrentUser() user: JwtUser,
  ): Promise<WorkspaceResponseDto> {
    const workspace = await this.updateWorkspaceUseCase.execute(
      id,
      dto.name,
      user.id,
    );
    return WorkspaceResponseMapper.entitytoWorkspaceResponse(workspace);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(WorkspaceMemberGuard, RolesGuard)
  @Roles(MemberRole.OWNER)
  @ApiOperation({ summary: 'Delete workspace (OWNER only)' })
  @ApiParam({
    name: 'id',
    description: 'Workspace ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({ status: 204, description: 'Workspace deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Only OWNER can delete workspace' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<void> {
    await this.removeWorkspaceUseCase.execute(id, user.id);
  }
}
