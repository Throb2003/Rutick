'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Ticket, Bell, Clock, ChevronRight, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardAPI } from '@/lib/api';
import { Ticket as TicketType, Event } from '@/types';
import { format, isAfter, isBefore } from 'date-fns';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboard();
    }
  }, [user]);

  const loadDashboard = async () => {
    try {
      const response = await dashboardAPI.getStudentDashboard(user._id);
      if (response.success) {
        setDashboardData(response.dashboard);
      }
    } catch (error) {
      console.error('Failed to load student dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-600">Failed to load dashboard data.</p>
        </div>
      </div>
    );
  }

  const { user: stats, upcomingEvents, pastEvents, recentTickets, notifications } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTickets}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Ticket className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Used Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{stats.usedTickets}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Purchased</p>
              <p className="text-2xl font-bold text-gray-900">{stats.purchasedTickets}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unread Notifications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.unreadNotifications}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Bell className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
          <Link
            href="/events?date=upcoming"
            className="text-orange-600 hover:text-orange-700 font-medium text-sm"
          >
            View All
          </Link>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="space-y-4">
            {upcomingEvents.map((ticket: TicketType) => (
              <div key={ticket._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">{ticket.event.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(ticket.event.date), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {format(new Date(ticket.event.date), 'h:mm a')}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {ticket.event.venue}
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        ticket.status === 'purchased' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {ticket.status.toUpperCase()}
                      </span>
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {ticket.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Link
                      href={`/events/${ticket.event._id}`}
                      className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">
              <Calendar className="h-16 w-16 mx-auto" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Events</h4>
            <p className="text-gray-600">You haven't purchased any tickets for upcoming events.</p>
            <Link
              href="/events"
              className="inline-flex items-center px-6 py-3 campus-btn text-white rounded-full"
            >
              Browse Events
            </Link>
          </div>
        )}
      </div>

      {/* Recent Tickets */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Tickets</h3>
          <Link
            href="/tickets"
            className="text-orange-600 hover:text-orange-700 font-medium text-sm"
          >
            View All
          </Link>
        </div>

        {recentTickets.length > 0 ? (
          <div className="space-y-4">
            {recentTickets.map((ticket: TicketType) => (
              <div key={ticket._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">{ticket.event.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(ticket.event.date), 'MMM d, yyyy')}
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        ticket.status === 'purchased' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {ticket.status.toUpperCase()}
                      </span>
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {ticket.type.toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-2">
                      <p className="font-semibold text-gray-900">
                        KES {ticket.price === 0 ? 'FREE' : ticket.price}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href={`/tickets/${ticket._id}/qr`}
                      className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      QR
                    </Link>
                    <Link
                      href={`/events/${ticket.event._id}`}
                      className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">
              <Ticket className="h-16 w-16 mx-auto" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Recent Tickets</h4>
            <p className="text-gray-600">You haven't purchased any tickets yet.</p>
            <Link
              href="/events"
              className="inline-flex items-center px-6 py-3 campus-btn text-white rounded-full"
            >
              Browse Events
            </Link>
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <Link
            href="/notifications"
            className="text-orange-600 hover:text-orange-700 font-medium text-sm"
          >
            View All
          </Link>
        </div>

        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.slice(0, 5).map((notification) => (
              <div
                key={notification._id}
                className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                  !notification.isRead ? 'bg-orange-50 border-orange-200' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${
                        !notification.isRead ? 'bg-orange-500' : 'bg-gray-400'
                      }`}></div>
                      <span className="font-semibold text-gray-900">{notification.title}</span>
                      <span className="text-xs text-gray-600">
                        {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{notification.message}</p>
                  </div>
                  {notification.event && (
                    <Link
                      href={`/events/${notification.event._id}`}
                      className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                    >
                      View Event
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">
              <Bell className="h-16 w-16 mx-auto" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Notifications</h4>
            <p className="text-gray-600">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;