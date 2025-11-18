'use client';

import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, MapPin, Tag, Users, Clock } from 'lucide-react';
import { Event } from '@/types';

interface EventCardProps {
  event: Event;
  featured?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, featured = false }) => {
  const getCategoryColor = (category: string) => {
    const colors = {
      academic: 'bg-blue-100 text-blue-800',
      sports: 'bg-green-100 text-green-800',
      cultural: 'bg-purple-100 text-purple-800',
      social: 'bg-pink-100 text-pink-800',
      conference: 'bg-orange-100 text-orange-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getLowestPrice = () => {
    if (!event.ticketTypes || event.ticketTypes.length === 0) return 0;
    return Math.min(...event.ticketTypes.map(type => type.price));
  };

  const totalCapacity = event.ticketTypes?.reduce((sum, type) => sum + type.quantity, 0) || event.capacity;
  const availableTickets = event.ticketTypes?.reduce((sum, type) => sum + type.available, 0) || 0;

  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden ${featured ? 'ring-2 ring-orange-500' : ''}`}>
      {featured && (
        <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-semibold px-3 py-1 text-center">
          Featured Event
        </div>
      )}

      {event.images && event.images.length > 0 && (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={event.images[0]}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          <div className="absolute top-2 left-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
              {event.category}
            </span>
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {event.title}
          </h3>
          {event.isFeatured && (
            <div className="flex-shrink-0 ml-2">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.005 1.347-1.24.588-1.81l-2.8-2.034a1 1 0 01-.364-1.118L9.049 2.927z" />
              </svg>
            </div>
          )}
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {event.description}
        </p>

        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-2 text-orange-500" />
            <span>{format(new Date(event.date), 'MMM d, yyyy')}</span>
            {event.endDate && (
              <span> - {format(new Date(event.endDate), 'MMM d, yyyy')}</span>
            )}
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-2 text-teal-500" />
            <span className="line-clamp-1">{event.venue}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-500">
              <Users className="h-4 w-4 mr-2 text-purple-500" />
              <span>{availableTickets} of {totalCapacity} available</span>
            </div>
            <div className="flex items-center text-gray-500">
              <Clock className="h-4 w-4 mr-2 text-blue-500" />
              <span>Ends {format(new Date(event.date), 'MMM d')}</span>
            </div>
          </div>

          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {event.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </span>
              ))}
              {event.tags.length > 3 && (
                <span className="text-xs text-gray-500">+{event.tags.length - 3} more</span>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Starting from</p>
              <p className="text-xl font-bold text-orange-600">
                KES {getLowestPrice() === 0 ? 'FREE' : getLowestPrice()}
              </p>
            </div>
            <Link
              href={`/events/${event._id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              View Details
            </Link>
          </div>
        </div>

        <div className="mt-3 flex items-center text-xs text-gray-500">
          <div className="w-6 h-6 rounded-full bg-gray-200 mr-2">
            {event.organizer.profilePic ? (
              <img
                src={event.organizer.profilePic}
                alt={event.organizer.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full flex items-center justify-center bg-orange-100 text-orange-600 text-xs font-bold">
                {event.organizer.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <span>by {event.organizer.name}</span>
        </div>
      </div>
    </div>
  );
};

export default EventCard;