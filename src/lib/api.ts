import axios from 'axios';
import { User, Event, Ticket, Transaction, AuthResponse, ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
    universityId?: string;
    phone?: string;
    department?: string;
  }): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getCurrentUser: async (): Promise<{ user: User; success: boolean }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  forgotPassword: async (email: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },
};

// Events API
export const eventsAPI = {
  getEvents: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    date?: string;
    featured?: boolean;
  }) => {
    const response = await api.get('/events', { params });
    return response.data;
  },

  getEvent: async (id: string): Promise<{ event: Event; success: boolean }> => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  createEvent: async (eventData: Partial<Event>): Promise<{ event: Event; success: boolean }> => {
    const response = await api.post('/events', eventData);
    return response.data;
  },

  updateEvent: async (id: string, eventData: Partial<Event>): Promise<{ event: Event; success: boolean }> => {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  },

  deleteEvent: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  publishEvent: async (id: string): Promise<{ event: Event; success: boolean }> => {
    const response = await api.post(`/events/${id}/publish`);
    return response.data;
  },

  getFeaturedEvents: async (limit: number = 5) => {
    const response = await api.get('/events/featured', { params: { limit } });
    return response.data;
  },
};

// Tickets API
export const ticketsAPI = {
  buyTickets: async (ticketData: {
    eventId: string;
    ticketType: string;
    quantity: number;
  }) => {
    const response = await api.post('/tickets/buy', ticketData);
    return response.data;
  },

  getUserTickets: async (
    userId: string,
    params?: {
      page?: number;
      limit?: number;
      status?: string;
      upcoming?: boolean;
    }
  ) => {
    const response = await api.get(`/tickets/user/${userId}`, { params });
    return response.data;
  },

  getEventTickets: async (eventId: string) => {
    const response = await api.get(`/tickets/event/${eventId}`);
    return response.data;
  },

  checkInTicket: async (ticketId: string, qrCode: string) => {
    const response = await api.post(`/tickets/${ticketId}/checkin`, { qrCode });
    return response.data;
  },

  getTicketQR: async (ticketId: string) => {
    const response = await api.get(`/tickets/${ticketId}/qr`);
    return response.data;
  },

  refundTicket: async (ticketId: string) => {
    const response = await api.post(`/tickets/${ticketId}/refund`);
    return response.data;
  },
};

// Payments API
export const paymentsAPI = {
  initiatePayment: async (paymentData: {
    ticketIds: string[];
    paymentMethod: 'mpesa' | 'card' | 'cash';
    phoneNumber?: string;
  }) => {
    const response = await api.post('/payments/initiate', paymentData);
    return response.data;
  },

  getTransaction: async (transactionId: string) => {
    const response = await api.get(`/payments/transaction/${transactionId}`);
    return response.data;
  },

  processMpesaCallback: async (callbackData: any) => {
    const response = await api.post('/payments/callback/mpesa', callbackData);
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getStudentDashboard: async (userId: string) => {
    const response = await api.get(`/dashboard/student/${userId}`);
    return response.data;
  },

  getStaffDashboard: async (userId: string) => {
    const response = await api.get(`/dashboard/staff/${userId}`);
    return response.data;
  },

  getAdminDashboard: async () => {
    const response = await api.get('/dashboard/admin');
    return response.data;
  },

  getEventAnalytics: async (eventId: string) => {
    const response = await api.get(`/analytics/events/${eventId}`);
    return response.data;
  },

  getPlatformAnalytics: async () => {
    const response = await api.get('/analytics/platform');
    return response.data;
  },
};

export default api;