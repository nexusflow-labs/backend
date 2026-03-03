import { Injectable, NotFoundException } from '@nestjs/common';
import { Comment } from '../../domain/entities/comment.entity';
import { ICommentRepository } from '../../domain/repositories/comment.repository';

@Injectable()
export class UpdateCommentUseCase {
  constructor(private readonly commentRepository: ICommentRepository) {}

  async execute(id: string, content: string): Promise<Comment> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    comment.updateContent(content);
    await this.commentRepository.save(comment);

    return comment;
  }
}
