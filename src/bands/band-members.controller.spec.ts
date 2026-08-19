import { BandMembersController } from './band-members.controller';
import { BandMembersService } from './band-members.service';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

describe('BandMembersController', () => {
  let controller: BandMembersController;
  let bandMembersService: {
    findMembers: jest.Mock;
    addMember: jest.Mock;
    removeMember: jest.Mock;
  };
  const user: AuthenticatedUser = {
    id: 'user-1',
    email: 'user@example.com',
    role: 'BAND',
  };

  beforeEach(() => {
    bandMembersService = {
      findMembers: jest.fn(),
      addMember: jest.fn(),
      removeMember: jest.fn(),
    };
    controller = new BandMembersController(
      bandMembersService as unknown as BandMembersService,
    );
  });

  it('findMembers delegates to BandMembersService.findMembers with bandId and current user id', async () => {
    const expected = [{ userId: 'user-1' }];
    bandMembersService.findMembers.mockResolvedValue(expected);

    const result = await controller.findMembers('band-1', user);

    expect(bandMembersService.findMembers).toHaveBeenCalledWith(
      'band-1',
      'user-1',
    );
    expect(result).toBe(expected);
  });

  it('addMember delegates to BandMembersService.addMember with bandId, dto and current user id', async () => {
    const expected = { bandId: 'band-1', userId: 'user-2', role: 'MANAGER' };
    bandMembersService.addMember.mockResolvedValue(expected);

    const result = await controller.addMember(
      'band-1',
      { userId: 'user-2' },
      user,
    );

    expect(bandMembersService.addMember).toHaveBeenCalledWith(
      'band-1',
      { userId: 'user-2' },
      'user-1',
    );
    expect(result).toBe(expected);
  });

  it('removeMember delegates to BandMembersService.removeMember with bandId, userId and current user id', async () => {
    const expected = { bandId: 'band-1', userId: 'user-2' };
    bandMembersService.removeMember.mockResolvedValue(expected);

    const result = await controller.removeMember('band-1', 'user-2', user);

    expect(bandMembersService.removeMember).toHaveBeenCalledWith(
      'band-1',
      'user-2',
      'user-1',
    );
    expect(result).toBe(expected);
  });
});
