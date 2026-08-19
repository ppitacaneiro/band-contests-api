import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
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
import { CreateContestDto } from './dto/create-contest.dto';

@ApiTags('Contests')
@Controller('organizations/:organizationId/contests')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrganizationsContestsController {
  constructor(private readonly contestsService: ContestsService) {}

  @Post()
  @ApiOperation({ summary: 'Crea un concurso dentro de una organización' })
  @ApiParam({ name: 'organizationId', description: 'Id de la organización' })
  @ApiResponse({ status: 201, description: 'Concurso creado correctamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido' })
  async create(
    @Param('organizationId') organizationId: string,
    @Body() createContestDto: CreateContestDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contestsService.create(
      organizationId,
      createContestDto,
      user.id,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Lista los concursos de una organización' })
  @ApiParam({ name: 'organizationId', description: 'Id de la organización' })
  @ApiResponse({ status: 200, description: 'Concursos de la organización' })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido' })
  async findMany(
    @Param('organizationId') organizationId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contestsService.findManyByOrganizationId(
      organizationId,
      user.id,
    );
  }
}
