import {
    ConflictException,
    Injectable,
} from '@nestjs/common';
import { OrganizationsRepository } from './organizations.repository';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { slugify } from '../common/utils/slug.util';

@Injectable()
export class OrganizationsService {
    constructor(
        private readonly organizationsRepository: OrganizationsRepository,
    ) {}

    async create (createOrganizationDto: CreateOrganizationDto,userId: string) {
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

    async findById(id: string) {
        return this.organizationsRepository.findById(id);
    }
}