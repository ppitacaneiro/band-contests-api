import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

describe('OrganizationsController', () => {
  let controller: OrganizationsController;
  let organizationsService: {
    create: jest.Mock;
    findByUserId: jest.Mock;
    findById: jest.Mock;
  };
  const user: AuthenticatedUser = {
    id: 'user-1',
    email: 'user@example.com',
    role: 'ORGANIZER',
  };

  beforeEach(() => {
    organizationsService = {
      create: jest.fn(),
      findByUserId: jest.fn(),
      findById: jest.fn(),
    };
    controller = new OrganizationsController(
      organizationsService as unknown as OrganizationsService,
    );
  });

  describe('create', () => {
    it('delegates to OrganizationsService.create with the dto and current user id', async () => {
      const dto = { name: 'Rock Coruña' };
      const expected = {
        id: 'org-1',
        name: 'Rock Coruña',
        slug: 'rock-coruna',
      };
      organizationsService.create.mockResolvedValue(expected);

      const result = await controller.create(dto, user);

      expect(organizationsService.create).toHaveBeenCalledWith(dto, 'user-1');
      expect(result).toBe(expected);
    });
  });

  describe('findMine', () => {
    it('delegates to OrganizationsService.findByUserId with the current user id', async () => {
      const expected = [{ id: 'org-1' }];
      organizationsService.findByUserId.mockResolvedValue(expected);

      const result = await controller.findMine(user);

      expect(organizationsService.findByUserId).toHaveBeenCalledWith('user-1');
      expect(result).toBe(expected);
    });
  });

  describe('findById', () => {
    it('delegates to OrganizationsService.findById with the given id', async () => {
      const expected = { id: 'org-1' };
      organizationsService.findById.mockResolvedValue(expected);

      const result = await controller.findById('org-1');

      expect(organizationsService.findById).toHaveBeenCalledWith('org-1');
      expect(result).toBe(expected);
    });
  });
});
