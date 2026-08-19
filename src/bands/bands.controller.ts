import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { BandsService } from './bands.service';
import { CreateBandDto } from './dto/create-band.dto';
import { UpdateBandDto } from './dto/update-band.dto';

@ApiTags('Bands')
@Controller('bands')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BandsController {
  constructor(private readonly bandsService: BandsService) {}

  @Post()
  @ApiOperation({
    summary: 'Crea una banda y añade al usuario actual como OWNER',
  })
  @ApiResponse({ status: 201, description: 'Banda creada correctamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido' })
  async create(
    @Body() createBandDto: CreateBandDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bandsService.create(createBandDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Lista las bandas del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Bandas del usuario' })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido' })
  async findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.bandsService.findByUserId(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene una banda por su id' })
  @ApiParam({ name: 'id', description: 'Id de la banda' })
  @ApiResponse({ status: 200, description: 'Datos de la banda' })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido' })
  @ApiResponse({ status: 404, description: 'Banda no encontrada' })
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bandsService.findById(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualiza una banda (solo OWNER)' })
  @ApiParam({ name: 'id', description: 'Id de la banda' })
  @ApiResponse({ status: 200, description: 'Banda actualizada correctamente' })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Banda no encontrada' })
  async update(
    @Param('id') id: string,
    @Body() updateBandDto: UpdateBandDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bandsService.update(id, updateBandDto, user.id);
  }
}
