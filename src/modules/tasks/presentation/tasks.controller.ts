import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Patch,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CreateTaskUseCase } from '../application/use-cases/create-task.use-case';
import { ListTasksUseCase } from '../application/use-cases/list-tasks.use-case';
import { GetTaskUseCase } from '../application/use-cases/get-task.use-case';
import { UpdateTaskUseCase } from '../application/use-cases/update-task.use-case';
import { AssignTaskUseCase } from '../application/use-cases/assign-task.use-case';
import { DeleteTaskUseCase } from '../application/use-cases/delete-task.use-case';
import { GetSubtasksUseCase } from '../application/use-cases/get-subtasks.use-case';
import {
  CreateTaskDto,
  UpdateTaskDto,
  AssignTaskDto,
  TaskFilterDto,
} from './dtos/task.request.dto';
import { TaskResponseDto } from './dtos/task.response.dto';

@Controller('projects/:projectId/tasks')
export class TasksController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly listTasksUseCase: ListTasksUseCase,
    private readonly getTaskUseCase: GetTaskUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly assignTaskUseCase: AssignTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,
    private readonly getSubtasksUseCase: GetSubtasksUseCase,
  ) {}

  @Get()
  async list(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Query() filters: TaskFilterDto,
  ): Promise<TaskResponseDto[]> {
    const tasks = await this.listTasksUseCase.execute(projectId, filters);
    return TaskResponseDto.fromEntities(tasks);
  }

  @Get(':id')
  async get(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<TaskResponseDto> {
    const task = await this.getTaskUseCase.execute(id);
    return TaskResponseDto.fromEntity(task);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Body() dto: CreateTaskDto,
  ): Promise<TaskResponseDto> {
    const task = await this.createTaskUseCase.execute(
      dto.title,
      projectId,
      dto.creatorId,
      dto.description,
      dto.dueDate ? new Date(dto.dueDate) : undefined,
      dto.priority,
      dto.parentId,
    );
    return TaskResponseDto.fromEntity(task);
  }

  @Get(':id/subtasks')
  async getSubtasks(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<TaskResponseDto[]> {
    const subtasks = await this.getSubtasksUseCase.execute(id);
    return TaskResponseDto.fromEntities(subtasks);
  }

  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateTaskDto,
  ): Promise<TaskResponseDto> {
    const task = await this.updateTaskUseCase.execute(id, {
      ...dto,
      dueDate:
        dto.dueDate === null
          ? null
          : dto.dueDate
            ? new Date(dto.dueDate)
            : undefined,
    });
    return TaskResponseDto.fromEntity(task);
  }

  @Patch(':id/assign')
  async assign(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: AssignTaskDto,
  ): Promise<TaskResponseDto> {
    const task = await this.assignTaskUseCase.execute(
      id,
      dto.assigneeId ?? null,
    );
    return TaskResponseDto.fromEntity(task);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.deleteTaskUseCase.execute(id);
  }
}
