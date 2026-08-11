import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';

// extracted so it can be unit tested directly, since decorators created by createParamDecorator can't be invoked as plain functions
export function currentUserFactory(
  _data: unknown,
  ctx: ExecutionContext,
): AuthenticatedUser {
  const request = ctx.switchToHttp().getRequest<{ user: AuthenticatedUser }>();
  return request.user;
}

export const CurrentUser = createParamDecorator(currentUserFactory);
