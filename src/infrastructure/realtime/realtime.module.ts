import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { WebsocketEmitterService } from './services/websocket-emitter.service';

/**
 * RealtimeModule provides WebSocket functionality.
 * It has no dependencies on feature modules - repositories are injected
 * from the global DatabaseModule.
 */
@Module({
  providers: [RealtimeGateway, WebsocketEmitterService],
  exports: [WebsocketEmitterService],
})
export class RealtimeModule {}
