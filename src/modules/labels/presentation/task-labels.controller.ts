import {
  Controller,
  Post,
  Get,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { AddLabelToTaskUseCase } from '../application/use-cases/add-label-to-task.use-case';
import { RemoveLabelFromTaskUseCase } from '../application/use-cases/remove-label-from-task.use-case';
import { GetTaskLabelsUseCase } from '../application/use-cases/get-task-labels.use-case';
import { LabelResponseDto } from './dtos/label.response.dto';
import { WorkspaceMemberGuard } from 'src/infrastructure/authorization/guards/workspace-member.guard';
import { CurrentUser } from 'src/modules/auth/presentation/decorators/current-user.decorator';
import type { JwtUser } from 'src/modules/auth/domain/entities/types/jwt-user.type';

@Controller('tasks/:taskId/labels')
@UseGuards(WorkspaceMemberGuard)
export class TaskLabelsController {
  constructor(
    private readonly addLabelToTaskUseCase: AddLabelToTaskUseCase,
    private readonly removeLabelFromTaskUseCase: RemoveLabelFromTaskUseCase,
    private readonly getTaskLabelsUseCase: GetTaskLabelsUseCase,
  ) {}

  @Get()
  async getTaskLabels(
    @Param('taskId', new ParseUUIDPipe()) taskId: string,
  ): Promise<LabelResponseDto[]> {
    const labels = await this.getTaskLabelsUseCase.execute(taskId);
    return LabelResponseDto.fromEntities(labels);
  }

  @Post(':labelId')
  @HttpCode(HttpStatus.CREATED)
  async addLabel(
    @Param('taskId', new ParseUUIDPipe()) taskId: string,
    @Param('labelId', new ParseUUIDPipe()) labelId: string,
    @CurrentUser() user: JwtUser,
  ): Promise<void> {
    await this.addLabelToTaskUseCase.execute(taskId, labelId, user.id);
  }

  @Delete(':labelId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeLabel(
    @Param('taskId', new ParseUUIDPipe()) taskId: string,
    @Param('labelId', new ParseUUIDPipe()) labelId: string,
    @CurrentUser() user: JwtUser,
  ): Promise<void> {
    await this.removeLabelFromTaskUseCase.execute(taskId, labelId, user.id);
  }
}
