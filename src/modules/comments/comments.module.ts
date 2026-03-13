import { Module } from '@nestjs/common';
import { CommentsController } from './presentation/comments.controller';
import { CreateCommentUseCase } from './application/use-cases/create-comment.use-case';
import { ListCommentsUseCase } from './application/use-cases/list-comments.use-case';
import { UpdateCommentUseCase } from './application/use-cases/update-comment.use-case';
import { DeleteCommentUseCase } from './application/use-cases/delete-comment.use-case';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { RealtimeModule } from 'src/infrastructure/realtime';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [ActivityLogsModule, RealtimeModule, NotificationsModule],
  controllers: [CommentsController],
  providers: [
    CreateCommentUseCase,
    ListCommentsUseCase,
    UpdateCommentUseCase,
    DeleteCommentUseCase,
  ],
})
export class CommentsModule {}
