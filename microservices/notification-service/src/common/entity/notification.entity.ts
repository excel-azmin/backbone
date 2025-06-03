import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export class NotificationResult {
  status: boolean;
  failReason?: string;
  response?: any;
}

export enum NotificationType {
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
  BOTH = 'BOTH',
}

@Schema({ timestamps: true, versionKey: false })
export class Notification extends Document {
  @Prop({ type: Types.ObjectId, ref: 'users', index: true })
  senderId: Types.ObjectId;

  @Prop({ type: String })
  fullName: string;
  
  @Prop({ type: Array })
  pushTokens: string[];

  @Prop({ type: Array})
  receiversId: string[];

  @Prop({ type: String })
  topic: string;

  @Prop({ type: String })
  title: string;

  @Prop({ type: String })
  message: string;

  @Prop({type: Object})
  data: any;

  @Prop({ type: [String] })
  email: string[];

  @Prop({ type: String, enum: NotificationType })
  notificationType: NotificationType;

  @Prop({ type: Object })
  pushNotificationResult: NotificationResult;

  @Prop({ type: Object })
  emailNotificationResult: NotificationResult;

  @Prop({ type: Boolean, default: false })
  isRead: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
