import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrganizationsRepository } from './organizations.repository';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { slugify } from '../common/utils/slug.util';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly organizationsRepository: OrganizationsRepository,
  ) {}

  async create(createOrganizationDto: CreateOrganizationDto, userId: string) {
    const baseSlug = slugify(createOrganizationDto.name);

    let slug = baseSlug;
    let counter = 2;

    while (await this.organizationsRepository.findBySlug(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return this.organizationsRepository.create({
      name: createOrganizationDto.name,
      slug,
      userId,
    });
  }

  async findByUserId(userId: string) {
    return this.organizationsRepository.findByUserId(userId);
  }

  async findById(id: string, userId: string) {
    const organization = await this.organizationsRepository.findById(id);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const membership = await this.organizationsRepository.findMembership(
      userId,
      id,
    );

    if (!membership) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    return organization;
  }
}
