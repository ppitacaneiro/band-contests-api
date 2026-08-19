import { Module } from '@nestjs/common';
import { OrganizationsModule } from '../organizations/organizations.module';
import { ContestsController } from './contests.controller';
import { OrganizationsContestsController } from './organizations-contests.controller';
import { ContestsService } from './contests.service';
import { ContestsRepository } from './contests.repository';

@Module({
  imports: [OrganizationsModule],
  controllers: [ContestsController, OrganizationsContestsController],
  providers: [ContestsService, ContestsRepository],
})
export class ContestsModule {}
