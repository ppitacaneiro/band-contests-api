import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { UsersRepository } from '../users/users.repository';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersRepository: { findById: jest.Mock };
  let configService: { getOrThrow: jest.Mock };

  beforeEach(() => {
    usersRepository = { findById: jest.fn() };
    configService = { getOrThrow: jest.fn().mockReturnValue('test-secret') };

    strategy = new JwtStrategy(
      configService as unknown as ConfigService,
      usersRepository as unknown as UsersRepository,
    );
  });

  it('reads JWT_SECRET from config when constructed', () => {
    expect(configService.getOrThrow).toHaveBeenCalledWith('JWT_SECRET');
  });

  it('returns the sanitized authenticated user when found', async () => {
    usersRepository.findById.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      role: 'BAND',
      password: 'hashed',
    });

    const result = await strategy.validate({ sub: 'user-1' });

    expect(usersRepository.findById).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({
      id: 'user-1',
      email: 'user@example.com',
      role: 'BAND',
    });
  });

  it('throws UnauthorizedException when the user no longer exists', async () => {
    usersRepository.findById.mockResolvedValue(null);

    await expect(strategy.validate({ sub: 'deleted-user' })).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
