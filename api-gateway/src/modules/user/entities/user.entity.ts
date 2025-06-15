import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true, versionKey: false, collection: 'users' })
export class UserEntity {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: false })
  lastName: string;

  fullName: string;

  @Prop({ required: true, unique: true })
  email: string;

  username: string;

  @Prop({ required: true, select: false })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(UserEntity);

UserSchema.pre('save', function (next) {
  this.username = this.email.split('@')[0];
  this.fullName = `${this.firstName} ${this.lastName || ''}`.trim();
  next();
});
