import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ListNotificationsUseCase } from '../applications/use-case/list-notifications.use-case';
import { MarkAsReadUseCase } from '../applications/use-case/mark-as-read.use-case';
import { MaskAllAsReadUseCase } from '../applications/use-case/mask-all-as-read.use-case';
import { CountUnreadUseCase } from '../applications/use-case/count-unread.use-case';
import { NotificationQueryDto } from './dtos/notification.request.dto';
import {
  NotificationResponseDto,
  UnreadCountResponseDto,
  PaginatedNotificationResponseDto,
} from './dtos/notification.response.dto';
import { PaginatedResult } from 'src/infrastructure/common/pagination';
import { CurrentUser } from 'src/modules/auth/presentation/decorators/current-user.decorator';
import type { JwtUser } from 'src/modules/auth/domain/entities/types/jwt-user.type';
import { FilterType } from '../domain/repositories/notification.repository';

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly listNotificationsUseCase: ListNotificationsUseCase,
    private readonly markAsReadUseCase: MarkAsReadUseCase,
    private readonly maskAllAsReadUseCase: MaskAllAsReadUseCase,
    private readonly countUnreadUseCase: CountUnreadUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List notifications for current user' })
  @ApiResponse({ status: 200, description: 'Paginated list of notifications', type: PaginatedNotificationResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async list(
    @CurrentUser() user: JwtUser,
    @Query() query: NotificationQueryDto,
  ): Promise<PaginatedResult<NotificationResponseDto>> {
    const pagination = {
      cursor: query.cursor,
      limit: query.limit ?? 20,
    };

    const result = await this.listNotificationsUseCase.execute(
      user.id,
      query.filter ?? FilterType.all,
      pagination,
    );

    return {
      items: NotificationResponseDto.fromEntities(result.items),
      meta: result.meta,
    };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: 200, description: 'Unread count', type: UnreadCountResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUnreadCount(
    @CurrentUser() user: JwtUser,
  ): Promise<UnreadCountResponseDto> {
    const count = await this.countUnreadUseCase.execute(user.id);
    return UnreadCountResponseDto.from(count);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Notification marked as read', type: NotificationResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<NotificationResponseDto> {
    const notification = await this.markAsReadUseCase.execute(id, user.id);
    return NotificationResponseDto.fromEntity(notification);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 204, description: 'All notifications marked as read' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async markAllAsRead(@CurrentUser() user: JwtUser): Promise<void> {
    await this.maskAllAsReadUseCase.execute(user.id);
  }
}
