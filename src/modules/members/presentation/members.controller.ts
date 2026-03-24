import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AddMemberUseCase } from '../application/use-cases/add-member.use-case';
import { UpdateMemberRoleUseCase } from '../application/use-cases/update-member-role.use-case';
import { RemoveMemberUseCase } from '../application/use-cases/remove-member.use-case';
import { GetWorkspaceMembersUseCase } from '../application/use-cases/get-workspace-members.use-case';
import {
  AddMemberDto,
  UpdateMemberRoleDto,
  MemberResponseDto,
} from './dtos/members.dtos';
import { MemberWithUserResponseDto } from './dtos/member-with-user.response.dto';
import { WorkspaceMemberGuard } from 'src/infrastructure/authorization/guards/workspace-member.guard';
import { RolesGuard } from 'src/infrastructure/authorization/guards/roles.guard';
import { Roles } from 'src/infrastructure/authorization/decorators/roles.decorator';
import { MemberRole } from '../domain/entities/member.entity';
import { CurrentUser } from 'src/modules/auth/presentation/decorators/current-user.decorator';
import type { JwtUser } from 'src/modules/auth/domain/entities/types/jwt-user.type';

@ApiTags('Members')
@ApiBearerAuth('JWT-auth')
@Controller('workspaces/:workspaceId/members')
@UseGuards(WorkspaceMemberGuard, RolesGuard)
export class MemberController {
  constructor(
    private readonly addMemberUseCase: AddMemberUseCase,
    private readonly updateMemberRoleUseCase: UpdateMemberRoleUseCase,
    private readonly removeMemberUseCase: RemoveMemberUseCase,
    private readonly getMembersUseCase: GetWorkspaceMembersUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all members of a workspace' })
  @ApiParam({
    name: 'workspaceId',
    description: 'Workspace ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'List of members with user info',
    type: [MemberWithUserResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not a workspace member' })
  async getMembers(
    @Param('workspaceId') workspaceId: string,
  ): Promise<MemberWithUserResponseDto[]> {
    const members = await this.getMembersUseCase.execute(workspaceId);
    return MemberWithUserResponseDto.fromEntities(members);
  }

  @Post()
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @ApiOperation({ summary: 'Add a member to workspace (OWNER/ADMIN only)' })
  @ApiParam({
    name: 'workspaceId',
    description: 'Workspace ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 201,
    description: 'Member added',
    type: MemberResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async addMember(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: AddMemberDto,
    @CurrentUser() user: JwtUser,
  ): Promise<MemberResponseDto> {
    return await this.addMemberUseCase.execute(
      workspaceId,
      dto.userId,
      dto.role,
      user.id,
    );
  }

  @Patch(':targetId/role')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @ApiOperation({ summary: 'Update member role (OWNER/ADMIN only)' })
  @ApiParam({
    name: 'workspaceId',
    description: 'Workspace ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'targetId',
    description: 'Target member ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({ status: 204, description: 'Role updated' })
  @ApiResponse({ status: 400, description: 'Cannot change OWNER role' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async updateRole(
    @Param('workspaceId') workspaceId: string,
    @Param('targetId') targetId: string,
    @Body() dto: UpdateMemberRoleDto,
    @CurrentUser() user: JwtUser,
  ): Promise<void> {
    await this.updateMemberRoleUseCase.execute(
      workspaceId,
      user.id,
      targetId,
      dto.newRole,
    );
  }

  @Delete(':targetId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @ApiOperation({ summary: 'Remove member from workspace (OWNER/ADMIN only)' })
  @ApiParam({
    name: 'workspaceId',
    description: 'Workspace ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'targetId',
    description: 'Target member ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({ status: 204, description: 'Member removed' })
  @ApiResponse({ status: 400, description: 'Cannot remove OWNER' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async removeMember(
    @Param('workspaceId') workspaceId: string,
    @Param('targetId') targetId: string,
    @CurrentUser() user: JwtUser,
  ): Promise<void> {
    await this.removeMemberUseCase.execute(workspaceId, user.id, targetId);
  }
}
