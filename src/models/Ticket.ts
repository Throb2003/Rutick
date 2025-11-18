import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ITicket extends Document {
  event: mongoose.Types.ObjectId;
  buyer: mongoose.Types.ObjectId;
  type: 'free' | 'vip' | 'general' | 'student';
  price: number;
  qrCode: string;
  status: 'purchased' | 'used' | 'refunded' | 'expired';
  purchaseDate: Date;
  usedDate?: Date;
  checkedInBy?: mongoose.Types.ObjectId;
  transactionId: mongoose.Types.ObjectId;
  seatNumber?: string;
  specialInstructions?: string;
}

const TicketSchema: Schema = new Schema({
  event: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event is required'],
    index: true
  },
  buyer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Buyer is required'],
    index: true
  },
  type: {
    type: String,
    required: [true, 'Ticket type is required'],
    enum: {
      values: ['free', 'vip', 'general', 'student'],
      message: 'Ticket type must be one of: free, vip, general, student'
    }
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  qrCode: {
    type: String,
    required: [true, 'QR code is required'],
    unique: true,
    default: () => uuidv4()
  },
  status: {
    type: String,
    enum: {
      values: ['purchased', 'used', 'refunded', 'expired'],
      message: 'Status must be one of: purchased, used, refunded, expired'
    },
    default: 'purchased'
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  usedDate: {
    type: Date,
    default: null
  },
  checkedInBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  transactionId: {
    type: Schema.Types.ObjectId,
    ref: 'Transaction',
    required: [true, 'Transaction ID is required'],
    index: true
  },
  seatNumber: {
    type: String,
    trim: true,
    maxlength: [20, 'Seat number cannot exceed 20 characters']
  },
  specialInstructions: {
    type: String,
    trim: true,
    maxlength: [500, 'Special instructions cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

TicketSchema.index({ qrCode: 1 });
TicketSchema.index({ status: 1 });
TicketSchema.index({ buyer: 1, event: 1 });

export default mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);