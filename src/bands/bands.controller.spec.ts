import { BandsController } from './bands.controller';
import { BandsService } from './bands.service';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

describe('BandsController', () => {
  let controller: BandsController;
  let bandsService: {
    create: jest.Mock;
    findByUserId: jest.Mock;
    findById: jest.Mock;
    update: jest.Mock;
  };
  const user: AuthenticatedUser = {
    id: 'user-1',
    email: 'user@example.com',
    role: 'BAND',
  };

  beforeEach(() => {
    bandsService = {
      create: jest.fn(),
      findByUserId: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    };
    controller = new BandsController(bandsService as unknown as BandsService);
  });

  it('create delegates to BandsService.create with the dto and current user id', async () => {
    const expected = { id: 'band-1', name: 'Los Deltonos' };
    bandsService.create.mockResolvedValue(expected);

    const result = await controller.create({ name: 'Los Deltonos' }, user);

    expect(bandsService.create).toHaveBeenCalledWith(
      { name: 'Los Deltonos' },
      'user-1',
    );
    expect(result).toBe(expected);
  });

  it('findMine delegates to BandsService.findByUserId with the current user id', async () => {
    const expected = [{ id: 'band-1' }];
    bandsService.findByUserId.mockResolvedValue(expected);

    const result = await controller.findMine(user);

    expect(bandsService.findByUserId).toHaveBeenCalledWith('user-1');
    expect(result).toBe(expected);
  });

  it('findById delegates to BandsService.findById with the id and current user id', async () => {
    const expected = { id: 'band-1' };
    bandsService.findById.mockResolvedValue(expected);

    const result = await controller.findById('band-1', user);

    expect(bandsService.findById).toHaveBeenCalledWith('band-1', 'user-1');
    expect(result).toBe(expected);
  });

  it('update delegates to BandsService.update with the id, dto and current user id', async () => {
    const expected = { id: 'band-1', name: 'Nuevo' };
    bandsService.update.mockResolvedValue(expected);

    const result = await controller.update('band-1', { name: 'Nuevo' }, user);

    expect(bandsService.update).toHaveBeenCalledWith(
      'band-1',
      { name: 'Nuevo' },
      'user-1',
    );
    expect(result).toBe(expected);
  });
});
