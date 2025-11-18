import EventList from '@/components/events/EventList';

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            All Events
          </h1>
          <p className="text-lg text-gray-600">
            Discover academic, sports, cultural, and social events at Riara University
          </p>
        </div>
        <EventList />
      </div>
    </div>
  );
}