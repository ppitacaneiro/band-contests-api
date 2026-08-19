import { OrganizationsRepository } from './organizations.repository';
import { PrismaService } from '../prisma/prisma.service';

describe('OrganizationsRepository', () => {
  let repository: OrganizationsRepository;
  let prisma: {
    organization: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
    };
    organizationUser: {
      findFirst: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      organization: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
      },
      organizationUser: {
        findFirst: jest.fn(),
      },
    };
    repository = new OrganizationsRepository(
      prisma as unknown as PrismaService,
    );
  });

  it('findById queries by id', async () => {
    const org = { id: 'org-1' };
    prisma.organization.findUnique.mockResolvedValue(org);

    const result = await repository.findById('org-1');

    expect(prisma.organization.findUnique).toHaveBeenCalledWith({
      where: { id: 'org-1' },
    });
    expect(result).toBe(org);
  });

  it('findBySlug queries by slug', async () => {
    const org = { id: 'org-1', slug: 'rock-coruna' };
    prisma.organization.findUnique.mockResolvedValue(org);

    const result = await repository.findBySlug('rock-coruna');

    expect(prisma.organization.findUnique).toHaveBeenCalledWith({
      where: { slug: 'rock-coruna' },
    });
    expect(result).toBe(org);
  });

  it('findByUserId filters organizations by member user id', async () => {
    const orgs = [{ id: 'org-1' }];
    prisma.organization.findMany.mockResolvedValue(orgs);

    const result = await repository.findByUserId('user-1');

    expect(prisma.organization.findMany).toHaveBeenCalledWith({
      where: { users: { some: { userId: 'user-1' } } },
    });
    expect(result).toBe(orgs);
  });

  it('findMembership queries the OrganizationUser relation', async () => {
    const membership = {
      id: 'ou-1',
      userId: 'user-1',
      organizationId: 'org-1',
      role: 'OWNER',
    };
    prisma.organizationUser = {
      findFirst: jest.fn().mockResolvedValue(membership),
    };

    const result = await repository.findMembership('user-1', 'org-1');

    expect(prisma.organizationUser.findFirst).toHaveBeenCalledWith({
      where: { userId: 'user-1', organizationId: 'org-1' },
    });
    expect(result).toBe(membership);
  });

  it('create builds a nested OrganizationUser with the OWNER role', async () => {
    const created = { id: 'org-1', name: 'Rock Coruña', slug: 'rock-coruna' };
    prisma.organization.create.mockResolvedValue(created);

    const result = await repository.create({
      name: 'Rock Coruña',
      slug: 'rock-coruna',
      userId: 'user-1',
    });

    expect(prisma.organization.create).toHaveBeenCalledWith({
      data: {
        name: 'Rock Coruña',
        slug: 'rock-coruna',
        users: {
          create: {
            userId: 'user-1',
            role: 'OWNER',
          },
        },
      },
      include: { users: true },
    });
    expect(result).toBe(created);
  });
});
