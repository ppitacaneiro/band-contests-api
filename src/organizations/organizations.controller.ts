import {
    Body,
    Controller,
    Get,
    Param,
    Post,
UseGuards,
} from '@nestjs/common';

import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
    
    constructor(
        private readonly organizationsService: OrganizationsService,
    ) {}

    @Post() async create(@Body() createOrganizationDto: CreateOrganizationDto, @CurrentUser() user: AuthenticatedUser) {
        return this.organizationsService.create(createOrganizationDto,user.id);
    }

    @Get()
    async findMine(@CurrentUser() user: AuthenticatedUser) {
        return this.organizationsService.findByUserId(user.id);
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.organizationsService.findById(id);
    }
}