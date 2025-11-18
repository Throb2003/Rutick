import mongoose, { Document, Schema } from 'mongoose';

export interface ITicketType {
  type: 'free' | 'vip' | 'general' | 'student';
  price: number;
  quantity: number;
  available: number;
}

export interface IEvent extends Document {
  title: string;
  description: string;
  category: 'academic' | 'sports' | 'cultural' | 'social' | 'conference';
  date: Date;
  endDate?: Date;
  venue: string;
  capacity: number;
  ticketTypes: ITicketType[];
  organizer: mongoose.Types.ObjectId;
  images: string[];
  videos: string[];
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  tags: string[];
  isFeatured: boolean;
  requiresApproval: boolean;
  publishedAt?: Date;
}

const TicketTypeSchema: Schema = new Schema({
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
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  available: {
    type: Number,
    default: function(this: ITicketType) {
      return this.quantity;
    },
    min: [0, 'Available tickets cannot be negative']
  }
});

const EventSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['academic', 'sports', 'cultural', 'social', 'conference'],
      message: 'Category must be one of: academic, sports, cultural, social, conference'
    }
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
    validate: {
      validator: function(this: IEvent, value: Date) {
        return value > new Date();
      },
      message: 'Event date must be in the future'
    }
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(this: IEvent, value: Date) {
        return !value || value > this.date;
      },
      message: 'End date must be after start date'
    }
  },
  venue: {
    type: String,
    required: [true, 'Venue is required'],
    trim: true,
    maxlength: [200, 'Venue cannot exceed 200 characters']
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  ticketTypes: [TicketTypeSchema],
  organizer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Organizer is required']
  },
  images: [{
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v) || /^\/uploads\/.*/.test(v);
      },
      message: 'Image must be a valid URL or file path'
    }
  }],
  videos: [{
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Video must be a valid URL'
    }
  }],
  status: {
    type: String,
    enum: {
      values: ['draft', 'published', 'cancelled', 'completed'],
      message: 'Status must be one of: draft, published, cancelled, completed'
    },
    default: 'draft'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  isFeatured: {
    type: Boolean,
    default: false
  },
  requiresApproval: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

EventSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

EventSchema.index({ title: 'text', description: 'text' });
EventSchema.index({ category: 1 });
EventSchema.index({ date: 1 });
EventSchema.index({ status: 1 });
EventSchema.index({ organizer: 1 });
EventSchema.index({ isFeatured: 1 });
EventSchema.index({ tags: 1 });

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);