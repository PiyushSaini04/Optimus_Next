'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // Use for navigation
import {
  CalendarIcon,
  XCircleIcon,
  SearchIcon,
  ChevronDownIcon,
  MapPinIcon,
  DollarSign,
  UserIcon,
  Loader2, // Added for loading state
  AlertTriangle, // Added for error state
} from 'lucide-react';

// Assuming this path is correct and contains your Supabase client export
import supabase from '@/api/client'; 
import { Button } from '@/components/ui/button'; // Assuming this component exists

// --- 1. TYPE DEFINITIONS ---
// ----------------------------

// Event interface matching your Supabase table structure
interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  start_date: string; // timestamptz from Supabase
  end_date: string;   // timestamptz from Supabase
  location: string;
  organizer_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  registration_link: string | null; // Added based on mock data logic
  max_participants: number | null;
  ticket_price: number | null;
  banner_url: string | null;
  created_by: string | null;
  created_at: string;
  organization_id: string | null;
  status: 'approved' | 'pending' | 'ended' | 'draft'; // Added 'draft' for completeness
}

type PriceFilter = 'Upcoming Events' | 'Free' | 'Paid';
type SortOption = 'Event Date' | 'Recently Added' | 'Title (A-Z)';

interface Filters {
  searchQuery: string;
  priceFilter: PriceFilter;
  sortOption: SortOption;
  eventDateFilter: string;
}


// --- 2. UTILITY FUNCTIONS (Filter/Sort Logic) ---
// --------------------------------------------------

