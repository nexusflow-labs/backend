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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AddLabelToTaskUseCase } from '../application/use-cases/add-label-to-task.use-case';
import { RemoveLabelFromTaskUseCase } from '../application/use-cases/remove-label-from-task.use-case';
import { GetTaskLabelsUseCase } from '../application/use-cases/get-task-labels.use-case';
import { LabelResponseDto } from './dtos/label.response.dto';
import { WorkspaceMemberGuard } from 'src/infrastructure/authorization/guards/workspace-member.guard';
import { CurrentUser } from 'src/modules/auth/presentation/decorators/current-user.decorator';
import type { JwtUser } from 'src/modules/auth/domain/entities/types/jwt-user.type';

@ApiTags('Task Labels')
@ApiBearerAuth('JWT-auth')
@Controller('tasks/:taskId/labels')
@UseGuards(WorkspaceMemberGuard)
export class TaskLabelsController {
  constructor(
    private readonly addLabelToTaskUseCase: AddLabelToTaskUseCase,
    private readonly removeLabelFromTaskUseCase: RemoveLabelFromTaskUseCase,
    private readonly getTaskLabelsUseCase: GetTaskLabelsUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get labels attached to a task' })
  @ApiParam({ name: 'taskId', description: 'Task ID', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'List of labels', type: [LabelResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async getTaskLabels(
    @Param('taskId', new ParseUUIDPipe()) taskId: string,
  ): Promise<LabelResponseDto[]> {
    const labels = await this.getTaskLabelsUseCase.execute(taskId);
    return LabelResponseDto.fromEntities(labels);
  }

  @Post(':labelId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a label to a task' })
  @ApiParam({ name: 'taskId', description: 'Task ID', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'labelId', description: 'Label ID', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Label added to task' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Task or label not found' })
  @ApiResponse({ status: 409, description: 'Label already attached' })
  async addLabel(
    @Param('taskId', new ParseUUIDPipe()) taskId: string,
    @Param('labelId', new ParseUUIDPipe()) labelId: string,
    @CurrentUser() user: JwtUser,
  ): Promise<void> {
    await this.addLabelToTaskUseCase.execute(taskId, labelId, user.id);
  }

  @Delete(':labelId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a label from a task' })
  @ApiParam({ name: 'taskId', description: 'Task ID', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'labelId', description: 'Label ID', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Label removed from task' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Task or label not found' })
  async removeLabel(
    @Param('taskId', new ParseUUIDPipe()) taskId: string,
    @Param('labelId', new ParseUUIDPipe()) labelId: string,
    @CurrentUser() user: JwtUser,
  ): Promise<void> {
    await this.removeLabelFromTaskUseCase.execute(taskId, labelId, user.id);
  }
}
