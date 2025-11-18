'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import QRCode from 'react-qr-code';
import { Download, ExternalLink, Calendar, MapPin, Share2, RefreshCw } from 'lucide-react';
import { ticketsAPI } from '@/lib/api';
import { Ticket as TicketType } from '@/types';
import { format } from 'date-fns';

const TicketDetailPage: React.FC = () => {
  const params = useParams();
  const [ticket, setTicket] = useState<TicketType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const ticketId = params.id as string;

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  const loadTicket = async () => {
    try {
      // Note: This would need an API endpoint to get single ticket details
      // For now, we'll simulate with ticketsAPI
      const response = await ticketsAPI.getUserTickets('current-user-id');
      if (response.success && response.tickets) {
        const foundTicket = response.tickets.find(t => t._id === ticketId);
        if (foundTicket) {
          setTicket(foundTicket);
        }
      }
    } catch (error) {
      console.error('Failed to load ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshTicket = async () => {
    setRefreshing(true);
    try {
      await loadTicket();
    } finally {
      setRefreshing(false);
    }
  };

  const shareTicket = () => {
    if (navigator.share && ticket) {
      navigator.share({
        title: `Ticket for ${ticket.event.title}`,
        text: `My ticket for ${ticket.event.title} on ${format(new Date(ticket.event.date), 'PPP')}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const downloadTicket = () => {
    if (!ticket) return;

    // Generate ticket data
    const ticketData = `
╔════════════════════════════════════════════════════════════╗
║                    RUTICK EVENT TICKET                    ║
║                                                            ║
║  Event: ${ticket.event.title}                             ║
║  Date: ${format(new Date(ticket.event.date), 'PPP')}                ║
║  Venue: ${ticket.event.venue}                               ║
║  Type: ${ticket.type.toUpperCase()}                                ║
║  Price: KES ${ticket.price}                                    ║
║  QR Code: ${ticket.qrCode}                                  ║
║  Status: ${ticket.status.toUpperCase()}                             ║
║  Purchase: ${format(new Date(ticket.purchaseDate), 'PPP')}            ║
║                                                            ║
╚══════════════════════════════════════════════════════════╝
    `;

    const blob = new Blob([ticketData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RUTICK-Ticket-${ticket._id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ticket Not Found</h1>
          <p className="text-gray-600">The ticket you're looking for doesn't exist.</p>
          <a href="/tickets" className="text-orange-600 hover:text-orange-700 underline">
            Back to My Tickets
          </a>
        </div>
      </div>
    );
  }

  const isTicketActive = ticket.status === 'purchased';
  const isEventPast = new Date(ticket.event.date) < new Date();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Ticket Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ticket Details</h1>
              <p className="text-sm text-gray-600">Manage your event ticket</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={refreshTicket}
                disabled={refreshing}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
                title="Refresh ticket"
              >
                <RefreshCw className={`h-5 w-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={shareTicket}
                className="p-2 rounded-full hover:bg-gray-100"
                title="Share ticket"
              >
                <Share2 className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ticket Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Event Title</label>
                  <p className="text-gray-900 font-semibold">{ticket.event.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Date & Time</label>
                  <p className="text-gray-900">{format(new Date(ticket.event.date), 'EEEE, MMMM d, yyyy \'at\' h:mm a')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Venue</label>
                  <p className="text-gray-900">{ticket.event.venue}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <p className="text-gray-900 capitalize">{ticket.event.category}</p>
                </div>
              </div>
            </div>

            {/* Ticket Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Ticket Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Ticket Type</label>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 capitalize">
                    {ticket.type}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Price</label>
                  <p className="text-2xl font-bold text-orange-600">
                    KES {ticket.price === 0 ? 'FREE' : ticket.price}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Purchase Date</label>
                  <p className="text-gray-900">{format(new Date(ticket.purchaseDate), 'PPP')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    ticket.status === 'purchased' ? 'bg-green-100 text-green-800' :
                    ticket.status === 'used' ? 'bg-gray-100 text-gray-800' :
                    ticket.status === 'refunded' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {ticket.status.toUpperCase()}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">QR Code</label>
                  <p className="font-mono text-lg text-gray-900">{ticket.qrCode}</p>
                </div>
                {ticket.specialInstructions && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Special Instructions</label>
                    <p className="text-gray-900">{ticket.specialInstructions}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => setShowQR(!showQR)}
                  disabled={!isTicketActive || isEventPast}
                  className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <QRCode className="h-5 w-5 mr-2" />
                  {showQR ? 'Hide QR Code' : 'Show QR Code'}
                </button>

                <button
                  onClick={downloadTicket}
                  className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download Ticket
                </button>

                <a
                  href={`/events/${ticket.event._id}`}
                  target="_blank"
                  className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  View Event Details
                </a>

                {isTicketActive && !isEventPast && (
                  <button
                    className="w-full flex items-center justify-center px-6 py-3 campus-btn text-white rounded-md"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Add to Calendar
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* QR Code Display */}
          {showQR && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">QR Code for Check-in</h2>
                <div className="text-center">
                  <div className="inline-block p-4 bg-white border-4 border-gray-300 rounded-lg">
                    <QRCode
                      value={JSON.stringify({
                        ticketId: ticket._id,
                        qrCode: ticket.qrCode,
                        eventTitle: ticket.event.title,
                        eventDate: ticket.event.date,
                        venue: ticket.event.venue,
                        ticketType: ticket.type,
                        status: ticket.status
                      })}
                      size={256}
                      level="M"
                      renderAs="svg"
                      className="w-full"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    Show this QR code at the event entrance for digital check-in.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    QR Code: {ticket.qrCode}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;