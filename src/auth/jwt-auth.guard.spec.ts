import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  it('is defined', () => {
    expect(new JwtAuthGuard()).toBeDefined();
  });

  it('extends the passport "jwt" AuthGuard', () => {
    expect(new JwtAuthGuard()).toBeInstanceOf(AuthGuard('jwt'));
  });
});
