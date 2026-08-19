import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { BandRole } from '../../generated/prisma/client';

@Injectable()
export class BandsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    description?: string | null;
    genre?: string | null;
    city?: string | null;
    userId: string;
  }) {
    return this.prisma.band.create({
      data: {
        name: data.name,
        description: data.description,
        genre: data.genre,
        city: data.city,
        members: {
          create: {
            userId: data.userId,
            role: 'OWNER',
          },
        },
      },
      include: {
        members: true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.band.findUnique({
      where: {
        id,
      },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.band.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string | null;
      genre?: string | null;
      city?: string | null;
    },
  ) {
    return this.prisma.band.update({
      where: {
        id,
      },
      data,
    });
  }

  async findMembership(bandId: string, userId: string) {
    return this.prisma.bandMember.findFirst({
      where: {
        bandId,
        userId,
      },
    });
  }

  async findMembers(bandId: string) {
    return this.prisma.bandMember.findMany({
      where: {
        bandId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async addMember(bandId: string, userId: string, role: BandRole) {
    return this.prisma.bandMember.create({
      data: {
        bandId,
        userId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async removeMember(bandId: string, userId: string) {
    return this.prisma.bandMember.delete({
      where: {
        bandId_userId: {
          bandId,
          userId,
        },
      },
    });
  }

  async countOwners(bandId: string) {
    return this.prisma.bandMember.count({
      where: {
        bandId,
        role: 'OWNER',
      },
    });
  }
}
