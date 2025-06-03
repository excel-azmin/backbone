import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateNotificationDto } from './create-notifications.dto';


export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {
  @ApiPropertyOptional({ example: true, description: 'Update the read status of the notification' })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
