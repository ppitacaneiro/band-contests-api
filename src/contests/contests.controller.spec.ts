import { ContestsController } from './contests.controller';
import { ContestsService } from './contests.service';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

describe('ContestsController', () => {
  let controller: ContestsController;
  let contestsService: {
    findById: jest.Mock;
  };
  const user: AuthenticatedUser = {
    id: 'user-1',
    email: 'user@example.com',
    role: 'ORGANIZER',
  };

  beforeEach(() => {
    contestsService = {
      findById: jest.fn(),
    };
    controller = new ContestsController(
      contestsService as unknown as ContestsService,
    );
  });

  describe('findById', () => {
    it('delegates to ContestsService.findById with the id and current user id', async () => {
      const expected = { id: 'contest-1', name: 'Batalla de Bandas' };
      contestsService.findById.mockResolvedValue(expected);

      const result = await controller.findById('contest-1', user);

      expect(contestsService.findById).toHaveBeenCalledWith(
        'contest-1',
        'user-1',
      );
      expect(result).toBe(expected);
    });
  });
});
