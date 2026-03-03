import { v4 as uuidv4 } from 'uuid';

export function requestTracker(req: any, res: any, next: () => void) {
  req['x-request-id'] = uuidv4();
  next();
}
