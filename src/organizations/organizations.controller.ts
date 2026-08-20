import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@ApiTags('Organizations')
@Controller('organizations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @ApiOperation({
    summary: 'Crea una organización y añade al usuario actual como OWNER',
  })
  @ApiResponse({
    status: 201,
    description: 'Organización creada correctamente',
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido' })
  async create(
    @Body() createOrganizationDto: CreateOrganizationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.organizationsService.create(createOrganizationDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Lista las organizaciones del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Organizaciones del usuario' })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido' })
  async findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.organizationsService.findByUserId(user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary:
      'Obtiene una organización por su id (solo miembros de la organización)',
  })
  @ApiParam({ name: 'id', description: 'Id de la organización' })
  @ApiResponse({ status: 200, description: 'Datos de la organización' })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido' })
  @ApiResponse({
    status: 403,
    description: 'No eres miembro de la organización',
  })
  @ApiResponse({ status: 404, description: 'Organización no encontrada' })
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.organizationsService.findById(id, user.id);
  }
}
