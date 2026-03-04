import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtUser } from '../../domain/entities/types/jwt-user.type';

export const CurrentUser = createParamDecorator(
  (data: keyof JwtUser, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtUser;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
