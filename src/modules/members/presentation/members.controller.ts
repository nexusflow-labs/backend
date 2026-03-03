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
} from '@nestjs/common';
import { AddMemberUseCase } from '../application/use-cases/add-member.use-case';
import { UpdateMemberRoleUseCase } from '../application/use-cases/update-member-role.use-case';
import { RemoveMemberUseCase } from '../application/use-cases/remove-member.use-case';
import { GetWorkspaceMembersUseCase } from '../application/use-cases/get-workspace-members.use-case';
import { AddMemberDto, UpdateMemberRoleDto } from './dtos/members.dtos';
import { MemberWithUserResponseDto } from './dtos/member-with-user.response.dto';

@Controller('workspaces/:workspaceId/members')
export class MemberController {
  constructor(
    private readonly addMemberUseCase: AddMemberUseCase,
    private readonly updateMemberRoleUseCase: UpdateMemberRoleUseCase,
    private readonly removeMemberUseCase: RemoveMemberUseCase,
    private readonly getMembersUseCase: GetWorkspaceMembersUseCase,
  ) {}

  @Get()
  async getMembers(@Param('workspaceId') workspaceId: string) {
    const members = await this.getMembersUseCase.execute(workspaceId);
    return MemberWithUserResponseDto.fromEntities(members);
  }

  @Post()
  async addMember(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: AddMemberDto,
  ) {
    return await this.addMemberUseCase.execute(
      workspaceId,
      dto.userId,
      dto.role,
    );
  }

  @Patch(':targetId/role')
  async updateRole(
    @Param('workspaceId') workspaceId: string,
    @Param('targetId') targetId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return await this.updateMemberRoleUseCase.execute(
      workspaceId,
      targetId,
      dto.operationId,
      dto.newRole,
    );
  }

  @Delete(':targetId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @Param('workspaceId') workspaceId: string,
    @Param('targetId') targetId: string,
    @Body('operationId') operationId: string,
  ) {
    return await this.removeMemberUseCase.execute(
      workspaceId,
      operationId,
      targetId,
    );
  }
}
