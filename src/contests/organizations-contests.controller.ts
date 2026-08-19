import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { ContestsService } from './contests.service';
import { CreateContestDto } from './dto/create-contest.dto';

@Controller('organizations/:organizationId/contests')
@UseGuards(JwtAuthGuard)
export class OrganizationsContestsController {
  constructor(private readonly contestsService: ContestsService) {}

  @Post()
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
