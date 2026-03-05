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
  UseGuards,
} from '@nestjs/common';
import { CreateLabelUseCase } from '../application/use-cases/create-label.use-case';
import { ListLabelsUseCase } from '../application/use-cases/list-labels.use-case';
import { UpdateLabelUseCase } from '../application/use-cases/update-label.use-case';
import { DeleteLabelUseCase } from '../application/use-cases/delete-label.use-case';
import { CreateLabelDto, UpdateLabelDto } from './dtos/label.request.dto';
import { LabelResponseDto } from './dtos/label.response.dto';
import { WorkspaceMemberGuard } from 'src/infrastructure/authorization/guards/workspace-member.guard';
import { RolesGuard } from 'src/infrastructure/authorization/guards/roles.guard';
import { Roles } from 'src/infrastructure/authorization/decorators/roles.decorator';
import { MemberRole } from 'src/modules/members/domain/entities/member.entity';

@Controller('workspaces/:workspaceId/labels')
@UseGuards(WorkspaceMemberGuard, RolesGuard)
export class LabelsController {
  constructor(
    private readonly createLabelUseCase: CreateLabelUseCase,
    private readonly listLabelsUseCase: ListLabelsUseCase,
    private readonly updateLabelUseCase: UpdateLabelUseCase,
    private readonly deleteLabelUseCase: DeleteLabelUseCase,
  ) {}

  @Get()
  async list(
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
  ): Promise<LabelResponseDto[]> {
    const labels = await this.listLabelsUseCase.execute(workspaceId);
    return LabelResponseDto.fromEntities(labels);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  async create(
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Body() dto: CreateLabelDto,
  ): Promise<LabelResponseDto> {
    const label = await this.createLabelUseCase.execute(
      dto.name,
      workspaceId,
      dto.color,
    );
    return LabelResponseDto.fromEntity(label);
  }

  @Put(':id')
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateLabelDto,
  ): Promise<LabelResponseDto> {
    const label = await this.updateLabelUseCase.execute(id, dto);
    return LabelResponseDto.fromEntity(label);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  async delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.deleteLabelUseCase.execute(id);
  }
}
