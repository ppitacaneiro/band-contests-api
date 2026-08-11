import { UsersRepository } from './users.repository';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let prisma: { user: { findUnique: jest.Mock; create: jest.Mock } };

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };
    repository = new UsersRepository(prisma as unknown as PrismaService);
  });

  it('findByEmail queries by email', async () => {
    const user = { id: 'user-1', email: 'user@example.com' };
    prisma.user.findUnique.mockResolvedValue(user);

    const result = await repository.findByEmail('user@example.com');

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
    });
    expect(result).toBe(user);
  });

  it('findById queries by id', async () => {
    const user = { id: 'user-1', email: 'user@example.com' };
    prisma.user.findUnique.mockResolvedValue(user);

    const result = await repository.findById('user-1');

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
    });
    expect(result).toBe(user);
  });

  it('create passes the given data straight to Prisma', async () => {
    const data = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'hashed-password',
    };
    const created = { id: 'user-1', ...data };
    prisma.user.create.mockResolvedValue(created);

    const result = await repository.create(data);

    expect(prisma.user.create).toHaveBeenCalledWith({ data });
    expect(result).toBe(created);
  });
});
