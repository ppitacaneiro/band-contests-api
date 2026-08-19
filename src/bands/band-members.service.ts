import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BandsRepository } from './bands.repository';
import { UsersRepository } from '../users/users.repository';
import { AddBandMemberDto } from './dto/add-band-member.dto';

const MANAGER_ROLES = ['OWNER', 'MANAGER'] as const;

@Injectable()
export class BandMembersService {
  constructor(
    private readonly bandsRepository: BandsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async findMembers(bandId: string, userId: string) {
    const band = await this.bandsRepository.findById(bandId);

    if (!band) {
      throw new NotFoundException('Band not found');
    }

    const membership = await this.bandsRepository.findMembership(
      bandId,
      userId,
    );

    if (!membership) {
      throw new ForbiddenException('You are not a member of this band');
    }

    return this.bandsRepository.findMembers(bandId);
  }

  async addMember(
    bandId: string,
    addBandMemberDto: AddBandMemberDto,
    actorId: string,
  ) {
    const band = await this.bandsRepository.findById(bandId);

    if (!band) {
      throw new NotFoundException('Band not found');
    }

    const actorMembership = await this.bandsRepository.findMembership(
      bandId,
      actorId,
    );

    if (!actorMembership || !MANAGER_ROLES.includes(actorMembership.role)) {
      throw new ForbiddenException(
        'Insufficient permissions to manage band members',
      );
    }

    const user = await this.usersRepository.findById(addBandMemberDto.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.bandsRepository.findMembership(
      bandId,
      addBandMemberDto.userId,
    );

    if (existing) {
      throw new ConflictException('User is already a member of this band');
    }

    return this.bandsRepository.addMember(
      bandId,
      addBandMemberDto.userId,
      addBandMemberDto.role ?? 'MANAGER',
    );
  }

  async removeMember(bandId: string, targetUserId: string, actorId: string) {
    const band = await this.bandsRepository.findById(bandId);

    if (!band) {
      throw new NotFoundException('Band not found');
    }

    const actorMembership = await this.bandsRepository.findMembership(
      bandId,
      actorId,
    );

    if (!actorMembership || !MANAGER_ROLES.includes(actorMembership.role)) {
      throw new ForbiddenException(
        'Insufficient permissions to manage band members',
      );
    }

    const targetMembership = await this.bandsRepository.findMembership(
      bandId,
      targetUserId,
    );

    if (!targetMembership) {
      throw new NotFoundException('User is not a member of this band');
    }

    if (targetMembership.role === 'OWNER') {
      const owners = await this.bandsRepository.countOwners(bandId);

      if (owners <= 1) {
        throw new BadRequestException(
          'Cannot remove the last owner of the band',
        );
      }
    }

    return this.bandsRepository.removeMember(bandId, targetUserId);
  }
}
