import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AuthenticatedSocket } from './types/socket.types';
import { RoomBuilder, RealtimeEvents } from './constants/constant';
import { WebsocketEmitterService } from './services/websocket-emitter.service';
import { IMemberRepository } from 'src/modules/members/domain/repositories/member.repository';
import { IProjectRepository } from 'src/modules/projects/domain/repositories/project.repository';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private readonly wsEmitter: WebsocketEmitterService,
    private readonly jwtService: JwtService,
    private readonly memberRepository: IMemberRepository,
    private readonly projectRepository: IProjectRepository,
  ) {}

  afterInit(server: Server) {
    this.wsEmitter.setServer(server);
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(socket: Socket) {
    try {
      const token = this.extractToken(socket);
      if (!token) {
        this.logger.warn(`Connection rejected: no token provided`);
        socket.disconnect();
        return;
      }

      const payload = this.jwtService.verify<{ sub: string; email: string }>(
        token,
      );
      (socket as AuthenticatedSocket).user = {
        id: payload.sub,
        email: payload.email,
      };

      // Auto-join user's personal room
      const userRoom = RoomBuilder.user(payload.sub);
      await socket.join(userRoom);

      this.logger.log(`Socket ${socket.id} connected (user: ${payload.email})`);
    } catch {
      this.logger.warn(`Connection rejected: invalid token`);
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    const user = (socket as AuthenticatedSocket).user;
    this.logger.log(
      `Socket ${socket.id} disconnected (user: ${user?.email || 'unknown'})`,
    );
  }

  private extractToken(socket: Socket): string | null {
    const authToken = socket.handshake.auth?.token as string | undefined;
    const headerToken = socket.handshake.headers?.authorization?.replace(
      'Bearer ',
      '',
    );
    return authToken || headerToken || null;
  }

  private getUser(socket: AuthenticatedSocket) {
    if (!socket.user) {
      throw new WsException('Unauthorized');
    }
    return socket.user;
  }

  @SubscribeMessage('workspace:join')
  async handleJoinWorkspace(
    @MessageBody() data: { workspaceId: string },
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const user = this.getUser(socket);

    const member = await this.memberRepository.findByWorkspaceAndUser(
      data.workspaceId,
      user.id,
    );

    if (!member) {
      throw new WsException('Not a member of this workspace');
    }

    const room = RoomBuilder.workspace(data.workspaceId);
    await socket.join(room);

    this.logger.debug(`User ${user.email} joined ${room}`);

    return { success: true, room };
  }

  @SubscribeMessage('workspace:leave')
  async handleLeaveWorkspace(
    @MessageBody() data: { workspaceId: string },
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const user = this.getUser(socket);
    const room = RoomBuilder.workspace(data.workspaceId);

    await socket.leave(room);

    this.logger.debug(`User ${user.email} left ${room}`);

    return { success: true };
  }

  @SubscribeMessage('project:join')
  async handleJoinProject(
    @MessageBody() data: { projectId: string },
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const user = this.getUser(socket);

    const project = await this.projectRepository.findById(data.projectId);
    if (!project) {
      throw new WsException('Project not found');
    }

    const member = await this.memberRepository.findByWorkspaceAndUser(
      project.workspaceId,
      user.id,
    );

    if (!member) {
      throw new WsException('Not a member of this workspace');
    }

    const room = RoomBuilder.project(data.projectId);
    await socket.join(room);

    this.logger.debug(`User ${user.email} joined ${room}`);

    return { success: true, room };
  }

  @SubscribeMessage('project:leave')
  async handleLeaveProject(
    @MessageBody() data: { projectId: string },
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const user = this.getUser(socket);
    const room = RoomBuilder.project(data.projectId);

    await socket.leave(room);

    this.logger.debug(`User ${user.email} left ${room}`);

    return { success: true };
  }

  @SubscribeMessage('task:join')
  async handleJoinTask(
    @MessageBody() data: { taskId: string; projectId: string },
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const user = this.getUser(socket);

    const project = await this.projectRepository.findById(data.projectId);
    if (!project) {
      throw new WsException('Project not found');
    }

    const member = await this.memberRepository.findByWorkspaceAndUser(
      project.workspaceId,
      user.id,
    );

    if (!member) {
      throw new WsException('Not a member of this workspace');
    }

    const room = RoomBuilder.task(data.taskId);
    await socket.join(room);

    this.logger.debug(`User ${user.email} joined ${room}`);

    return { success: true, room };
  }

  @SubscribeMessage('task:leave')
  async handleLeaveTask(
    @MessageBody() data: { taskId: string },
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const user = this.getUser(socket);
    const room = RoomBuilder.task(data.taskId);

    await socket.leave(room);

    this.logger.debug(`User ${user.email} left ${room}`);

    return { success: true };
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(
    @MessageBody() data: { taskId: string },
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const user = this.getUser(socket);
    const room = RoomBuilder.task(data.taskId);

    socket.to(room).emit(RealtimeEvents.USER_TYPING, {
      taskId: data.taskId,
      userId: user.id,
    });

    return { success: true };
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @MessageBody() data: { taskId: string },
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const user = this.getUser(socket);
    const room = RoomBuilder.task(data.taskId);

    socket.to(room).emit(RealtimeEvents.USER_STOP_TYPING, {
      taskId: data.taskId,
      userId: user.id,
    });

    return { success: true };
  }
}
