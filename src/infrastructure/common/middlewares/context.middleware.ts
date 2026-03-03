import { Injectable, NestMiddleware } from '@nestjs/common';
import { RequestContextService } from '../context/request-context.service';

@Injectable()
export class ContextMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    RequestContextService.run(() => {
      const requestId = req['x-request-id'];
      console.log(`ContextMiddleware - Request ID: ${requestId}`);
      RequestContextService.set('requestId', requestId);
      res.setHeader('x-request-id', requestId);
      next();
    });
  }
}
