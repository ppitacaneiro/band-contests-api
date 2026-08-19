import { BandsService } from './bands.service';
import { BandsRepository } from './bands.repository';
import { CreateBandDto } from './dto/create-band.dto';
import { UpdateBandDto } from './dto/update-band.dto';

describe('BandsService', () => {
  let service: BandsService;
  let bandsRepository: {
    create: jest.Mock;
    findById: jest.Mock;
    findByUserId: jest.Mock;
    update: jest.Mock;
    findMembership: jest.Mock;
  };

  beforeEach(() => {
    bandsRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      update: jest.fn(),
      findMembership: jest.fn(),
    };
    service = new BandsService(bandsRepository as unknown as BandsRepository);
  });

  describe('create', () => {
    it('creates the band assigning the user as OWNER', async () => {
      const dto: CreateBandDto = { name: 'Los Deltonos', genre: 'Rock' };
      const created = {
        id: 'band-1',
        name: 'Los Deltonos',
        members: [{ userId: 'user-1', role: 'OWNER' }],
      };
      bandsRepository.create.mockResolvedValue(created);

      const result = await service.create(dto, 'user-1');

      expect(bandsRepository.create).toHaveBeenCalledWith({
        name: 'Los Deltonos',
        description: undefined,
        genre: 'Rock',
        city: undefined,
        userId: 'user-1',
      });
      expect(result).toBe(created);
    });
  });

  describe('findByUserId', () => {
    it('returns the bands of the user', async () => {
      const bands = [{ id: 'band-1' }];
      bandsRepository.findByUserId.mockResolvedValue(bands);

      const result = await service.findByUserId('user-1');

      expect(bandsRepository.findByUserId).toHaveBeenCalledWith('user-1');
      expect(result).toBe(bands);
    });
  });

  describe('findById', () => {
    it('returns the band for a member', async () => {
      const band = { id: 'band-1' };
      bandsRepository.findById.mockResolvedValue(band);
      bandsRepository.findMembership.mockResolvedValue({ role: 'OWNER' });

      const result = await service.findById('band-1', 'user-1');

      expect(bandsRepository.findById).toHaveBeenCalledWith('band-1');
      expect(bandsRepository.findMembership).toHaveBeenCalledWith(
        'band-1',
        'user-1',
      );
      expect(result).toBe(band);
    });

    it('throws NotFoundException when the band does not exist', async () => {
      bandsRepository.findById.mockResolvedValue(null);

      await expect(service.findById('missing', 'user-1')).rejects.toThrow(
        'Band not found',
      );
    });

    it('throws ForbiddenException for a non-member', async () => {
      bandsRepository.findById.mockResolvedValue({ id: 'band-1' });
      bandsRepository.findMembership.mockResolvedValue(null);

      await expect(service.findById('band-1', 'user-2')).rejects.toThrow(
        'You are not a member of this band',
      );
    });
  });

  describe('update', () => {
    it('updates the band when the user is an OWNER', async () => {
      bandsRepository.findById.mockResolvedValue({ id: 'band-1' });
      bandsRepository.findMembership.mockResolvedValue({ role: 'OWNER' });
      const updated = { id: 'band-1', name: 'Nuevo Nombre' };
      bandsRepository.update.mockResolvedValue(updated);

      const dto: UpdateBandDto = { name: 'Nuevo Nombre' };
      const result = await service.update('band-1', dto, 'user-1');

      expect(bandsRepository.update).toHaveBeenCalledWith('band-1', {
        name: 'Nuevo Nombre',
        description: undefined,
        genre: undefined,
        city: undefined,
      });
      expect(result).toBe(updated);
    });

    it('throws NotFoundException when the band does not exist', async () => {
      bandsRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('missing', { name: 'Nuevo' }, 'user-1'),
      ).rejects.toThrow('Band not found');
    });

    it('throws ForbiddenException for a MANAGER or non-member', async () => {
      bandsRepository.findById.mockResolvedValue({ id: 'band-1' });
      bandsRepository.findMembership.mockResolvedValue({ role: 'MANAGER' });

      await expect(
        service.update('band-1', { name: 'Nuevo' }, 'user-2'),
      ).rejects.toThrow('Insufficient permissions to update this band');
    });

    it('throws ForbiddenException for a non-member', async () => {
      bandsRepository.findById.mockResolvedValue({ id: 'band-1' });
      bandsRepository.findMembership.mockResolvedValue(null);

      await expect(
        service.update('band-1', { name: 'Nuevo' }, 'user-2'),
      ).rejects.toThrow('Insufficient permissions to update this band');
    });
  });
});
