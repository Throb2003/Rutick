'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, MapPin, Clock, Users, Ticket, Share2, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { eventsAPI } from '@/lib/api';
import { Event } from '@/types';
import { format } from 'date-fns';

const EventDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicketType, setSelectedTicketType] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  const eventId = params.id as string;

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const response = await eventsAPI.getEvent(eventId);
      if (response.success && response.event) {
        setEvent(response.event);
      }
    } catch (error) {
      console.error('Failed to load event:', error);
      router.push('/events');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = () => {
    if (!selectedTicketType) {
      return;
    }

    // Navigate to purchase page
    router.push(`/checkout?eventId=${eventId}&ticketType=${selectedTicketType}&quantity=${quantity}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  const getAvailableTickets = () => {
    if (!event?.ticketTypes) return 0;
    return event.ticketTypes.reduce((sum, type) => sum + type.available, 0);
  };

  const getTotalCapacity = () => {
    if (!event?.ticketTypes) return 0;
    return event.ticketTypes.reduce((sum, type) => sum + type.quantity, 0);
  };

  const getLowestPrice = () => {
    if (!event?.ticketTypes || event.ticketTypes.length === 0) return 0;
    return Math.min(...event.ticketTypes.map(type => type.price));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h1>
          <p className="text-gray-600">The event you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const availableTickets = getAvailableTickets();
  const totalCapacity = getTotalCapacity();
  const isSoldOut = availableTickets === 0;
  const isEventPast = new Date(event.date) < new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Event Header Image */}
      <div className="relative h-96 bg-gradient-to-r from-orange-600 to-pink-600">
        {event.images && event.images.length > 0 && (
          <img
            src={event.images[0]}
            alt={event.title}
            className="w-full h-full object-cover opacity-80"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
              {event.title}
            </h1>
            <div className="flex items-center justify-center space-x-4 text-sm">
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {format(new Date(event.date), 'MMM d, yyyy')}
              </span>
              <span className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                {event.venue}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Event Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Event Information</h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-3 text-orange-500" />
                  <div>
                    <p className="font-medium text-gray-900">Date & Time</p>
                    <p>{format(new Date(event.date), 'EEEE, MMMM d, yyyy \'at\' h:mm a')}</p>
                    {event.endDate && (
                      <p>to {format(new Date(event.endDate), 'EEEE, MMMM d, yyyy \'at\' h:mm a')}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-3 text-teal-500" />
                  <div>
                    <p className="font-medium text-gray-900">Venue</p>
                    <p>{event.venue}</p>
                  </div>
                </div>

                <div className="flex items-center text-gray-600">
                  <Users className="h-5 w-5 mr-3 text-purple-500" />
                  <div>
                    <p className="font-medium text-gray-900">Availability</p>
                    <p>{availableTickets} of {totalCapacity} tickets available</p>
                  </div>
                </div>

                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-3 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-900">Category</p>
                    <p className="capitalize">{event.category}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Select Tickets</h3>

              {isSoldOut || isEventPast ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-6xl mb-4">
                    <Ticket className="h-16 w-16 mx-auto" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {isSoldOut ? 'Sold Out' : 'Event Ended'}
                  </h4>
                  <p className="text-gray-600">
                    {isSoldOut
                      ? 'All tickets for this event have been sold out.'
                      : 'This event has already taken place.'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {event.ticketTypes.map((ticketType) => (
                    <div
                      key={ticketType.type}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedTicketType === ticketType.type
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedTicketType(ticketType.type)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 capitalize">{ticketType.type}</h4>
                          <p className="text-2xl font-bold text-orange-600">
                            KES {ticketType.price === 0 ? 'FREE' : ticketType.price}
                          </p>
                          <p className="text-sm text-gray-600">
                            {ticketType.available} of {ticketType.quantity} available
                          </p>
                        </div>
                        <div className="text-right">
                          <input
                            type="radio"
                            name="ticketType"
                            checked={selectedTicketType === ticketType.type}
                            onChange={() => setSelectedTicketType(ticketType.type)}
                            className="h-4 w-4 text-orange-600"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {selectedTicketType && (
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quantity
                          </label>
                          <select
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value))}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                          >
                            {[...Array(Math.min(10, getAvailableTickets() + 1))].map((_, i) => (
                              <option key={i + 1} value={i + 1}>
                                {i + 1}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={handlePurchase}
                          className="campus-btn px-8 py-3 text-lg"
                        >
                          Buy Tickets
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organizer */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Organizer</h3>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  {event.organizer.profilePic ? (
                    <img
                      src={event.organizer.profilePic}
                      alt={event.organizer.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full flex items-center justify-center bg-orange-100 text-orange-600 text-sm font-bold">
                      {event.organizer.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{event.organizer.name}</p>
                  <p className="text-sm text-gray-600 capitalize">{event.organizer.role}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Event
                </button>
                <button
                  onClick={toggleLike}
                  className={`w-full flex items-center justify-center px-4 py-2 border rounded-md ${
                    isLiked
                      ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                  {isLiked ? 'Liked' : 'Like'}
                </button>
              </div>
            </div>

            {/* Event Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Event Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Capacity:</span>
                  <span className="font-medium text-gray-900">{totalCapacity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available:</span>
                  <span className="font-medium text-green-600">{availableTickets}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Starting Price:</span>
                  <span className="font-medium text-orange-600">
                    KES {getLowestPrice() === 0 ? 'FREE' : getLowestPrice()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;