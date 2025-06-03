import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationDto {
  @ApiPropertyOptional({
    example: true,
    description: 'Update the read status of the notification',
  })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
