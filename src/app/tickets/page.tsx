'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ticketsAPI } from '@/lib/api';
import { Ticket as TicketType } from '@/types';
import TicketCard from '@/components/tickets/TicketCard';
import { Search, Filter, Calendar, ChevronDown, Download } from 'lucide-react';

const TicketsPage: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    date: '',
    page: 1,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  useEffect(() => {
    if (user) {
      loadTickets();
    }
  }, [user, filters]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const response = await ticketsAPI.getUserTickets(user._id, {
        status: filters.status || undefined,
        upcoming: filters.date === 'upcoming' ? true : undefined,
        page: filters.page,
        limit: filters.limit,
      });

      if (response.success && response.tickets) {
        setTickets(response.tickets);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const loadMore = () => {
    if (pagination.hasNext) {
      setFilters(prev => ({
        ...prev,
        page: prev.page + 1,
      }));
    }
  };

  const loadPrev = () => {
    if (pagination.hasPrev) {
      setFilters(prev => ({
        ...prev,
        page: prev.page - 1,
      }));
    }
  };

  const downloadAllTickets = () => {
    // Generate CSV data
    const csvData = tickets.map(ticket => [
      ticket.event?.title || '',
      ticket.event?.date ? new Date(ticket.event.date).toLocaleDateString() : '',
      ticket.type.toUpperCase(),
      ticket.price.toString(),
      ticket.status.toUpperCase(),
      ticket.qrCode,
      new Date(ticket.purchaseDate).toLocaleDateString(),
    ].join(','));

    const headers = ['Event Title', 'Event Date', 'Ticket Type', 'Price', 'Status', 'QR Code', 'Purchase Date'].join(',');
    const csvContent = [headers, csvData].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickets-${user.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Please log in to view your tickets</p>
          <a
            href="/login"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Tickets</h1>
          <p className="text-lg text-gray-600">Manage and view your purchased event tickets</p>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 appearance-none"
              >
                <option value="">All Status</option>
                <option value="purchased">Purchased</option>
                <option value="used">Used</option>
                <option value="refunded">Refunded</option>
                <option value="expired">Expired</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            </div>

            {/* Date Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 appearance-none"
              >
                <option value="">All Dates</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={downloadAllTickets}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600 mb-4">
          {pagination.total > 0 ? (
            <span>Showing {tickets.length} of {pagination.total} tickets</span>
          ) : (
            <span>No tickets found</span>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-white rounded-lg shadow-md h-64">
                  <div className="h-32 bg-gray-200 rounded-t-lg"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Tickets Grid */
          tickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tickets.map((ticket) => (
                <TicketCard
                  key={ticket._id}
                  ticket={ticket}
                  showActions={true}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <div className="text-gray-400 text-6xl mb-4">
                <Calendar className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Tickets Found</h3>
              <p className="text-lg text-gray-600 mb-6">
                You haven't purchased any tickets yet.{' '}
                <a href="/events" className="text-orange-600 hover:text-orange-700 font-medium">
                  Browse Events
                </a>
                {' '}to get started!
              </p>
              <a
                href="/events"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
              >
                Browse Events
              </a>
            </div>
          )}
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={loadPrev}
              disabled={!pagination.hasPrev}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <button
              onClick={loadMore}
              disabled={!pagination.hasNext}
              className="flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketsPage;