import { ExecutionContext } from '@nestjs/common';
import { currentUserFactory } from './current-user.decorator';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';

describe('currentUserFactory', () => {
  function createMockExecutionContext(
    user: AuthenticatedUser | undefined,
  ): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  }

  it('returns the user attached to the request', () => {
    const user: AuthenticatedUser = {
      id: 'user-1',
      email: 'user@example.com',
      role: 'BAND',
    };
    const ctx = createMockExecutionContext(user);

    expect(currentUserFactory(undefined, ctx)).toBe(user);
  });

  it('returns undefined when no user is attached to the request', () => {
    const ctx = createMockExecutionContext(undefined);

    expect(currentUserFactory(undefined, ctx)).toBeUndefined();
  });
});
