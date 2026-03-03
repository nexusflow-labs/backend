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
} from '@nestjs/common';
import { CreateCommentUseCase } from '../application/use-cases/create-comment.use-case';
import { ListCommentsUseCase } from '../application/use-cases/list-comments.use-case';
import { UpdateCommentUseCase } from '../application/use-cases/update-comment.use-case';
import { DeleteCommentUseCase } from '../application/use-cases/delete-comment.use-case';
import { CreateCommentDto, UpdateCommentDto } from './dtos/comment.request.dto';
import {
  CommentResponseDto,
  CommentWithUserResponseDto,
} from './dtos/comment.response.dto';

@Controller('tasks/:taskId/comments')
export class CommentsController {
  constructor(
    private readonly createCommentUseCase: CreateCommentUseCase,
    private readonly listCommentsUseCase: ListCommentsUseCase,
    private readonly updateCommentUseCase: UpdateCommentUseCase,
    private readonly deleteCommentUseCase: DeleteCommentUseCase,
  ) {}

  @Get()
  async list(
    @Param('taskId', new ParseUUIDPipe()) taskId: string,
  ): Promise<CommentWithUserResponseDto[]> {
    const comments = await this.listCommentsUseCase.execute(taskId);
    return CommentWithUserResponseDto.fromEntities(comments);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('taskId', new ParseUUIDPipe()) taskId: string,
    @Body() dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    const comment = await this.createCommentUseCase.execute(
      dto.content,
      taskId,
      dto.authorId,
    );
    return CommentResponseDto.fromEntity(comment);
  }

  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCommentDto,
  ): Promise<CommentResponseDto> {
    const comment = await this.updateCommentUseCase.execute(id, dto.content);
    return CommentResponseDto.fromEntity(comment);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.deleteCommentUseCase.execute(id);
  }
}
