import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { BandMembersService } from './band-members.service';
import { AddBandMemberDto } from './dto/add-band-member.dto';

@ApiTags('Bands')
@Controller('bands/:bandId/members')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BandMembersController {
  constructor(private readonly bandMembersService: BandMembersService) {}

  @Get()
  @ApiOperation({ summary: 'Lista los miembros de una banda' })
  @ApiParam({ name: 'bandId', description: 'Id de la banda' })
  @ApiResponse({ status: 200, description: 'Miembros de la banda' })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido' })
  @ApiResponse({ status: 403, description: 'No eres miembro de la banda' })
  @ApiResponse({ status: 404, description: 'Banda no encontrada' })
  async findMembers(
    @Param('bandId') bandId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bandMembersService.findMembers(bandId, user.id);
  }

  @Post()
  @ApiOperation({
    summary: 'Añade un miembro a una banda (solo OWNER/MANAGER)',
  })
  @ApiParam({ name: 'bandId', description: 'Id de la banda' })
  @ApiResponse({ status: 201, description: 'Miembro añadido correctamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Banda o usuario no encontrado' })
  @ApiResponse({ status: 409, description: 'El usuario ya es miembro' })
  async addMember(
    @Param('bandId') bandId: string,
    @Body() addBandMemberDto: AddBandMemberDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bandMembersService.addMember(bandId, addBandMemberDto, user.id);
  }

  @Delete(':userId')
  @ApiOperation({
    summary: 'Elimina un miembro de una banda (solo OWNER/MANAGER)',
  })
  @ApiParam({ name: 'bandId', description: 'Id de la banda' })
  @ApiParam({ name: 'userId', description: 'Id del usuario a eliminar' })
  @ApiResponse({ status: 200, description: 'Miembro eliminado correctamente' })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar el último OWNER',
  })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Banda o miembro no encontrado' })
  async removeMember(
    @Param('bandId') bandId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bandMembersService.removeMember(bandId, userId, user.id);
  }
}
