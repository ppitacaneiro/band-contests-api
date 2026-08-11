import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrganizationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.organization.findUnique({
      where: {
        id,
      },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.organization.findUnique({
      where: {
        slug,
      },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.organization.findMany({
      where: {
        users: {
          some: {
            userId,
          },
        },
      },
    });
  }

  async create(data: { name: string; slug: string; userId: string }) {
    return this.prisma.organization.create({
      data: {
        name: data.name,
        slug: data.slug,
        users: {
          create: {
            userId: data.userId,
            role: 'OWNER',
          },
        },
      },
      include: {
        users: true,
      },
    });
  }
}
