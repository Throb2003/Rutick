'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Users, TrendingUp, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { eventsAPI } from '@/lib/api';
import { Event } from '@/types';
import EventList from '@/components/events/EventList';
import { format } from 'date-fns';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomePage();
  }, []);

  const loadHomePage = async () => {
    try {
      // Load featured events
      const featuredResponse = await eventsAPI.getEvents({ featured: true, limit: 6 });
      if (featuredResponse.success && featuredResponse.events) {
        setFeaturedEvents(featuredResponse.events);
      }

      // Load upcoming events
      const upcomingResponse = await eventsAPI.getEvents({
        date: 'upcoming',
        limit: 6
      });
      if (upcomingResponse.success && upcomingResponse.events) {
        setUpcomingEvents(upcomingResponse.events);
      }
    } catch (error) {
      console.error('Failed to load home page:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-slide-up">
              Discover Events at Riara University
            </h1>
            <p className="text-xl md:text-2xl mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Academic • Sports • Cultural • Social Activities
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
              {!user && (
                <>
                  <Link
                    href="/register"
                    className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-white text-orange-600 hover:bg-gray-100 transition-colors"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/events"
                    className="inline-flex items-center px-8 py-3 border border-white text-base font-medium rounded-full text-white hover:bg-white hover:text-orange-600 transition-colors"
                  >
                    Browse Events
                  </Link>
                </>
              )}
              {user && (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-white text-orange-600 hover:bg-gray-100 transition-colors"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose RUTICK?
            </h2>
            <p className="text-lg text-gray-600">
              Your gateway to all university events and activities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 campus-gradient rounded-2xl flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                50+ Events Monthly
              </h3>
              <p className="text-gray-600">
                From academic lectures to sports tournaments
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 campus-gradient rounded-2xl flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                5000+ Active Users
              </h3>
              <p className="text-gray-600">
                Students, staff, and faculty members
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 campus-gradient rounded-2xl flex items-center justify-center mb-4">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                20+ Campus Venues
              </h3>
              <p className="text-gray-600">
                From lecture halls to sports facilities
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 campus-gradient rounded-2xl flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                100% Mobile Ready
              </h3>
              <p className="text-gray-600">
                Access events from any device
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Star className="h-6 w-6 text-yellow-500 mr-2" />
                Featured Events
              </h2>
              <Link
                href="/events?featured=true"
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                View All Featured
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map((event) => {
                const EventCardComponent = require('@/components/events/EventCard').default;
                return (
                  <EventCardComponent
                    key={event._id}
                    event={event}
                    featured={true}
                  />
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Calendar className="h-6 w-6 text-blue-500 mr-2" />
                Upcoming Events
              </h2>
              <Link
                href="/events?date=upcoming"
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                View All Upcoming
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => {
                const EventCardComponent = require('@/components/events/EventCard').default;
                return (
                  <EventCardComponent
                    key={event._id}
                    event={event}
                  />
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Join the Fun?
          </h2>
          <p className="text-xl mb-8">
            Create your account and start discovering events at Riara University
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/events"
              className="inline-flex items-center px-8 py-3 border border-white text-base font-medium rounded-full text-purple-600 bg-white hover:bg-gray-100 transition-colors"
            >
              Browse Events
            </Link>
            {!user && (
              <Link
                href="/register"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-purple-500 hover:bg-purple-700 transition-colors"
              >
                Create Account
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;