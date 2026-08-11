import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersRepository } from '../users/users.repository';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: { findByEmail: jest.Mock };
  let jwtService: { signAsync: jest.Mock };

  beforeEach(() => {
    usersRepository = { findByEmail: jest.fn() };
    jwtService = { signAsync: jest.fn() };
    process.env.JWT_EXPIRES_IN = '7d';

    service = new AuthService(
      usersRepository as unknown as UsersRepository,
      jwtService as unknown as JwtService,
    );

    jest.clearAllMocks();
  });

  describe('login', () => {
    it('returns an access token for valid credentials', async () => {
      usersRepository.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        password: 'hashed-password',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('signed-jwt');

      const result = await service.login({
        email: 'user@example.com',
        password: 'password123',
      });

      expect(usersRepository.findByEmail).toHaveBeenCalledWith(
        'user@example.com',
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashed-password',
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'user@example.com',
      });
      expect(result).toEqual({
        accessToken: 'signed-jwt',
        tokenType: 'Bearer',
        expiresIn: '7d',
      });
    });

    it('throws UnauthorizedException when the user does not exist', async () => {
      usersRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'unknown@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when the password is wrong', async () => {
      usersRepository.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        password: 'hashed-password',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({
          email: 'user@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(UnauthorizedException);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });
});
