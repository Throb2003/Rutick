export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'staff' | 'admin';
  universityId?: string;
  profilePic?: string;
  phone?: string;
  department?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  category: 'academic' | 'sports' | 'cultural' | 'social' | 'conference';
  date: Date;
  endDate?: Date;
  venue: string;
  capacity: number;
  ticketTypes: TicketType[];
  organizer: User;
  images: string[];
  videos: string[];
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  tags: string[];
  isFeatured: boolean;
  requiresApproval: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketType {
  type: 'free' | 'vip' | 'general' | 'student';
  price: number;
  quantity: number;
  available: number;
}

export interface Ticket {
  _id: string;
  event: Event;
  buyer: User;
  type: 'free' | 'vip' | 'general' | 'student';
  price: number;
  qrCode: string;
  status: 'purchased' | 'used' | 'refunded' | 'expired';
  purchaseDate: Date;
  usedDate?: Date;
  checkedInBy?: User;
  transactionId: Transaction;
  seatNumber?: string;
  specialInstructions?: string;
}

export interface Transaction {
  _id: string;
  ticket: Ticket;
  buyer: User;
  amount: number;
  paymentMethod: 'mpesa' | 'card' | 'cash';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  mpesaTransactionId?: string;
  paymentDate?: Date;
  refundDate?: Date;
  refundAmount?: number;
  createdAt: Date;
}

export interface Notification {
  _id: string;
  recipient: User;
  event?: Event;
  ticket?: Ticket;
  type: 'event_reminder' | 'ticket_confirmation' | 'event_update' | 'payment_confirmation';
  title: string;
  message: string;
  channels: ('email' | 'sms' | 'in_app')[];
  isRead: boolean;
  sentAt?: Date;
  createdAt: Date;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
  refreshToken?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface EventListResponse extends ApiResponse {
  events: Event[];
  pagination: Pagination;
}

export interface TicketListResponse extends ApiResponse {
  tickets: Ticket[];
  pagination: Pagination;
}