import { BandsRepository } from './bands.repository';
import { PrismaService } from '../prisma/prisma.service';

describe('BandsRepository', () => {
  let repository: BandsRepository;
  let prisma: {
    band: {
      create: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
    };
    bandMember: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      band: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      bandMember: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    };
    repository = new BandsRepository(prisma as unknown as PrismaService);
  });

  it('create creates a band with the user as OWNER', async () => {
    const created = { id: 'band-1', name: 'Los Deltonos', members: [] };
    prisma.band.create.mockResolvedValue(created);

    const result = await repository.create({
      name: 'Los Deltonos',
      description: 'Rock',
      userId: 'user-1',
    });

    expect(prisma.band.create).toHaveBeenCalledWith({
      data: {
        name: 'Los Deltonos',
        description: 'Rock',
        genre: undefined,
        city: undefined,
        members: {
          create: {
            userId: 'user-1',
            role: 'OWNER',
          },
        },
      },
      include: {
        members: true,
      },
    });
    expect(result).toBe(created);
  });

  it('findById queries a band by id', async () => {
    const band = { id: 'band-1' };
    prisma.band.findUnique.mockResolvedValue(band);

    const result = await repository.findById('band-1');

    expect(prisma.band.findUnique).toHaveBeenCalledWith({
      where: { id: 'band-1' },
    });
    expect(result).toBe(band);
  });

  it('findByUserId queries bands where the user is a member', async () => {
    const bands = [{ id: 'band-1' }];
    prisma.band.findMany.mockResolvedValue(bands);

    const result = await repository.findByUserId('user-1');

    expect(prisma.band.findMany).toHaveBeenCalledWith({
      where: {
        members: {
          some: { userId: 'user-1' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(result).toBe(bands);
  });

  it('update updates the band with the given data', async () => {
    const updated = { id: 'band-1', name: 'Nuevo Nombre' };
    prisma.band.update.mockResolvedValue(updated);

    const result = await repository.update('band-1', { name: 'Nuevo Nombre' });

    expect(prisma.band.update).toHaveBeenCalledWith({
      where: { id: 'band-1' },
      data: { name: 'Nuevo Nombre' },
    });
    expect(result).toBe(updated);
  });

  it('findMembership queries the band membership of a user', async () => {
    const membership = { bandId: 'band-1', userId: 'user-1', role: 'OWNER' };
    prisma.bandMember.findFirst.mockResolvedValue(membership);

    const result = await repository.findMembership('band-1', 'user-1');

    expect(prisma.bandMember.findFirst).toHaveBeenCalledWith({
      where: { bandId: 'band-1', userId: 'user-1' },
    });
    expect(result).toBe(membership);
  });

  it('findMembers lists the members of a band', async () => {
    const members = [{ userId: 'user-1' }];
    prisma.bandMember.findMany.mockResolvedValue(members);

    const result = await repository.findMembers('band-1');

    expect(prisma.bandMember.findMany).toHaveBeenCalledWith({
      where: { bandId: 'band-1' },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    expect(result).toBe(members);
  });

  it('addMember creates a membership with the given role', async () => {
    const membership = { bandId: 'band-1', userId: 'user-2', role: 'MANAGER' };
    prisma.bandMember.create.mockResolvedValue(membership);

    const result = await repository.addMember('band-1', 'user-2', 'MANAGER');

    expect(prisma.bandMember.create).toHaveBeenCalledWith({
      data: { bandId: 'band-1', userId: 'user-2', role: 'MANAGER' },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    expect(result).toBe(membership);
  });

  it('removeMember deletes the membership by compound key', async () => {
    const deleted = { bandId: 'band-1', userId: 'user-2' };
    prisma.bandMember.delete.mockResolvedValue(deleted);

    const result = await repository.removeMember('band-1', 'user-2');

    expect(prisma.bandMember.delete).toHaveBeenCalledWith({
      where: {
        bandId_userId: {
          bandId: 'band-1',
          userId: 'user-2',
        },
      },
    });
    expect(result).toBe(deleted);
  });

  it('countOwners counts owners of the band', async () => {
    prisma.bandMember.count.mockResolvedValue(1);

    const result = await repository.countOwners('band-1');

    expect(prisma.bandMember.count).toHaveBeenCalledWith({
      where: { bandId: 'band-1', role: 'OWNER' },
    });
    expect(result).toBe(1);
  });
});
