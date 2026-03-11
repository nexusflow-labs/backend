import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { RoomBuilder } from '../constants/constant';

@Injectable()
export class WebsocketEmitterService {
  private readonly logger = new Logger(WebsocketEmitterService.name);
  private server: Server | null = null;

  setServer(server: Server) {
    this.server = server;
    this.logger.log('WebSocket server initialized');
  }

  private emit(room: string, event: string, payload: unknown) {
    if (!this.server) {
      this.logger.warn(`Cannot emit ${event}: server not initialized`);
      return;
    }
    this.server.to(room).emit(event, payload);
  }

  emitToWorkspace(workspaceId: string, event: string, payload: unknown) {
    this.emit(RoomBuilder.workspace(workspaceId), event, payload);
  }

  emitToUser(userId: string, event: string, payload: unknown) {
    this.emit(RoomBuilder.user(userId), event, payload);
  }

  emitToProject(projectId: string, event: string, payload: unknown) {
    this.emit(RoomBuilder.project(projectId), event, payload);
  }

  emitToTask(taskId: string, event: string, payload: unknown) {
    this.emit(RoomBuilder.task(taskId), event, payload);
  }
}
