import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  ticket: mongoose.Types.ObjectId;
  buyer: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod: 'mpesa' | 'card' | 'cash';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  mpesaTransactionId?: string;
  paymentDate?: Date;
  refundDate?: Date;
  refundAmount?: number;
}

const TransactionSchema: Schema = new Schema({
  ticket: {
    type: Schema.Types.ObjectId,
    ref: 'Ticket',
    required: [true, 'Ticket is required'],
    index: true
  },
  buyer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Buyer is required'],
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: {
      values: ['mpesa', 'card', 'cash'],
      message: 'Payment method must be one of: mpesa, card, cash'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'completed', 'failed', 'refunded'],
      message: 'Status must be one of: pending, completed, failed, refunded'
    },
    default: 'pending'
  },
  mpesaTransactionId: {
    type: String,
    trim: true,
    sparse: true,
    unique: true
  },
  paymentDate: {
    type: Date,
    default: null
  },
  refundDate: {
    type: Date,
    default: null
  },
  refundAmount: {
    type: Number,
    min: [0, 'Refund amount cannot be negative'],
    default: null
  }
}, {
  timestamps: true
});

TransactionSchema.index({ status: 1 });
TransactionSchema.index({ paymentMethod: 1 });
TransactionSchema.index({ mpesaTransactionId: 1 });

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);