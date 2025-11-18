'use client';

import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { Calendar, MapPin, Download, QrCode, ExternalLink } from 'lucide-react';
import { Ticket as TicketType } from '@/types';
import { format } from 'date-fns';

interface TicketCardProps {
  ticket: TicketType;
  showActions?: boolean;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, showActions = true }) => {
  const [showQR, setShowQR] = useState(false);

  const getStatusColor = (status: string) => {
    const colors = {
      purchased: 'bg-green-100 text-green-800',
      used: 'bg-gray-100 text-gray-800',
      refunded: 'bg-red-100 text-red-800',
      expired: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts = {
      purchased: 'Active',
      used: 'Used',
      refunded: 'Refunded',
      expired: 'Expired',
    };
    return texts[status as keyof typeof texts] || status;
  };

  const isTicketActive = ticket.status === 'purchased';
  const isEventPast = new Date(ticket.event.date) < new Date();

  const downloadTicket = () => {
    // Generate a simple text version for download
    const ticketData = `
      RUTICK EVENT TICKET
      =====================
      Event: ${ticket.event.title}
      Date: ${format(new Date(ticket.event.date), 'PPP')}
      Venue: ${ticket.event.venue}
      Ticket Type: ${ticket.type.toUpperCase()}
      Price: KES ${ticket.price}
      QR Code: ${ticket.qrCode}
      Status: ${getStatusText(ticket.status)}
      =====================
    `;

    const blob = new Blob([ticketData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-${ticket._id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
              {getStatusText(ticket.status)}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 capitalize">
              {ticket.type}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowQR(!showQR)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Show QR Code"
            >
              <QrCode className="h-5 w-5 text-gray-600" />
            </button>
            {showActions && (
              <button
                onClick={downloadTicket}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Download Ticket"
              >
                <Download className="h-5 w-5 text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Event Info */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {ticket.event.title}
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-orange-500" />
              <span>{format(new Date(ticket.event.date), 'EEEE, MMMM d, yyyy \'at\' h:mm a')}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-teal-500" />
              <span>{ticket.event.venue}</span>
            </div>
          </div>
        </div>

        {/* Ticket Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Ticket Type</p>
            <p className="font-semibold text-gray-900 capitalize">{ticket.type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Price</p>
            <p className="font-semibold text-gray-900">
              KES {ticket.price === 0 ? 'FREE' : ticket.price}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Purchase Date</p>
            <p className="font-semibold text-gray-900">
              {format(new Date(ticket.purchaseDate), 'MMM d, yyyy')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">QR Code</p>
            <p className="font-mono text-xs text-gray-600">{ticket.qrCode}</p>
          </div>
        </div>

        {/* Special Instructions */}
        {ticket.specialInstructions && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-1">Special Instructions</p>
            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{ticket.specialInstructions}</p>
          </div>
        )}

        {/* QR Code Section */}
        {showQR && (
          <div className="border-t pt-4">
            <div className="flex flex-col items-center">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">QR Code for Check-in</h4>
              <div className="bg-white p-4 border-2 border-gray-300 rounded-lg">
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
              <p className="text-sm text-gray-600 mt-4 text-center">
                Show this QR code at the event entrance for digital check-in
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && isTicketActive && !isEventPast && (
          <div className="flex space-x-3 pt-4 border-t">
            <button className="flex-1 campus-btn text-center">
              View Event Details
            </button>
            <a
              href={`/tickets/${ticket._id}/transfer`}
              className="flex-1 text-center px-4 py-2 border border-orange-500 text-orange-600 rounded-md hover:bg-orange-50 transition-colors"
            >
              Transfer Ticket
            </a>
          </div>
        )}

        {/* Event Past Notice */}
        {isEventPast && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <p className="text-sm text-gray-600">
              This event has taken place. Thank you for attending!
            </p>
          </div>
        )}

        {/* Refunded Notice */}
        {ticket.status === 'refunded' && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">
              This ticket has been refunded. Refund details have been sent to your email.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketCard;