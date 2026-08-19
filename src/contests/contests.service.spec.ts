import { ContestsService } from './contests.service';
import { ContestsRepository } from './contests.repository';
import { OrganizationsRepository } from '../organizations/organizations.repository';
import { CreateContestDto } from './dto/create-contest.dto';

describe('ContestsService', () => {
  let service: ContestsService;
  let contestsRepository: {
    create: jest.Mock;
    findById: jest.Mock;
    findManyByOrganizationId: jest.Mock;
  };
  let organizationsRepository: {
    findById: jest.Mock;
    findMembership: jest.Mock;
  };

  beforeEach(() => {
    contestsRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findManyByOrganizationId: jest.fn(),
    };
    organizationsRepository = {
      findById: jest.fn(),
      findMembership: jest.fn(),
    };
    service = new ContestsService(
      contestsRepository as unknown as ContestsRepository,
      organizationsRepository as unknown as OrganizationsRepository,
    );
  });

  describe('create', () => {
    it('creates the contest as DRAFT for an OWNER member', async () => {
      organizationsRepository.findById.mockResolvedValue({
        id: 'org-1',
        name: 'Rock Coruña',
      });
      organizationsRepository.findMembership.mockResolvedValue({
        userId: 'user-1',
        organizationId: 'org-1',
        role: 'OWNER',
      });
      const dto: CreateContestDto = { name: 'Batalla de Bandas' };
      const created = {
        id: 'contest-1',
        name: 'Batalla de Bandas',
        status: 'DRAFT',
        organizationId: 'org-1',
      };
      contestsRepository.create.mockResolvedValue(created);

      const result = await service.create('org-1', dto, 'user-1');

      expect(organizationsRepository.findById).toHaveBeenCalledWith('org-1');
      expect(organizationsRepository.findMembership).toHaveBeenCalledWith(
        'user-1',
        'org-1',
      );
      expect(contestsRepository.create).toHaveBeenCalledWith({
        name: 'Batalla de Bandas',
        description: undefined,
        posterUrl: undefined,
        latitude: undefined,
        longitude: undefined,
        startsAt: undefined,
        endsAt: undefined,
        registrationDeadline: undefined,
        rules: undefined,
        votingMode: undefined,
        organizationId: 'org-1',
      });
      expect(result).toBe(created);
    });

    it('creates the contest for an ADMIN member', async () => {
      organizationsRepository.findById.mockResolvedValue({ id: 'org-1' });
      organizationsRepository.findMembership.mockResolvedValue({
        role: 'ADMIN',
      });
      contestsRepository.create.mockResolvedValue({ id: 'contest-1' });

      await service.create('org-1', { name: 'Concurso X' }, 'user-1');

      expect(contestsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ organizationId: 'org-1' }),
      );
    });

    it('converts date strings into Date objects', async () => {
      organizationsRepository.findById.mockResolvedValue({ id: 'org-1' });
      organizationsRepository.findMembership.mockResolvedValue({
        role: 'OWNER',
      });
      contestsRepository.create.mockResolvedValue({ id: 'contest-1' });

      const dto: CreateContestDto = {
        name: 'Concurso Fechado',
        startsAt: '2026-10-01T10:00:00.000Z',
        endsAt: '2026-10-02T22:00:00.000Z',
        registrationDeadline: '2026-09-15T00:00:00.000Z',
      };

      await service.create('org-1', dto, 'user-1');

      expect(contestsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          startsAt: new Date('2026-10-01T10:00:00.000Z'),
          endsAt: new Date('2026-10-02T22:00:00.000Z'),
          registrationDeadline: new Date('2026-09-15T00:00:00.000Z'),
        }),
      );
    });

    it('throws NotFoundException when the organization does not exist', async () => {
      organizationsRepository.findById.mockResolvedValue(null);

      await expect(
        service.create('missing-org', { name: 'Concurso' }, 'user-1'),
      ).rejects.toThrow('Organization not found');
    });

    it('throws ForbiddenException when the user is not a member', async () => {
      organizationsRepository.findById.mockResolvedValue({ id: 'org-1' });
      organizationsRepository.findMembership.mockResolvedValue(null);

      await expect(
        service.create('org-1', { name: 'Concurso' }, 'user-1'),
      ).rejects.toThrow('You are not a member of this organization');
    });

    it('throws ForbiddenException when the member role is not OWNER or ADMIN', async () => {
      organizationsRepository.findById.mockResolvedValue({ id: 'org-1' });
      organizationsRepository.findMembership.mockResolvedValue({
        role: 'MEMBER',
      });

      await expect(
        service.create('org-1', { name: 'Concurso' }, 'user-1'),
      ).rejects.toThrow('Insufficient permissions to create contests');
    });

    it('throws BadRequestException when endsAt is not after startsAt', async () => {
      organizationsRepository.findById.mockResolvedValue({ id: 'org-1' });
      organizationsRepository.findMembership.mockResolvedValue({
        role: 'OWNER',
      });

      await expect(
        service.create(
          'org-1',
          {
            name: 'Concurso',
            startsAt: '2026-10-02T00:00:00.000Z',
            endsAt: '2026-10-01T00:00:00.000Z',
          },
          'user-1',
        ),
      ).rejects.toThrow('endsAt must be after startsAt');
    });
  });

  describe('findManyByOrganizationId', () => {
    it('returns the contests of the organization for a member', async () => {
      organizationsRepository.findMembership.mockResolvedValue({
        role: 'MEMBER',
      });
      const contests = [{ id: 'contest-1' }];
      contestsRepository.findManyByOrganizationId.mockResolvedValue(contests);

      const result = await service.findManyByOrganizationId('org-1', 'user-1');

      expect(contestsRepository.findManyByOrganizationId).toHaveBeenCalledWith(
        'org-1',
      );
      expect(result).toBe(contests);
    });

    it('throws ForbiddenException for a non-member', async () => {
      organizationsRepository.findMembership.mockResolvedValue(null);

      await expect(
        service.findManyByOrganizationId('org-1', 'user-1'),
      ).rejects.toThrow('You are not a member of this organization');
    });
  });

  describe('findById', () => {
    it('returns the contest for a member of its organization', async () => {
      const contest = { id: 'contest-1', organizationId: 'org-1' };
      contestsRepository.findById.mockResolvedValue(contest);
      organizationsRepository.findMembership.mockResolvedValue({
        role: 'MEMBER',
      });

      const result = await service.findById('contest-1', 'user-1');

      expect(contestsRepository.findById).toHaveBeenCalledWith('contest-1');
      expect(organizationsRepository.findMembership).toHaveBeenCalledWith(
        'user-1',
        'org-1',
      );
      expect(result).toBe(contest);
    });

    it('throws NotFoundException when the contest does not exist', async () => {
      contestsRepository.findById.mockResolvedValue(null);

      await expect(service.findById('missing', 'user-1')).rejects.toThrow(
        'Contest not found',
      );
    });

    it('throws ForbiddenException for a non-member of the contest organization', async () => {
      contestsRepository.findById.mockResolvedValue({
        id: 'contest-1',
        organizationId: 'org-1',
      });
      organizationsRepository.findMembership.mockResolvedValue(null);

      await expect(service.findById('contest-1', 'user-1')).rejects.toThrow(
        'You are not a member of this organization',
      );
    });
  });
});
