import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { login: jest.Mock };

  beforeEach(() => {
    authService = { login: jest.fn() };
    controller = new AuthController(authService as unknown as AuthService);
  });

  describe('login', () => {
    it('delegates to AuthService.login and returns its result', async () => {
      const loginDto = { email: 'user@example.com', password: 'password123' };
      const expected = {
        accessToken: 'token',
        tokenType: 'Bearer',
        expiresIn: '7d',
      };
      authService.login.mockResolvedValue(expected);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toBe(expected);
    });
  });

  describe('getMe', () => {
    it('returns the authenticated user from the request', () => {
      const user: AuthenticatedUser = {
        id: 'user-1',
        email: 'user@example.com',
        role: 'BAND',
      };

      const result = controller.getMe({ user }) as AuthenticatedUser;

      expect(result).toBe(user);
    });
  });
});
