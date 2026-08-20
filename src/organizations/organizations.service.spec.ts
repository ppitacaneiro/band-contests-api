import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsRepository } from './organizations.repository';

describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let organizationsRepository: {
    findBySlug: jest.Mock;
    create: jest.Mock;
    findByUserId: jest.Mock;
    findById: jest.Mock;
    findMembership: jest.Mock;
  };

  beforeEach(() => {
    organizationsRepository = {
      findBySlug: jest.fn(),
      create: jest.fn(),
      findByUserId: jest.fn(),
      findById: jest.fn(),
      findMembership: jest.fn(),
    };
    service = new OrganizationsService(
      organizationsRepository as unknown as OrganizationsRepository,
    );
  });

  describe('create', () => {
    it('creates the organization with the slugified name when the slug is free', async () => {
      organizationsRepository.findBySlug.mockResolvedValue(null);
      const created = { id: 'org-1', name: 'Rock Coruña', slug: 'rock-coruna' };
      organizationsRepository.create.mockResolvedValue(created);

      const result = await service.create({ name: 'Rock Coruña' }, 'user-1');

      expect(organizationsRepository.findBySlug).toHaveBeenCalledWith(
        'rock-coruna',
      );
      expect(organizationsRepository.create).toHaveBeenCalledWith({
        name: 'Rock Coruña',
        slug: 'rock-coruna',
        userId: 'user-1',
      });
      expect(result).toBe(created);
    });

    it('appends an incrementing suffix until it finds a free slug', async () => {
      organizationsRepository.findBySlug
        .mockResolvedValueOnce({ id: 'existing-1', slug: 'rock-coruna' })
        .mockResolvedValueOnce({ id: 'existing-2', slug: 'rock-coruna-2' })
        .mockResolvedValueOnce(null);
      organizationsRepository.create.mockResolvedValue({
        id: 'org-3',
        slug: 'rock-coruna-3',
      });

      await service.create({ name: 'Rock Coruña' }, 'user-1');

      expect(organizationsRepository.findBySlug).toHaveBeenNthCalledWith(
        1,
        'rock-coruna',
      );
      expect(organizationsRepository.findBySlug).toHaveBeenNthCalledWith(
        2,
        'rock-coruna-2',
      );
      expect(organizationsRepository.findBySlug).toHaveBeenNthCalledWith(
        3,
        'rock-coruna-3',
      );
      expect(organizationsRepository.create).toHaveBeenCalledWith({
        name: 'Rock Coruña',
        slug: 'rock-coruna-3',
        userId: 'user-1',
      });
    });

    it('propagates errors raised by the repository', async () => {
      organizationsRepository.findBySlug.mockResolvedValue(null);
      organizationsRepository.create.mockRejectedValue(
        new Error('unique constraint violation'),
      );

      await expect(
        service.create({ name: 'Rock Coruña' }, 'user-1'),
      ).rejects.toThrow('unique constraint violation');
    });
  });

  describe('findByUserId', () => {
    it('delegates to the repository', async () => {
      const orgs = [{ id: 'org-1' }];
      organizationsRepository.findByUserId.mockResolvedValue(orgs);

      const result = await service.findByUserId('user-1');

      expect(organizationsRepository.findByUserId).toHaveBeenCalledWith(
        'user-1',
      );
      expect(result).toBe(orgs);
    });
  });

  describe('findById', () => {
    it('returns the organization when the user is a member', async () => {
      const org = { id: 'org-1', name: 'Rock Coruña' };
      organizationsRepository.findById.mockResolvedValue(org);
      organizationsRepository.findMembership.mockResolvedValue({
        id: 'membership-1',
        userId: 'user-1',
        organizationId: 'org-1',
        role: 'OWNER',
      });

      const result = await service.findById('org-1', 'user-1');

      expect(organizationsRepository.findById).toHaveBeenCalledWith('org-1');
      expect(organizationsRepository.findMembership).toHaveBeenCalledWith(
        'user-1',
        'org-1',
      );
      expect(result).toBe(org);
    });

    it('throws ForbiddenException when the user is not a member', async () => {
      organizationsRepository.findById.mockResolvedValue({
        id: 'org-1',
        name: 'Rock Coruña',
      });
      organizationsRepository.findMembership.mockResolvedValue(null);

      await expect(service.findById('org-1', 'user-2')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws NotFoundException when the organization does not exist', async () => {
      organizationsRepository.findById.mockResolvedValue(null);

      await expect(service.findById('missing-org', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
