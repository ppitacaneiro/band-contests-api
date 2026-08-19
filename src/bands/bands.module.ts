import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { BandsController } from './bands.controller';
import { BandMembersController } from './band-members.controller';
import { BandsService } from './bands.service';
import { BandMembersService } from './band-members.service';
import { BandsRepository } from './bands.repository';

@Module({
  imports: [UsersModule],
  controllers: [BandsController, BandMembersController],
  providers: [BandsService, BandMembersService, BandsRepository],
  exports: [BandsService, BandsRepository],
})
export class BandsModule {}
