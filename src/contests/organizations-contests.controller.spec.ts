import { OrganizationsContestsController } from './organizations-contests.controller';
import { ContestsService } from './contests.service';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

describe('OrganizationsContestsController', () => {
  let controller: OrganizationsContestsController;
  let contestsService: {
    create: jest.Mock;
    findManyByOrganizationId: jest.Mock;
  };
  const user: AuthenticatedUser = {
    id: 'user-1',
    email: 'user@example.com',
    role: 'ORGANIZER',
  };

  beforeEach(() => {
    contestsService = {
      create: jest.fn(),
      findManyByOrganizationId: jest.fn(),
    };
    controller = new OrganizationsContestsController(
      contestsService as unknown as ContestsService,
    );
  });

  describe('create', () => {
    it('delegates to ContestsService.create with organization id, dto and user id', async () => {
      const dto = { name: 'Batalla de Bandas' };
      const expected = { id: 'contest-1', name: 'Batalla de Bandas' };
      contestsService.create.mockResolvedValue(expected);

      const result = await controller.create('org-1', dto, user);

      expect(contestsService.create).toHaveBeenCalledWith(
        'org-1',
        dto,
        'user-1',
      );
      expect(result).toBe(expected);
    });
  });

  describe('findMany', () => {
    it('delegates to ContestsService.findManyByOrganizationId', async () => {
      const expected = [{ id: 'contest-1' }];
      contestsService.findManyByOrganizationId.mockResolvedValue(expected);

      const result = await controller.findMany('org-1', user);

      expect(contestsService.findManyByOrganizationId).toHaveBeenCalledWith(
        'org-1',
        'user-1',
      );
      expect(result).toBe(expected);
    });
  });
});
