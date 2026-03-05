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
  UseGuards,
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
  TaskQueryDto,
} from './dtos/task.request.dto';
import { TaskResponseDto } from './dtos/task.response.dto';
import { PaginatedResult } from 'src/infrastructure/common/pagination';
import { TaskQueryFilters } from '../domain/repositories/task.repository';
import { CurrentUser } from 'src/modules/auth/presentation/decorators/current-user.decorator';
import type { JwtUser } from 'src/modules/auth/domain/entities/types/jwt-user.type';
import { WorkspaceMemberGuard } from 'src/infrastructure/authorization/guards/workspace-member.guard';
import { ResourceOwnerGuard } from 'src/infrastructure/authorization/guards/resource-owner.guard';
import { CheckOwnership } from 'src/infrastructure/authorization/decorators/check-ownership.decorator';
import { ResourceType } from 'src/infrastructure/authorization/interfaces/authorization.interfaces';

@Controller('projects/:projectId/tasks')
@UseGuards(WorkspaceMemberGuard)
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
    @Query() query: TaskQueryDto,
  ): Promise<PaginatedResult<TaskResponseDto>> {
    const filters: TaskQueryFilters = {
      status: query.status,
      priority: query.priority,
      assigneeId: query.assigneeId,
      rootOnly: query.rootOnly,
      creatorId: query.creatorId,
      dueDateFrom: query.dueDateFrom ? new Date(query.dueDateFrom) : undefined,
      dueDateTo: query.dueDateTo ? new Date(query.dueDateTo) : undefined,
      createdFrom: query.createdFrom ? new Date(query.createdFrom) : undefined,
      createdTo: query.createdTo ? new Date(query.createdTo) : undefined,
      search: query.search,
      labelIds: query.labelIds,
      overdue: query.overdue,
    };

    const pagination = {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
      sortBy: query.sortBy ?? 'createdAt',
      sortDirection: query.sortDirection ?? 'desc',
    };

    const result = await this.listTasksUseCase.executePaginated(
      projectId,
      filters,
      pagination,
    );

    return {
      items: TaskResponseDto.fromEntities(result.items),
      meta: result.meta,
    };
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
    @CurrentUser() user: JwtUser,
  ): Promise<TaskResponseDto> {
    const task = await this.createTaskUseCase.execute(
      dto.title,
      projectId,
      user.id,
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
  @UseGuards(ResourceOwnerGuard)
  @CheckOwnership({ resourceType: ResourceType.TASK })
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
  @UseGuards(ResourceOwnerGuard)
  @CheckOwnership({ resourceType: ResourceType.TASK })
  async delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.deleteTaskUseCase.execute(id);
  }
}
