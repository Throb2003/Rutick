'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import StaffDashboard from '@/components/dashboard/StaffDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import { Calendar, Users, Settings, BarChart3 } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'student':
        return <StudentDashboard />;
      case 'staff':
        return <StaffDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <StudentDashboard />; // Fallback
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {user.role === 'student' && <Users className="h-5 w-5 text-orange-500" />}
                {user.role === 'staff' && <Calendar className="h-5 w-5 text-blue-500" />}
                {user.role === 'admin' && <BarChart3 className="h-5 w-5 text-purple-500" />}
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
                </h1>
              </div>
              <div className="text-sm text-gray-500">
                Welcome back, {user.name}!
              </div>
            </div>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Settings className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderDashboard()}
      </div>
    </div>
  );
};

export default DashboardPage;