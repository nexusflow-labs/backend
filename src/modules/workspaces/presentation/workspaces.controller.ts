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
import { CurrentUser } from 'src/modules/auth/presentation/decorators/current-user.decorator';
import type { JwtUser } from 'src/modules/auth/domain/entities/types/jwt-user.type';
import { WorkspaceMemberGuard } from 'src/infrastructure/authorization/guards/workspace-member.guard';
import { RolesGuard } from 'src/infrastructure/authorization/guards/roles.guard';
import { Roles } from 'src/infrastructure/authorization/decorators/roles.decorator';
import { MemberRole } from 'src/modules/members/domain/entities/member.entity';

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
  @UseGuards(WorkspaceMemberGuard)
  async get(@Param('id', new ParseUUIDPipe()) id: string) {
    const workspace = await this.getWorkspaceUseCase.execute(id);
    return WorkspaceResponseMapper.entitytoWorkspaceResponse(workspace);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateWorkspaceDto, @CurrentUser() user: JwtUser) {
    const workspace = await this.createWorkspaceUseCase.execute(
      dto.name,
      user.id,
    );
    return WorkspaceResponseMapper.entitytoWorkspaceResponse(workspace);
  }

  @Put(':id')
  @UseGuards(WorkspaceMemberGuard, RolesGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateWorkspaceDto,
  ) {
    const workspace = await this.updateWorkspaceUseCase.execute(id, dto.name);
    return WorkspaceResponseMapper.entitytoWorkspaceResponse(workspace);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(WorkspaceMemberGuard, RolesGuard)
  @Roles(MemberRole.OWNER)
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.removeWorkspaceUseCase.execute(id);
  }
}
