import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { ContestsService } from './contests.service';

@Controller('contests')
@UseGuards(JwtAuthGuard)
export class ContestsController {
  constructor(private readonly contestsService: ContestsService) {}

  @Get(':id')
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contestsService.findById(id, user.id);
  }
}
