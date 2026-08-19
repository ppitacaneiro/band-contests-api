import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { ContestVotingMode } from '../../generated/prisma/client';

@Injectable()
export class ContestsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    description?: string | null;
    posterUrl?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    startsAt?: Date | null;
    endsAt?: Date | null;
    registrationDeadline?: Date | null;
    rules?: string | null;
    votingMode?: ContestVotingMode;
    organizationId: string;
  }) {
    return this.prisma.contest.create({
      data,
    });
  }

  async findById(id: string) {
    return this.prisma.contest.findUnique({
      where: {
        id,
      },
    });
  }

  async findManyByOrganizationId(organizationId: string) {
    return this.prisma.contest.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
