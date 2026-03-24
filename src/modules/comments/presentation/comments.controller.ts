import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  Query,
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
import { CreateCommentUseCase } from '../application/use-cases/create-comment.use-case';
import { ListCommentsUseCase } from '../application/use-cases/list-comments.use-case';
import { UpdateCommentUseCase } from '../application/use-cases/update-comment.use-case';
import { DeleteCommentUseCase } from '../application/use-cases/delete-comment.use-case';
import {
  CreateCommentDto,
  UpdateCommentDto,
  CommentQueryDto,
} from './dtos/comment.request.dto';
import {
  CommentResponseDto,
  CommentWithUserResponseDto,
  PaginatedCommentResponseDto,
} from './dtos/comment.response.dto';
import { PaginatedResult } from 'src/infrastructure/common/pagination';
import { CurrentUser } from 'src/modules/auth/presentation/decorators/current-user.decorator';
import type { JwtUser } from 'src/modules/auth/domain/entities/types/jwt-user.type';
import { WorkspaceMemberGuard } from 'src/infrastructure/authorization/guards/workspace-member.guard';
import { ResourceOwnerGuard } from 'src/infrastructure/authorization/guards/resource-owner.guard';
import { CheckOwnership } from 'src/infrastructure/authorization/decorators/check-ownership.decorator';
import { ResourceType } from 'src/infrastructure/authorization/interfaces/authorization.interfaces';

@ApiTags('Comments')
@ApiBearerAuth('JWT-auth')
@Controller('tasks/:taskId/comments')
@UseGuards(WorkspaceMemberGuard)
export class CommentsController {
  constructor(
    private readonly createCommentUseCase: CreateCommentUseCase,
    private readonly listCommentsUseCase: ListCommentsUseCase,
    private readonly updateCommentUseCase: UpdateCommentUseCase,
    private readonly deleteCommentUseCase: DeleteCommentUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List comments for a task' })
  @ApiParam({
    name: 'taskId',
    description: 'Task ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of comments',
    type: PaginatedCommentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async list(
    @Param('taskId', new ParseUUIDPipe()) taskId: string,
    @Query() query: CommentQueryDto,
  ): Promise<PaginatedResult<CommentWithUserResponseDto>> {
    const pagination = {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
    };

    const result = await this.listCommentsUseCase.executePaginated(
      taskId,
      pagination,
    );

    return {
      items: CommentWithUserResponseDto.fromEntities(result.items),
      meta: result.meta,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiParam({
    name: 'taskId',
    description: 'Task ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 201,
    description: 'Comment created',
    type: CommentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async create(
    @Param('taskId', new ParseUUIDPipe()) taskId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: JwtUser,
  ): Promise<CommentResponseDto> {
    const comment = await this.createCommentUseCase.execute(
      dto.content,
      taskId,
      user.id,
    );
    return CommentResponseDto.fromEntity(comment);
  }

  @Put(':id')
  @UseGuards(ResourceOwnerGuard)
  @CheckOwnership({ resourceType: ResourceType.COMMENT })
  @ApiOperation({ summary: 'Update comment (owner only)' })
  @ApiParam({
    name: 'taskId',
    description: 'Task ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'id',
    description: 'Comment ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Comment updated',
    type: CommentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not the comment owner' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCommentDto,
    @CurrentUser() user: JwtUser,
  ): Promise<CommentResponseDto> {
    const comment = await this.updateCommentUseCase.execute(
      id,
      dto.content,
      user.id,
    );
    return CommentResponseDto.fromEntity(comment);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ResourceOwnerGuard)
  @CheckOwnership({ resourceType: ResourceType.COMMENT })
  @ApiOperation({ summary: 'Delete comment (owner only)' })
  @ApiParam({
    name: 'taskId',
    description: 'Task ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'id',
    description: 'Comment ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({ status: 204, description: 'Comment deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not the comment owner' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<void> {
    await this.deleteCommentUseCase.execute(id, user.id);
  }
}
