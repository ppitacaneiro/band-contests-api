import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { BandRole } from '../../../generated/prisma/client';

export class AddBandMemberDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsEnum(BandRole)
  role?: BandRole;
}
