'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Calendar, MapPin, Image as ImageIcon, Plus, X, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { eventsAPI } from '@/lib/api';
import { Event, TicketType } from '@/types';
import toast from 'react-hot-toast';

interface EventFormData {
  title: string;
  description: string;
  category: 'academic' | 'sports' | 'cultural' | 'social' | 'conference';
  date: string;
  endDate?: string;
  venue: string;
  capacity: number;
  ticketTypes: TicketType[];
  tags: string[];
  requiresApproval: boolean;
}

interface EventFormProps {
  initialData?: Partial<Event>;
  eventId?: string;
}

const EventForm: React.FC<EventFormProps> = ({ initialData, eventId }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([{ type: 'general', price: 500, quantity: 100 }]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<EventFormData>({
      defaultValues: initialData ? {
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category || 'academic',
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
        venue: initialData.venue || '',
        capacity: initialData.capacity || 100,
        ticketTypes: initialData.ticketTypes?.length ? initialData.ticketTypes : ticketTypes,
        tags: initialData.tags || [],
        requiresApproval: initialData.requiresApproval || false
      } : {}
    });

  useEffect(() => {
    if (initialData) {
      setImages(initialData.images || []);
      setTicketTypes(initialData.ticketTypes || ticketTypes);
    }
  }, [initialData]);

  const addTicketType = () => {
    const newTicketType: TicketType = {
      type: 'general',
      price: 500,
      quantity: 100
    };
    setTicketTypes([...ticketTypes, newTicketType]);
  };

  const removeTicketType = (index: number) => {
    const newTicketTypes = ticketTypes.filter((_, i) => i !== index);
    setTicketTypes(newTicketTypes);
  };

  const updateTicketType = (index: number, field: keyof TicketType, value: any) => {
    const newTicketTypes = [...ticketTypes];
    newTicketTypes[index] = {
      ...newTicketTypes[index],
      [field]: value
    };
    setTicketTypes(newTicketTypes);
  };

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          setImages([...images, dataUrl]);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const onSubmit = async (data: EventFormData) => {
    setLoading(true);
    try {
      const eventData = {
        ...data,
        images,
        ticketTypes,
        date: new Date(data.date).toISOString(),
        ...(data.endDate && { endDate: new Date(data.endDate).toISOString() })
      };

      let response;
      if (eventId) {
        response = await eventsAPI.updateEvent(eventId, eventData);
      } else {
        response = await eventsAPI.createEvent(eventData);
      }

      if (response.success) {
        toast.success(eventId ? 'Event updated successfully!' : 'Event created successfully!');
        if (!eventId) {
          router.push('/events');
        } else {
          router.push(`/events/${eventId}`);
        }
      } else {
        throw new Error(response.error || 'Failed to save event');
      }
    } catch (error: any) {
      console.error('Event form error:', error);
      toast.error(error.response?.data?.error || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to create events.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {eventId ? 'Edit Event' : 'Create New Event'}
          </h1>
          <p className="text-lg text-gray-600">
            {eventId ? 'Update event details' : 'Fill in the information below to create a new event'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  {...register('title', {
                    required: 'Event title is required',
                    minLength: { value: 5, message: 'Title must be at least 5 characters' }
                  })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter event title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select a category</option>
                  <option value="academic">Academic</option>
                  <option value="sports">Sports</option>
                  <option value="cultural">Cultural</option>
                  <option value="social">Social</option>
                  <option value="conference">Conference</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  {...register('description', {
                    required: 'Description is required',
                    minLength: { value: 10, message: 'Description must be at least 10 characters' },
                    maxLength: { value: 5000, message: 'Description cannot exceed 5000 characters' }
                  })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Describe your event..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Date *
                </label>
                <input
                  {...register('date', {
                    required: 'Event date is required',
                    valueAsDate: true
                  })}
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date (Optional)
                </label>
                <input
                  {...register('endDate', {
                    valueAsDate: true
                  })}
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue *
                </label>
                <input
                  {...register('venue', {
                    required: 'Venue is required',
                    maxLength: { value: 200, message: 'Venue cannot exceed 200 characters' }
                  })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter event venue"
                />
                {errors.venue && (
                  <p className="mt-1 text-sm text-red-600">{errors.venue.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity *
                </label>
                <input
                  {...register('capacity', {
                    required: 'Capacity is required',
                    min: { value: 1, message: 'Capacity must be at least 1' },
                    valueAsNumber: true
                  })}
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter capacity"
                />
                {errors.capacity && (
                  <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Event Images */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Images</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Event image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div className="border-2 border-dashed border-gray-300 rounded-lg">
                <button
                  type="button"
                  onClick={addImage}
                  className="w-full h-32 flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ImageIcon className="h-8 w-8 mb-2" />
                  <span className="text-sm">Add Image</span>
                  <p className="text-xs text-gray-500">Click to upload</p>
                </button>
              </div>
            </div>
          </div>

          {/* Ticket Types */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ticket Types</h2>

            <div className="space-y-4">
              {ticketTypes.map((ticketType, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type
                      </label>
                      <select
                        value={ticketType.type}
                        onChange={(e) => updateTicketType(index, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="free">Free</option>
                        <option value="general">General</option>
                        <option value="vip">VIP</option>
                        <option value="student">Student</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price (KES)
                      </label>
                      <input
                        type="number"
                        value={ticketType.price}
                        onChange={(e) => updateTicketType(index, 'price', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={ticketType.quantity}
                        onChange={(e) => updateTicketType(index, 'quantity', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                        min="1"
                      />
                    </div>

                    <div className="flex items-end">
                      {ticketTypes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTicketType(index)}
                          className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addTicketType}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Ticket Type
              </button>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  {...register('tags')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  placeholder="academic, sports, cultural, social"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    {...register('requiresApproval')}
                    type="checkbox"
                    className="h-4 w-4 text-orange-600 rounded focus:ring-orange-500 focus:border-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Requires Approval
                  </span>
                </label>
                <p className="text-xs text-gray-500">
                  Enable this if events need approval before publishing
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {eventId ? 'Updating Event...' : 'Creating Event...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {eventId ? 'Update Event' : 'Create Event'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;