import { BandMembersService } from './band-members.service';
import { BandsRepository } from './bands.repository';
import { UsersRepository } from '../users/users.repository';
import { AddBandMemberDto } from './dto/add-band-member.dto';

describe('BandMembersService', () => {
  let service: BandMembersService;
  let bandsRepository: {
    findById: jest.Mock;
    findMembership: jest.Mock;
    findMembers: jest.Mock;
    addMember: jest.Mock;
    removeMember: jest.Mock;
    countOwners: jest.Mock;
  };
  let usersRepository: {
    findById: jest.Mock;
  };

  beforeEach(() => {
    bandsRepository = {
      findById: jest.fn(),
      findMembership: jest.fn(),
      findMembers: jest.fn(),
      addMember: jest.fn(),
      removeMember: jest.fn(),
      countOwners: jest.fn(),
    };
    usersRepository = {
      findById: jest.fn(),
    };
    service = new BandMembersService(
      bandsRepository as unknown as BandsRepository,
      usersRepository as unknown as UsersRepository,
    );
  });

  describe('findMembers', () => {
    it('returns the members for a member of the band', async () => {
      bandsRepository.findById.mockResolvedValue({ id: 'band-1' });
      bandsRepository.findMembership.mockResolvedValue({ role: 'OWNER' });
      const members = [{ userId: 'user-1' }];
      bandsRepository.findMembers.mockResolvedValue(members);

      const result = await service.findMembers('band-1', 'user-1');

      expect(bandsRepository.findMembers).toHaveBeenCalledWith('band-1');
      expect(result).toBe(members);
    });

    it('throws NotFoundException when the band does not exist', async () => {
      bandsRepository.findById.mockResolvedValue(null);

      await expect(service.findMembers('missing', 'user-1')).rejects.toThrow(
        'Band not found',
      );
    });

    it('throws ForbiddenException for a non-member', async () => {
      bandsRepository.findById.mockResolvedValue({ id: 'band-1' });
      bandsRepository.findMembership.mockResolvedValue(null);

      await expect(service.findMembers('band-1', 'user-2')).rejects.toThrow(
        'You are not a member of this band',
      );
    });
  });

  describe('addMember', () => {
    it('adds the user as MANAGER by default for an OWNER actor', async () => {
      bandsRepository.findById.mockResolvedValue({ id: 'band-1' });
      bandsRepository.findMembership.mockResolvedValue({ role: 'OWNER' });
      usersRepository.findById.mockResolvedValue({ id: 'user-2' });
      bandsRepository.findMembership.mockResolvedValueOnce({ role: 'OWNER' });
      bandsRepository.findMembership.mockResolvedValueOnce(null);
      const membership = {
        bandId: 'band-1',
        userId: 'user-2',
        role: 'MANAGER',
      };
      bandsRepository.addMember.mockResolvedValue(membership);

      const dto: AddBandMemberDto = { userId: 'user-2' };
      const result = await service.addMember('band-1', dto, 'user-1');

      expect(bandsRepository.addMember).toHaveBeenCalledWith(
        'band-1',
        'user-2',
        'MANAGER',
      );
      expect(result).toBe(membership);
    });

    it('adds the user with the requested role for a MANAGER actor', async () => {
      bandsRepository.findById.mockResolvedValue({ id: 'band-1' });
      bandsRepository.findMembership.mockResolvedValueOnce({ role: 'MANAGER' });
      bandsRepository.findMembership.mockResolvedValueOnce(null);
      usersRepository.findById.mockResolvedValue({ id: 'user-2' });
      bandsRepository.addMember.mockResolvedValue({});

      await service.addMember(
        'band-1',
        { userId: 'user-2', role: 'OWNER' },
        'user-1',
      );

      expect(bandsRepository.addMember).toHaveBeenCalledWith(
        'band-1',
        'user-2',
        'OWNER',
      );
    });

    it('throws NotFoundException when the band does not exist', async () => {
      bandsRepository.findById.mockResolvedValue(null);

      await expect(
        service.addMember('missing', { userId: 'user-2' }, 'user-1'),
      ).rejects.toThrow('Band not found');
    });

    it('throws ForbiddenException when the actor is not OWNER or MANAGER', async () => {
      bandsRepository.findById.mockResolvedValue({ id: 'band-1' });
      bandsRepository.findMembership.mockResolvedValue(null);

      await expect(
        service.addMember('band-1', { userId: 'user-2' }, 'user-1'),
      ).rejects.toThrow('Insufficient permissions to manage band members');
    });

    it('throws NotFoundException when the target user does not exist', async () => {
      bandsRepository.findById.mockResolvedValue({ id: 'band-1' });
      bandsRepository.findMembership.mockResolvedValue({ role: 'OWNER' });
      usersRepository.findById.mockResolvedValue(null);

      await expect(
        service.addMember('band-1', { userId: 'user-2' }, 'user-1'),
      ).rejects.toThrow('User not found');
    });

    it('throws ConflictException when the user is already a member', async () => {
      bandsRepository.findById.mockResolvedValue({ id: 'band-1' });
      bandsRepository.findMembership.mockResolvedValue({ role: 'OWNER' });
      usersRepository.findById.mockResolvedValue({ id: 'user-2' });
      bandsRepository.findMembership.mockResolvedValueOnce({ role: 'OWNER' });
      bandsRepository.findMembership.mockResolvedValueOnce({ role: 'OWNER' });

      await expect(
        service.addMember('band-1', { userId: 'user-2' }, 'user-1'),
      ).rejects.toThrow('User is already a member of this band');
    });
  });

  describe('removeMember', () => {
    it('removes a MANAGER member for an OWNER actor', async () => {
      bandsRepository.findById.mockResolvedValue({ id: 'band-1' });
      bandsRepository.findMembership.mockResolvedValue({ role: 'OWNER' });
      bandsRepository.findMembership.mockResolvedValueOnce({ role: 'OWNER' });
      bandsRepository.findMembership.mockResolvedValueOnce({ role: 'MANAGER' });
      const removed = { bandId: 'band-1', userId: 'user-2' };
      bandsRepository.removeMember.mockResolvedValue(removed);

      const result = await service.removeMember('band-1', 'user-2', 'user-1');

      expect(bandsRepository.removeMember).toHaveBeenCalledWith(
        'band-1',
        'user-2',
      );
      expect(result).toBe(removed);
    });

    it('throws BadRequestException when trying to remove the last owner', async () => {
      bandsRepository.findById.mockResolvedValue({ id: 'band-1' });
      bandsRepository.findMembership.mockResolvedValue({ role: 'OWNER' });
      bandsRepository.findMembership.mockResolvedValueOnce({ role: 'OWNER' });
      bandsRepository.findMembership.mockResolvedValueOnce({ role: 'OWNER' });
      bandsRepository.countOwners.mockResolvedValue(1);

      await expect(
        service.removeMember('band-1', 'user-2', 'user-1'),
      ).rejects.toThrow('Cannot remove the last owner of the band');
    });

    it('allows removing an owner when there is more than one', async () => {
      bandsRepository.findById.mockResolvedValue({ id: 'band-1' });
      bandsRepository.findMembership.mockResolvedValue({ role: 'OWNER' });
      bandsRepository.findMembership.mockResolvedValueOnce({ role: 'OWNER' });
      bandsRepository.findMembership.mockResolvedValueOnce({ role: 'OWNER' });
      bandsRepository.countOwners.mockResolvedValue(2);
      bandsRepository.removeMember.mockResolvedValue({});

      await service.removeMember('band-1', 'user-2', 'user-1');

      expect(bandsRepository.countOwners).toHaveBeenCalledWith('band-1');
      expect(bandsRepository.removeMember).toHaveBeenCalledWith(
        'band-1',
        'user-2',
      );
    });

    it('throws NotFoundException when the band does not exist', async () => {
      bandsRepository.findById.mockResolvedValue(null);

      await expect(
        service.removeMember('missing', 'user-2', 'user-1'),
      ).rejects.toThrow('Band not found');
    });

    it('throws ForbiddenException when the actor is not OWNER or MANAGER', async () => {
      bandsRepository.findById.mockResolvedValue({ id: 'band-1' });
      bandsRepository.findMembership.mockResolvedValue(null);

      await expect(
        service.removeMember('band-1', 'user-2', 'user-1'),
      ).rejects.toThrow('Insufficient permissions to manage band members');
    });

    it('throws NotFoundException when the target is not a member', async () => {
      bandsRepository.findById.mockResolvedValue({ id: 'band-1' });
      bandsRepository.findMembership.mockResolvedValue({ role: 'OWNER' });
      bandsRepository.findMembership.mockResolvedValueOnce({ role: 'OWNER' });
      bandsRepository.findMembership.mockResolvedValueOnce(null);

      await expect(
        service.removeMember('band-1', 'user-2', 'user-1'),
      ).rejects.toThrow('User is not a member of this band');
    });
  });
});
