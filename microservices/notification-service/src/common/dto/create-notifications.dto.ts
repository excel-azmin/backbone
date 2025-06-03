import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { NotificationResult, NotificationType } from '../entity/notification.entity';


export class CreateNotificationDto {
  @ApiPropertyOptional({ type: String, example: '60f7c0d5d8d1234567890abc', description: 'Sender user ID' })
  @IsOptional()
  senderId?: Types.ObjectId;

  @ApiProperty({ type: [String], example: ['ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]'], description: 'Array of Expo push tokens' })
  @IsArray()
  pushTokens: string[];

  @ApiProperty({ type: [String], example: ['[xxxxxxxxxxxxxxxxxxxxxx]'], description: 'Array of Expo push tokens' })
  @IsArray()
  receiversId: string[];

  @ApiPropertyOptional({ example: 'Promotions', description: 'Topic/category of the notification' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: 'Promotions', description: 'Topic/category of the notification' })
  @IsOptional()
  @IsString()
  topic?: string;

  @ApiProperty({ example: 'New Offer!', description: 'Notification title' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Get 50% off on your next purchase.', description: 'Notification message content' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ type: Object, example: { orderId: '12345' }, description: 'Additional data for the notification' })
  @IsOptional()
  @IsObject()
  data?: any;

  @ApiPropertyOptional({ example: 'user@example.com', description: 'Email address if the notification is an email' })
  @IsOptional()
  @IsString()
  email?: string[];

  @ApiProperty({ enum: NotificationType, example: NotificationType.PUSH, description: 'Type of notification (PUSH or EMAIL)' })
  @IsEnum(NotificationType)
  notificationType: NotificationType;

  @ApiPropertyOptional({
    type: Object,
    example: { status: true, response: { id: 'xyz123' } },
    description: 'Result of the push notification delivery',
  })
  @IsOptional()
  @IsObject()
  pushNotificationResult?: NotificationResult;

  @ApiPropertyOptional({
    type: Object,
    example: { status: false, failReason: 'Invalid email address' },
    description: 'Result of the email notification delivery',
  })
  @IsOptional()
  @IsObject()
  emailNotificationResult?: NotificationResult;

  @ApiPropertyOptional({ example: false, description: 'Indicates if the notification has been read by the recipient' })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @ApiPropertyOptional({ example: 'team-notify', description: 'Mail notification template name' })
  @IsOptional()
  @IsString()
  mailTemplate?: string = 'default';
}
