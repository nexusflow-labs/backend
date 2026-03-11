import { Module, forwardRef } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { WebsocketEmitterService } from './services/websocket-emitter.service';
import { MemberModule } from 'src/modules/members/members.module';
import { ProjectsModule } from 'src/modules/projects/projects.module';

@Module({
  imports: [forwardRef(() => MemberModule), forwardRef(() => ProjectsModule)],
  providers: [RealtimeGateway, WebsocketEmitterService],
  exports: [WebsocketEmitterService],
})
export class RealtimeModule {}