const filterAndSortEvents = (events: Event[], filters: Filters): Event[] => {
  const { searchQuery, priceFilter, sortOption } = filters;
  const now = new Date();

  // 1. Filter by Status and Upcoming
  let filtered = events.filter(e => {
    // Only show 'approved' and 'pending' events
    if (e.status !== 'approved' && e.status !== 'pending') return false;

    const isUpcoming = new Date(e.end_date) >= now;

    if (priceFilter === 'Upcoming Events') {
      return isUpcoming;
    } else if (priceFilter === 'Free') {
      return (e.ticket_price ?? 0) === 0 && isUpcoming;
    } else if (priceFilter === 'Paid') {
      return (e.ticket_price ?? 0) > 0 && isUpcoming;
    }
    return true;
  });

  // 2. Filter by Search Query
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(event =>
      event.title.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query) ||
      event.organizer_name.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query)
    );
  }

  // 3. Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortOption === 'Event Date') {
      // Ascending by Start Date (Nearest first)
      return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
    } else if (sortOption === 'Recently Added') {
      // Descending by Created At (Newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortOption === 'Title (A-Z)') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  return sorted;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  // Check for valid date
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// --- 3. EVENT CARD COMPONENT ---
// (No changes needed, re-using your excellent UI structure)
// ---------------------------------

const EventCard: React.FC<{ event: Event }> = ({ event }) => {

  const router = useRouter(); // <-- This line makes 'router' available here

  const handleDetailsClick = (e: React.MouseEvent, event: Event) => {
      e.stopPropagation(); 
      // ERROR: 'router' is undefined here
      router.push(`/event-page/event-details?id=${event.id}`);
  };

  const isFree = (event.ticket_price ?? 0) === 0;
  const priceDisplay = isFree ? 'Free' : `$${event.ticket_price?.toFixed(2)}`;

  const startDate = formatDate(event.start_date);
  // Only show end date if it's different from the start date
  const endDate = event.start_date !== event.end_date ? ` - ${formatDate(event.end_date)}` : '';

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-700">
      {/* Banner Image Placeholder */}
      <div className="h-40 w-full bg-gray-700 flex items-center justify-center text-gray-500">
        {event.banner_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <CalendarIcon className="w-12 h-12 text-gray-500" />
        )}
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-white leading-tight">{event.title}</h3>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
              event.status === 'approved' ? 'bg-green-500 text-green-900' : 'bg-yellow-500 text-yellow-900'
          }`}>
              {event.status}
          </span>
        </div>

        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{event.description}</p>

        {/* Details List */}
        <div className="space-y-2 text-sm text-gray-300">
          <div className="flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2 text-blue-400" />
            <span className="font-medium">Date:</span> {startDate}{endDate}
          </div>
          <div className="flex items-center">
            <MapPinIcon className="w-5 h-5 mr-2 text-red-400" />
            <span className="font-medium">Location:</span> {event.location}
          </div>
          <div className="flex items-center">
            <UserIcon className="w-5 h-5 mr-2 text-purple-400" />
            <span className="font-medium">Organizer:</span> {event.organizer_name}
          </div>
          <div className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-400" />
            <span className="font-medium">Price:</span> {priceDisplay}
          </div>
        </div>

        {/* CTA Button */}
        <button
            onClick={(e) => handleDetailsClick(e, event)} // Function to navigate to details page
            className={`mt-5 block w-full text-center py-2 rounded-lg font-semibold transition duration-150 bg-blue-600 hover:bg-blue-700 text-white`}
        >
            View Details
        </button>
      </div>
    </div>
  );
};


// --- 4. FILTER BAR COMPONENT ---
// (No changes needed)
// ---------------------------------

interface FilterBarProps {
  filters: Filters;
  onFilterChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
}

const PRICE_OPTIONS: PriceFilter[] = ['Upcoming Events', 'Free', 'Paid'];
const SORT_OPTIONS: SortOption[] = ['Event Date', 'Recently Added', 'Title (A-Z)'];

const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange }) => {
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const handlePriceFilterClick = (filter: PriceFilter) => {
    onFilterChange('priceFilter', filter);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange('searchQuery', e.target.value);
  };

  const handleSortSelect = (option: SortOption) => {
    onFilterChange('sortOption', option);
    setIsSortDropdownOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search events by title, description, organizer, or location..."
          value={filters.searchQuery}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
        />
      </div>

      {/* Filter Buttons and Dropdown */}
      <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
        {/* Price/Upcoming Filter Buttons */}
        {PRICE_OPTIONS.map(option => (
          <button
            key={option}
            onClick={() => handlePriceFilterClick(option)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-150 ${
              filters.priceFilter === option
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {option}
          </button>
        ))}

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
            className="flex items-center px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm font-medium transition duration-150"
          >
            <span className="mr-1">{filters.sortOption}</span>
            <ChevronDownIcon className="w-4 h-4 ml-1" />
          </button>

          {isSortDropdownOpen && (
            <div className="absolute z-10 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
              {SORT_OPTIONS.map(option => (
                <div
                  key={option}
                  onClick={() => handleSortSelect(option)}
                  className={`flex items-center px-4 py-2 cursor-pointer text-sm hover:bg-blue-600 hover:text-white transition ${
                    filters.sortOption === option ? 'bg-blue-500 text-white font-semibold' : 'text-gray-300'
                  }`}
                >
                  {filters.sortOption === option && (
                    <span className="mr-2 text-xl align-middle">✓</span>
                  )}
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// --- 5. MAIN PAGE COMPONENT (Updated for Supabase) ---
// --------------------------------------------------------

export default function EventsPage() {
  const router = useRouter(); // Initialize router for navigation
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<Filters>({
    searchQuery: '',
    priceFilter: 'Upcoming Events',
    sortOption: 'Event Date',
    eventDateFilter: '',
  });

  // Function to fetch data from Supabase
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('events') // Your table name
      .select('*')     // Select all columns
      .limit(100);    // Limit the number of events

    if (error) {
      console.error('Error fetching events:', error);
      setError(error.message);
      setAllEvents([]);
    } else {
      // Cast the fetched data to the Event[] type
      setAllEvents(data as Event[]);
    }
    setLoading(false);
  }, []);

  // Run the fetch function once on component mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);


  // Apply filters and sorting logic using useMemo for performance
  const filteredEvents = useMemo(() => {
    return filterAndSortEvents(allEvents, filters);
  }, [allEvents, filters]);

  const handleFilterChange = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetAllFilters = () => {
    setFilters({
      searchQuery: '',
      priceFilter: 'Upcoming Events',
      sortOption: 'Event Date',
      eventDateFilter: '',
    });
  };

  const eventCount = filteredEvents.length;
  const hasEvents = eventCount > 0;

  // Handle navigation to the create event page
  const handleCreateEventClick = () => {
    // Navigate to the create-event page using Next.js routing
    // Assuming the path is correct based on your import: '@/app/form/create-event/page' -> /form/create-event
    router.push('/form/create-event'); 
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-4xl font-bold">Optimus Events Hub</h1>
        <p className="text-gray-400 mt-2">Discover amazing events and join the community</p>
        <Button 
          className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white" 
          onClick={handleCreateEventClick}
        >
          Create New Event
        </Button>
      </header>
      
      {/* Loading, Error, or Filter Bar */}
      {loading ? (
        <div className="text-center py-10 flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-400">Loading events...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 flex flex-col items-center bg-red-900/20 border border-red-800 rounded-lg p-6">
          <AlertTriangle className="w-8 h-8 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-red-400 mb-2">Error Fetching Data</h2>
          <p className="text-red-300 max-w-lg">
            A network error occurred or the Supabase connection failed: {error}
          </p>
        </div>
      ) : (
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      )}

      {/* Results Count */}
      {!loading && !error && (
        <div className="mt-8 flex justify-between items-center text-gray-400">
          <p className="text-lg font-medium">{eventCount} events found</p>
        </div>
      )}

      <hr className="border-gray-700 my-4" />

      {/* Event Grid/List */}
      <section className="mt-6">
        {hasEvents ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          /* No Events Found State */
          !loading && !error && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <CalendarIcon className="w-16 h-16 text-gray-600 mb-4" />
              <h2 className="text-2xl font-semibold text-white mb-2">No events found</h2>
              <p className="text-gray-400 mb-6 max-w-sm">
                No events match your current filters. Try adjusting the filters or check back later for new events.
              </p>
              <button
                onClick={resetAllFilters}
                className="px-6 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition rounded-lg flex items-center"
              >
                <XCircleIcon className="w-5 h-5 mr-2" />
                Reset All Filters
              </button>
            </div>
          )
        )}
      </section>
    </div>
  );
}