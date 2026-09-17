import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import type { Period } from '../period';

export const PERIODS = ['all', 'year', 'month', 'week', 'day'] as const;

/** Which time window the dashboard stats cover. */
export class DashboardQueryDto {
  @ApiPropertyOptional({ enum: PERIODS, default: 'month' })
  @IsOptional()
  @IsIn(PERIODS)
  period: Period = 'month';
}
