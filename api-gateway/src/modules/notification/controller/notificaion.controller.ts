import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationValidationPipe } from 'src/common/lib/pipe/notification-validation.pipe';
import { MailPaginationQuery } from '../decorator/mail-pagination.query';
import { CreateNotificationDto } from '../dto/create-notificaion.dto';
import { UpdateNotificationDto } from '../dto/update-notificaion.dto';
import { NotificationService } from '../service/notificaion.service';

@ApiTags('Notification')
@Controller('v1/notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  async sendNotification(
    @Body(new NotificationValidationPipe())
    createNotificationDto: CreateNotificationDto,
  ) {
    return await this.notificationService.sendNotification(
      createNotificationDto,
    );
  }

  @Patch(':id')
  async updateExpoNotification(
    @Param('id') id: string,
    @Body() updateExpoNotification: UpdateNotificationDto,
  ) {
    return await this.notificationService.updateExpoNotification(
      id,
      updateExpoNotification,
    );
  }

  @Get('mark-as-read-all')
  async markAsReadAllNotification(@Req() req: any) {
    return await this.notificationService.markAsReadAllNotification(
      req.user.id,
    );
  }

  @Get('list')
  @MailPaginationQuery()
  async getNotification(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('order') order: string = 'desc',
    @Query('search') search: string = '',
    @Query('startDate') startDate: Date = null,
    @Query('endDate') endDate: Date = null,
  ) {
    return await this.notificationService.getNotification(
      page,
      limit,
      order,
      search,
      startDate,
      endDate,
    );
  }

  @Get()
  async getNotificationById(@Req() req: any) {
    return await this.notificationService.getNotificationById(req.user.id);
  }
}
