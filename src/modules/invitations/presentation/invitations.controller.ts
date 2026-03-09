import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { WorkspaceMemberGuard } from 'src/infrastructure/authorization/guards/workspace-member.guard';
import { RolesGuard } from 'src/infrastructure/authorization/guards/roles.guard';
import { Roles } from 'src/infrastructure/authorization/decorators/roles.decorator';
import { CurrentUser } from 'src/modules/auth/presentation/decorators/current-user.decorator';
import type { JwtUser } from 'src/modules/auth/domain/entities/types/jwt-user.type';
import { CreateInvitationUseCase } from '../application/use-case/create-invitation.use-case';
import { AcceptInvitationUseCase } from '../application/use-case/accept-invitation.use-case';
import { RejectInvitationUseCase } from '../application/use-case/reject-invitation.use-case';
import { ListInvitationsUseCase } from '../application/use-case/list-invitation.use-case';
import { CancelInvitationUseCase } from '../application/use-case/cancel-invitation.use-case';
import { MemberRole } from 'src/modules/members/domain/entities/member.entity';
import {
  CreateInvitationDTO,
  AcceptInvitationDto,
} from './dtos/invitation.dtos';
import { InvitationResponseDto } from './dtos/invitation.response.dto';
import { MemberResponseDto } from 'src/modules/members/presentation/dtos/members.dtos';

@Controller()
export class InvitationController {
  constructor(
    private readonly createInvitationUsecase: CreateInvitationUseCase,
    private readonly acceptInvitationUseCase: AcceptInvitationUseCase,
    private readonly rejectInvitationUseCase: RejectInvitationUseCase,
    private readonly listInvitationsUseCase: ListInvitationsUseCase,
    private readonly cancelInvitationUseCase: CancelInvitationUseCase,
  ) {}

  @Post('workspaces/:workspaceId/invitations')
  @UseGuards(WorkspaceMemberGuard, RolesGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createInvitation(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateInvitationDTO,
    @CurrentUser() user: JwtUser,
  ): Promise<InvitationResponseDto> {
    const invitation = await this.createInvitationUsecase.execute(
      user.id,
      workspaceId,
      dto.email,
      dto.role,
    );
    return InvitationResponseDto.fromEntity(invitation);
  }

  @Get('workspaces/:workspaceId/invitations')
  @UseGuards(WorkspaceMemberGuard, RolesGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  async listInvitations(
    @Param('workspaceId') workspaceId: string,
  ): Promise<InvitationResponseDto[]> {
    const invitations = await this.listInvitationsUseCase.execute(workspaceId);
    return invitations.map((inv) => InvitationResponseDto.fromEntity(inv));
  }

  @Delete('workspaces/:workspaceId/invitations/:invitationId')
  @UseGuards(WorkspaceMemberGuard, RolesGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelInvitation(
    @Param('invitationId') invitationId: string,
    @CurrentUser() user: JwtUser,
  ): Promise<void> {
    await this.cancelInvitationUseCase.execute(invitationId, user.id);
  }

  @Post('invitations/accept')
  @HttpCode(HttpStatus.OK)
  async acceptInvitation(
    @Body() dto: AcceptInvitationDto,
    @CurrentUser() user: JwtUser,
  ): Promise<MemberResponseDto> {
    const member = await this.acceptInvitationUseCase.execute(
      dto.token,
      user.id,
    );
    return MemberResponseDto.fromEntity(member);
  }

  @Post('invitations/reject')
  @HttpCode(HttpStatus.NO_CONTENT)
  async rejectInvitation(
    @Body() dto: AcceptInvitationDto,
    @CurrentUser() user: JwtUser,
  ): Promise<void> {
    await this.rejectInvitationUseCase.execute(dto.token, user.id);
  }
}
