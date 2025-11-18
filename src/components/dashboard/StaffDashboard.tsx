'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Users, TrendingUp, DollarSign, Plus, Eye, Download, MapPin, Clock, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardAPI } from '@/lib/api';
import { Event, Ticket } from '@/types';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const StaffDashboard: React.FC = () => {
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
      const response = await dashboardAPI.getStaffDashboard(user._id);
      if (response.success) {
        setDashboardData(response.dashboard);
      }
    } catch (error) {
      console.error('Failed to load staff dashboard:', error);
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
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { stats, myEvents, upcomingEvents, recentActivity, attendeeList } = dashboardData || {};

  const COLORS = ['#FF6B35', '#6B5B95', '#008080', '#4169E1'];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEvents || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">KES {stats.totalSales || 0}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tickets Sold</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTicketsSold || 0}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Overview</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={recentActivity?.slice(0, 7).map((activity, index) => ({
              name: format(new Date(activity.purchaseDate), 'MMM dd'),
              sales: activity.amount
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#FF6B35" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Categories</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Academic', value: 35, fill: '#FF6B35' },
                  { name: 'Sports', value: 25, fill: '#6B5B95' },
                  { name: 'Cultural', value: 20, fill: '#008080' },
                  { name: 'Social', value: 20, fill: '#4169E1' }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {Object.values(['#FF6B35', '#6B5B95', '#008080', '#4169E1']).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* My Events */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">My Events</h3>
          <Link
            href="/events/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Link>
        </div>

        {myEvents && myEvents.length > 0 ? (
          <div className="space-y-4">
            {myEvents.map((event: Event) => (
              <div key={event._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">{event.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(event.date), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {event.venue}
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        event.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {event.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href={`/events/edit/${event._id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit Event"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/events/manage/${event._id}`}
                      className="p-2 text-orange-600 hover:bg-orange-50 rounded"
                      title="Manage Event"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded" title="Delete Event">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Event Stats */}
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-gray-600">Capacity</p>
                    <p className="font-semibold text-gray-900">{event.capacity}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Available</p>
                    <p className="font-semibold text-green-600">
                      {event.ticketTypes?.reduce((sum, type) => sum + type.available, 0) || 0}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Sold</p>
                    <p className="font-semibold text-orange-600">
                      {event.ticketTypes?.reduce((sum, type) => sum + (type.quantity - type.available), 0) || 0}
                    </p>
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
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Events Created</h4>
            <p className="text-gray-600 mb-4">You haven't created any events yet.</p>
            <Link
              href="/events/create"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Event
            </Link>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <Link href="#" className="text-orange-600 hover:text-orange-700 text-sm font-medium">
            View All
          </Link>
        </div>

        {recentActivity && recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900">{activity.eventTitle}</p>
                    <p className="text-sm text-gray-600">{activity.buyerName} purchased {activity.type}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {format(new Date(activity.purchaseDate), 'MMM d, h:mm a')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">
              <TrendingUp className="h-16 w-16 mx-auto" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h4>
            <p className="text-gray-600">Activity will appear here as people interact with your events.</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          href="/events/create"
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-center group"
        >
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
            <Plus className="h-6 w-6 text-orange-600" />
          </div>
          <h4 className="font-semibold text-gray-900">Create Event</h4>
          <p className="text-sm text-gray-600 mt-2">Start a new university event</p>
        </Link>

        <Link
          href="/tickets/checkin"
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-center group"
        >
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
            <Download className="h-6 w-6 text-blue-600" />
          </div>
          <h4 className="font-semibold text-gray-900">Check-in App</h4>
          <p className="text-sm text-gray-600 mt-2">Scan QR codes for event entry</p>
        </Link>

        <Link
          href="/reports"
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-center group"
        >
          <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
          <h4 className="font-semibold text-gray-900">Reports</h4>
          <p className="text-sm text-gray-600 mt-2">View detailed analytics</p>
        </Link>

        <Link
          href="/profile"
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-center group"
        >
          <div className="mx-auto w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-teal-200 transition-colors">
            <Users className="h-6 w-6 text-teal-600" />
          </div>
          <h4 className="font-semibold text-gray-900">Profile Settings</h4>
          <p className="text-sm text-gray-600 mt-2">Manage your account</p>
        </Link>
      </div>
    </div>
  );
};

export default StaffDashboard;