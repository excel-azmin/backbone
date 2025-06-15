import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { Connection, Model, PipelineStage } from 'mongoose';
import { CreateNotificationDto } from 'src/common/dto';
import { UpdateNotificationDto } from 'src/common/dto/update-notifications.dto';
import { Notification } from 'src/common/entity/notification.entity';

@Injectable()
export class ExpoNotificationService {
  private expo: Expo;

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    @InjectConnection() private readonly connection: Connection,
  ) {
    this.expo = new Expo();
  }

  /**
   * Send an Expo push notification and store it in the database
   */
  async send(createNotificationDto: CreateNotificationDto) {
    const isPushEnabled = await this.isPushEnabled();
    if (!isPushEnabled) {
      return {
        status: false,
        failReason: 'Push notifications are disabled in settings.',
      };
    }
    const { pushTokens, title, message, data } = createNotificationDto;
    const messages: ExpoPushMessage[] = [];
    for (const pushToken of pushTokens) {
      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Invalid Expo push token: ${pushToken}`);
        continue;
      }
      messages.push({
        to: pushToken,
        sound: 'default',
        title,
        body: message,
        data,
      });
    }
    let pushNotificationResult;
    try {
      const chunks = this.expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        pushNotificationResult =
          await this.expo.sendPushNotificationsAsync(chunk);
      }
    } catch (error) {
      console.error('Error sending Expo push notification:', error);
      pushNotificationResult = { status: false, failReason: error.message };
    }

    const newNotification = new this.notificationModel({
      ...createNotificationDto,
      pushNotificationResult,
    });

    return newNotification.save();
  }

  async update(
    id: string,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<any> {
    const { ...updateData } = updateNotificationDto;
    const updatedNotification = await this.notificationModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, upsert: false },
    );
    return updatedNotification ? updatedNotification : [];
  }

  /**
   * Mark all notifications as read
   */
  async markAsReadAllNotification(id: string): Promise<any> {
    const updatedNotification = await this.notificationModel.updateMany(
      {
        receiversId: id,
        isRead: false,
      },
      {
        isRead: true,
      },
    );
    return updatedNotification
      ? await this.findPUSHNotificationsBySender(id)
      : [];
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    order: string = 'desc',
    search: string = '',
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    const query: any = {};
    if (search) {
      query.$text = { $search: search };
    }
    if (startDate && endDate) {
      query.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    }
    const skip = (page - 1) * limit;
    const sortOptions = {};
    if (order === 'asc') {
      sortOptions['createdAt'] = 1;
    } else if (order === 'desc') {
      sortOptions['createdAt'] = -1;
    }
    const totalCount = await this.notificationModel
      .countDocuments(query)
      .exec();
    const totalPages = Math.ceil(totalCount / limit);
    const result = await this.notificationModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort(sortOptions)
      .exec();
    const nextPage = page < totalPages ? page + 1 : null;
    const previousPage = page > 1 ? page - 1 : null;
    return result
      ? {
          data: result,
          totalCount,
          totalPages,
          currentPage: page,
          nextPage,
          previousPage,
        }
      : [];
  }

  /**
   * Find a single notification by ID
   */
  async findPUSHNotificationsBySender(id: string): Promise<any> {
    const aggQuery: PipelineStage[] = [
      { $unwind: { path: '$receiversId' } },
      { $match: { receiversId: id } },
      { $sort: { createdAt: -1 } },
      { $limit: 15 },
      {
        $lookup: {
          from: 'users',
          localField: 'senderId',
          foreignField: 'id',
          as: 'sender',
        },
      },
      { $unwind: { path: '$sender', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          senderAvatar: { $ifNull: ['$sender.avatar', null] },
          senderFullName: { $ifNull: ['$sender.fullName', null] },
        },
      },
      {
        $project: {
          senderAvatar: 1,
          senderFullName: 1,
          fullName: 1,
          pushTokens: 1,
          senderId: 1,
          receiversId: 1,
          topic: 1,
          title: 1,
          message: 1,
          data: 1,
          email: 1,
          notificationType: 1,
          pushNotificationResult: 1,
          isRead: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ];

    const notifications = await this.notificationModel
      .aggregate(aggQuery)
      .exec();
    return notifications ? notifications : [];
  }

  /**
   * Delete a notification by ID
   */
  async remove(id: string): Promise<{ message: string }> {
    const result = await this.notificationModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Notification with ID ${id} not found.`);
    }
    return result
      ? { message: `Notification with ID ${id} has been deleted successfully.` }
      : { message: `Notification data not found for ID ${id}.` };
  }

  findPUSHNotificationsByReceiver(ids: string[]): any {
    return this.notificationModel
      .find({
        receiversId: { $in: ids },
        notificationType: { $nin: ['EMAIL'] },
      })
      .exec();
  }

  private async isPushEnabled() {
    const collection = this.connection.collection('settings');
    if (collection) {
      return await collection
        .findOne({})
        .then((settings) => settings?.isMailEnabled);
    }
    return false;
  }
}
