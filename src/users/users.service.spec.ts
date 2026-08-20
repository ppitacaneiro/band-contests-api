import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: {
    findByEmail: jest.Mock;
    create: jest.Mock;
    findById: jest.Mock;
  };

  beforeEach(() => {
    usersRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
    };
    service = new UsersService(usersRepository as unknown as UsersRepository);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
    };

    it('hashes the password and returns a sanitized user', async () => {
      usersRepository.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      usersRepository.create.mockResolvedValue({
        id: 'user-1',
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'hashed-password',
        emailVerifiedAt: null,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      });

      const result = await service.create(createUserDto);

      expect(usersRepository.findByEmail).toHaveBeenCalledWith(
        'jane@example.com',
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(usersRepository.create).toHaveBeenCalledWith({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'hashed-password',
      });
      expect(result).toEqual({
        id: 'user-1',
        name: 'Jane Doe',
        email: 'jane@example.com',
        emailVerifiedAt: null,
        createdAt: new Date('2026-01-01'),
      });
      expect(result).not.toHaveProperty('password');
    });

    it('throws ConflictException when the email is already taken', async () => {
      usersRepository.findByEmail.mockResolvedValue({ id: 'existing-user' });

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(usersRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    const storedUser = {
      id: 'user-1',
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'hashed-password',
      emailVerifiedAt: null,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-02'),
    };

    const actor: AuthenticatedUser = {
      id: 'user-1',
      email: 'jane@example.com',
      role: 'BAND',
    };

    it('returns a sanitized user when the actor is the same user', async () => {
      usersRepository.findById.mockResolvedValue(storedUser);

      const result = await service.findById('user-1', actor);

      expect(result).toEqual({
        id: 'user-1',
        name: 'Jane Doe',
        email: 'jane@example.com',
        emailVerifiedAt: null,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-02'),
      });
      expect(result).not.toHaveProperty('password');
    });

    it('returns a sanitized user when the actor is an ADMIN', async () => {
      usersRepository.findById.mockResolvedValue(storedUser);

      const result = await service.findById('user-1', {
        ...actor,
        id: 'admin-1',
        role: 'ADMIN',
      });

      expect(result).toMatchObject({ id: 'user-1', email: 'jane@example.com' });
    });

    it('throws ForbiddenException when the actor is not the user nor an ADMIN', async () => {
      usersRepository.findById.mockResolvedValue(storedUser);

      await expect(
        service.findById('user-1', {
          id: 'user-2',
          email: 'other@example.com',
          role: 'BAND',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException when the user does not exist', async () => {
      usersRepository.findById.mockResolvedValue(null);

      await expect(service.findById('missing-user', actor)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
