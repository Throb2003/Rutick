import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  event?: mongoose.Types.ObjectId;
  ticket?: mongoose.Types.ObjectId;
  type: 'event_reminder' | 'ticket_confirmation' | 'event_update' | 'payment_confirmation';
  title: string;
  message: string;
  channels: ('email' | 'sms' | 'in_app')[];
  isRead: boolean;
  sentAt?: Date;
}

const NotificationSchema: Schema = new Schema({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required'],
    index: true
  },
  event: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    default: null,
    index: true
  },
  ticket: {
    type: Schema.Types.ObjectId,
    ref: 'Ticket',
    default: null,
    index: true
  },
  type: {
    type: String,
    required: [true, 'Notification type is required'],
    enum: {
      values: ['event_reminder', 'ticket_confirmation', 'event_update', 'payment_confirmation'],
      message: 'Type must be one of: event_reminder, ticket_confirmation, event_update, payment_confirmation'
    }
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  channels: [{
    type: String,
    enum: {
      values: ['email', 'sms', 'in_app'],
      message: 'Channel must be one of: email, sms, in_app'
    }
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  sentAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ createdAt: -1 });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);