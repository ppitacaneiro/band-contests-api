import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: { create: jest.Mock; findById: jest.Mock };

  beforeEach(() => {
    usersService = { create: jest.fn(), findById: jest.fn() };
    controller = new UsersController(usersService as unknown as UsersService);
  });

  describe('create', () => {
    it('delegates to UsersService.create and returns its result', async () => {
      const createUserDto = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
      };
      const expected = {
        id: 'user-1',
        name: 'Jane Doe',
        email: 'jane@example.com',
      };
      usersService.create.mockResolvedValue(expected);

      const result = await controller.create(createUserDto);

      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toBe(expected);
    });
  });

  describe('findById', () => {
    it('delegates to UsersService.findById and returns its result', async () => {
      const expected = {
        id: 'user-1',
        name: 'Jane Doe',
        email: 'jane@example.com',
      };
      usersService.findById.mockResolvedValue(expected);

      const result = await controller.findById('user-1');

      expect(usersService.findById).toHaveBeenCalledWith('user-1');
      expect(result).toBe(expected);
    });
  });
});
