import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from '../types/jwt-payload.type';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthUser =>
    ctx.switchToHttp().getRequest().user,
);
