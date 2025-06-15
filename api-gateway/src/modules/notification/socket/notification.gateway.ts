// import { JsonWebTokenService } from '@/lib/jsonweb-token/jsonwebtoken.service';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateNotificationDto } from '../dto/create-notificaion.dto';
import { UpdateNotificationDto } from '../dto/update-notificaion.dto';
import { NotificationService } from '../service/notificaion.service';

@WebSocketGateway({
  namespace: '/socket/notifications',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization'],
    credentials: true,
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(
    private readonly notificationService: NotificationService,
    // private readonly jwtService: JsonWebTokenService,
  ) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    try {
      const token = client.handshake.headers.authorization
        ? client.handshake.headers.authorization.split(' ')[1]
        : null;
      const web_token = client.handshake.query.web_token
        ? client.handshake.query.web_token.toString()
        : null;
      if (!token && !web_token) {
        client.emit('error', {
          message: 'Unauthorized: Please log in to access this resource.',
        });
        client.disconnect();
        return;
      }

      let user = client.handshake.query.user;
      // if (token) {
      //   user = await this.jwtService.verifyLoginToken(token);
      // } else if (web_token) {
      //   user = await this.jwtService.verifyLoginToken(web_token);
      // }

      if (!user) {
        client.emit('error', {
          message: 'Unauthorized: Invalid or expired token.',
        });
        client.disconnect();
        return;
      }

      const userId = client.handshake.query.userId as string;
      if (!userId) {
        client.disconnect();
        return;
      }

      const notifications =
        await this.notificationService.getNotificationById(userId);
      const notificationObject: Record<string, any> = {};
      notificationObject[userId] = notifications;
      client.emit('notifications', notificationObject);
    } catch (error) {
      client.emit('error', { message: 'Unauthorized: Access denied.' });
      client.disconnect();
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    client.disconnect();
  }

  @SubscribeMessage('send-notification')
  async sendNotification(
    @MessageBody() createNotificationDto: CreateNotificationDto,
  ) {
    return await this.createAndSendNotification(createNotificationDto);
  }

  @SubscribeMessage('mark-as-read')
  async markAsRead(
    @MessageBody()
    data: {
      notificationId: string;
      userId: string;
      updateNotificationDto: UpdateNotificationDto;
    },
  ) {
    try {
      const { notificationId, userId, updateNotificationDto } = data;
      await this.notificationService
        .updateExpoNotification(notificationId, updateNotificationDto)
        .then(async () => {
          const notification =
            await this.notificationService.getNotificationById(userId);
          const notifications: Record<string, any> = {};
          notifications[userId] = notification;
          this.server.emit('notifications', notifications);
        });

      return {
        success: true,
        notifications: {
          [userId]: await this.notificationService.getNotificationById(userId),
        },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('mark-as-read-all')
  async markAsReadAll(@MessageBody() userId: string) {
    try {
      const notification =
        await this.notificationService.markAsReadAllNotification(userId);
      const notifications: Record<string, any> = {};
      notifications[userId] = notification;
      this.server.emit('notifications', notifications);
      return {
        [userId]: await this.notificationService.getNotificationById(userId),
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('notifications')
  async getNotificationById(@MessageBody() userId: string) {
    try {
      const notifications: Record<string, any> = {};
      const notification =
        await this.notificationService.getNotificationById(userId);
      notifications[userId] = notification;
      return notifications;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createAndSendNotification(
    createNotificationDto: CreateNotificationDto,
  ) {
    try {
      await this.notificationService.sendNotification(createNotificationDto);
      const notification: Record<string, any> = {};
      for (const receiverId of createNotificationDto.receiversId) {
        notification[receiverId] =
          await this.notificationService.getNotificationById(receiverId);
      }

      this.server.emit('notifications', notification);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
