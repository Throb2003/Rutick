'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Calendar,
  TrendingUp,
  DollarSign,
  Settings,
  Download,
  Activity,
  AlertCircle,
  BarChart3,
  PieChart,
  UserCheck,
  Server,
  Database
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardAPI } from '@/lib/api';
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
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  useEffect(() => {
    if (user) {
      loadDashboard();
    }
  }, [user, selectedTimeRange]);

  const loadDashboard = async () => {
    try {
      const response = await dashboardAPI.getAdminDashboard();
      if (response.success) {
        setDashboardData(response.dashboard);
      }
    } catch (error) {
      console.error('Failed to load admin dashboard:', error);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ))}
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

  const { overview, usersByRole, recentActivity, analytics } = dashboardData;

  const COLORS = ['#FF6B35', '#6B5B95', '#008080', '#4169E1', '#10B981', '#F59E0B'];

  return (
    <div className="space-y-6">
      {/* Platform Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Platform Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold">{overview.totalUsers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-orange-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Events</p>
                <p className="text-3xl font-bold">{overview.totalEvents.toLocaleString()}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold">KES {overview.totalRevenue?.toLocaleString() || 0}</p>
              </div>
              <DollarSign className="h-8 w-8 text-teal-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Active Tickets</p>
                <p className="text-3xl font-bold">{overview.totalTickets.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-200" />
            </div>
          </div>
        </div>
      </div>

      {/* User Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Analytics</h3>
          <div className="space-y-4">
            {usersByRole && usersByRole.map((role: any) => (
              <div key={role._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    role._id === 'admin' ? 'bg-red-500' :
                    role._id === 'staff' ? 'bg-blue-500' : 'bg-green-500'
                  }`}></div>
                  <span className="font-medium text-gray-900 capitalize">{role._id}s</span>
                  <span className="text-gray-600">({role.count})</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{role.count}</div>
                  <div className="text-sm text-gray-600">
                    {((role.count / (overview.totalUsers || 1)) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              {['24h', '7d', '30d', '90d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedTimeRange(range)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    selectedTimeRange === range
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={analytics?.revenueTrend?.slice(-30) || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#FF6B35"
                fill="#FF6B35"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <Link href="/activity" className="text-orange-600 hover:text-orange-700 text-sm font-medium">
            View All Activity
          </Link>
        </div>
        <div className="space-y-3">
          {recentActivity?.slice(0, 5).map((activity: any, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                activity.type === 'user_registered' ? 'bg-green-100' :
                activity.type === 'event_created' ? 'bg-blue-100' :
                activity.type === 'ticket_purchased' ? 'bg-orange-100' : 'bg-gray-100'
              }`}>
                {activity.type === 'user_registered' && <Users className="h-5 w-5 text-green-600" />}
                {activity.type === 'event_created' && <Calendar className="h-5 w-5 text-blue-600" />}
                {activity.type === 'ticket_purchased' && <BarChart3 className="h-5 w-5 text-orange-600" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{activity.description}</p>
                <p className="text-sm text-gray-600">{activity.user}</p>
              </div>
              <div className="text-sm text-gray-600">
                {new Date(activity.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          href="/users"
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900">User Management</h4>
          </div>
          <p className="text-sm text-gray-600">Manage user accounts and permissions</p>
        </Link>

        <Link
          href="/events/admin"
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Event Management</h4>
          </div>
          <p className="text-sm text-gray-600">Review and approve events</p>
        </Link>

        <Link
          href="/transactions"
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Transaction History</h4>
          </div>
          <p className="text-sm text-gray-600">View payment transactions</p>
        </Link>

        <Link
          href="/settings"
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Settings className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900">System Settings</h4>
          </div>
          <p className="text-sm text-gray-600">Configure platform settings</p>
        </Link>

        <Link
          href="/reports"
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center group-hover:bg-teal-200 transition-colors">
              <Download className="h-6 w-6 text-teal-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Reports & Analytics</h4>
          </div>
          <p className="text-sm text-gray-600">Download detailed reports</p>
        </Link>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Server className="h-5 w-5 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Server Status</h4>
          </div>
          <div className="text-2xl font-bold text-green-600">Healthy</div>
          <div className="text-sm text-gray-600">All systems operational</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Database className="h-5 w-5 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Database</h4>
          </div>
          <div className="text-2xl font-bold text-blue-600">Connected</div>
          <div className="text-sm text-gray-600">MongoDB Atlas: 99.9% uptime</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Activity className="h-5 w-5 text-orange-600" />
            </div>
            <h4 className="font-semibold text-gray-900">API Usage</h4>
          </div>
          <div className="text-2xl font-bold text-orange-600">2.3k/hr</div>
          <div className="text-sm text-gray-600">12.5% increase this week</div>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
            2 Active
          </span>
        </div>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-1" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">High event creation volume</p>
              <p className="text-sm text-gray-600">Event creation increased by 300% in the last 24 hours</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <UserCheck className="h-5 w-5 text-blue-600 mt-1" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">New user registration spike</p>
              <p className="text-sm text-gray-600">150 new registrations in the last 48 hours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;