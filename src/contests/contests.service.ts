import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrganizationsRepository } from '../organizations/organizations.repository';
import { ContestsRepository } from './contests.repository';
import { CreateContestDto } from './dto/create-contest.dto';

@Injectable()
export class ContestsService {
  constructor(
    private readonly contestsRepository: ContestsRepository,
    private readonly organizationsRepository: OrganizationsRepository,
  ) {}

  async create(
    organizationId: string,
    createContestDto: CreateContestDto,
    userId: string,
  ) {
    const organization =
      await this.organizationsRepository.findById(organizationId);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const membership = await this.organizationsRepository.findMembership(
      userId,
      organizationId,
    );

    if (!membership) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    if (membership.role !== 'OWNER' && membership.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Insufficient permissions to create contests',
      );
    }

    if (
      createContestDto.startsAt &&
      createContestDto.endsAt &&
      new Date(createContestDto.endsAt) <= new Date(createContestDto.startsAt)
    ) {
      throw new BadRequestException('endsAt must be after startsAt');
    }

    return this.contestsRepository.create({
      name: createContestDto.name,
      description: createContestDto.description,
      posterUrl: createContestDto.posterUrl,
      latitude: createContestDto.latitude,
      longitude: createContestDto.longitude,
      startsAt: createContestDto.startsAt
        ? new Date(createContestDto.startsAt)
        : undefined,
      endsAt: createContestDto.endsAt
        ? new Date(createContestDto.endsAt)
        : undefined,
      registrationDeadline: createContestDto.registrationDeadline
        ? new Date(createContestDto.registrationDeadline)
        : undefined,
      rules: createContestDto.rules,
      votingMode: createContestDto.votingMode,
      organizationId,
    });
  }

  async findManyByOrganizationId(organizationId: string, userId: string) {
    const membership = await this.organizationsRepository.findMembership(
      userId,
      organizationId,
    );

    if (!membership) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    return this.contestsRepository.findManyByOrganizationId(organizationId);
  }

  async findById(id: string, userId: string) {
    const contest = await this.contestsRepository.findById(id);

    if (!contest) {
      throw new NotFoundException('Contest not found');
    }

    const membership = await this.organizationsRepository.findMembership(
      userId,
      contest.organizationId,
    );

    if (!membership) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    return contest;
  }
}
