import { ContestsRepository } from './contests.repository';
import { PrismaService } from '../prisma/prisma.service';

describe('ContestsRepository', () => {
  let repository: ContestsRepository;
  let prisma: {
    contest: {
      create: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      contest: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
    };
    repository = new ContestsRepository(prisma as unknown as PrismaService);
  });

  it('create creates a contest with the given data', async () => {
    const created = { id: 'contest-1', name: 'Batalla de Bandas' };
    prisma.contest.create.mockResolvedValue(created);

    const result = await repository.create({
      name: 'Batalla de Bandas',
      organizationId: 'org-1',
    });

    expect(prisma.contest.create).toHaveBeenCalledWith({
      data: {
        name: 'Batalla de Bandas',
        organizationId: 'org-1',
      },
    });
    expect(result).toBe(created);
  });

  it('findById queries a contest by id', async () => {
    const contest = { id: 'contest-1' };
    prisma.contest.findUnique.mockResolvedValue(contest);

    const result = await repository.findById('contest-1');

    expect(prisma.contest.findUnique).toHaveBeenCalledWith({
      where: { id: 'contest-1' },
    });
    expect(result).toBe(contest);
  });

  it('findManyByOrganizationId queries contests filtered by organization', async () => {
    const contests = [{ id: 'contest-1' }];
    prisma.contest.findMany.mockResolvedValue(contests);

    const result = await repository.findManyByOrganizationId('org-1');

    expect(prisma.contest.findMany).toHaveBeenCalledWith({
      where: { organizationId: 'org-1' },
      orderBy: { createdAt: 'desc' },
    });
    expect(result).toBe(contests);
  });
});
