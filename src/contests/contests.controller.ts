import { Controller, Get, Param, UseGuards } from '@nestjs/common';
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
import { ContestsService } from './contests.service';

@ApiTags('Contests')
@Controller('contests')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContestsController {
  constructor(private readonly contestsService: ContestsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un concurso por su id' })
  @ApiParam({ name: 'id', description: 'Id del concurso' })
  @ApiResponse({ status: 200, description: 'Datos del concurso' })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido' })
  @ApiResponse({ status: 404, description: 'Concurso no encontrado' })
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contestsService.findById(id, user.id);
  }
}
