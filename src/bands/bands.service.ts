import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BandsRepository } from './bands.repository';
import { CreateBandDto } from './dto/create-band.dto';
import { UpdateBandDto } from './dto/update-band.dto';

@Injectable()
export class BandsService {
  constructor(private readonly bandsRepository: BandsRepository) {}

  async create(createBandDto: CreateBandDto, userId: string) {
    return this.bandsRepository.create({
      name: createBandDto.name,
      description: createBandDto.description,
      genre: createBandDto.genre,
      city: createBandDto.city,
      userId,
    });
  }

  async findByUserId(userId: string) {
    return this.bandsRepository.findByUserId(userId);
  }

  async findById(id: string, userId: string) {
    const band = await this.bandsRepository.findById(id);

    if (!band) {
      throw new NotFoundException('Band not found');
    }

    const membership = await this.bandsRepository.findMembership(id, userId);

    if (!membership) {
      throw new ForbiddenException('You are not a member of this band');
    }

    return band;
  }

  async update(id: string, updateBandDto: UpdateBandDto, userId: string) {
    const band = await this.bandsRepository.findById(id);

    if (!band) {
      throw new NotFoundException('Band not found');
    }

    const membership = await this.bandsRepository.findMembership(id, userId);

    if (!membership || membership.role !== 'OWNER') {
      throw new ForbiddenException(
        'Insufficient permissions to update this band',
      );
    }

    return this.bandsRepository.update(id, {
      name: updateBandDto.name,
      description: updateBandDto.description,
      genre: updateBandDto.genre,
      city: updateBandDto.city,
    });
  }
}
