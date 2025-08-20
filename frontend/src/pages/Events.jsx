import { Search, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import EventCard from "@/components/EventCard";
import { useState, useEffect } from "react";

const Events = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDate, setSelectedDate] = useState("all");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    "Technology",
    "Cultural",
    "Professional",
    "Sports",
    "Academic",
    "Workshop",
    "Hackathon",
  ];

  
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8000/api/events/");
        if (!res.ok) throw new Error("Failed to fetch events");
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);
  
  // Only show events with valid max_capacity and future date
  const filteredEvents = events.filter((event) => {
    // Robust max capacity
    const max =
      typeof event.max_capacity === 'number'
        ? event.max_capacity
        : (typeof event.maxCapacity === 'number'
            ? event.maxCapacity
            : (typeof event.maxAttendees === 'number' ? event.maxAttendees : 0));
    if (!max || max <= 0) return false;

    // Robust date check (future events only)
    const eventDate = event.date ? new Date(event.date) : null;
    if (!eventDate || isNaN(eventDate.getTime())) return false;
    const now = new Date();
    // Only show today or future events
    // if (eventDate.setHours(0,0,0,0) < now.setHours(0,0,0,0)) return false;

    // Date filtering logic
    let matchesDate = true;
    if (selectedDate !== "all") {
      const eventDay = new Date(eventDate);
      eventDay.setHours(0,0,0,0);
      const today = new Date();
      today.setHours(0,0,0,0);
      if (selectedDate === "today") {
        matchesDate = eventDay.getTime() === today.getTime();
      } else if (selectedDate === "week") {
        // Get start and end of current week (Monday-Sunday)
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
        startOfWeek.setHours(0,0,0,0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23,59,59,999);
        matchesDate = eventDay >= startOfWeek && eventDay <= endOfWeek;
      } else if (selectedDate === "month") {
        matchesDate = eventDay.getMonth() === today.getMonth() && eventDay.getFullYear() === today.getFullYear();
      }
    }

    const matchesSearch =
      (event.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (event.location?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      (typeof event.category === 'string' &&
        (
          // Treat 'tech' and 'technology' as the same
          ((selectedCategory.toLowerCase() === 'technology' || selectedCategory.toLowerCase() === 'tech') &&
            (event.category.toLowerCase() === 'technology' || event.category.toLowerCase() === 'tech')) ||
          // Other categories match as usual
          (selectedCategory.toLowerCase() !== 'technology' && selectedCategory.toLowerCase() !== 'tech' && event.category.toLowerCase() === selectedCategory.toLowerCase())
        )
      );
    return matchesSearch && matchesCategory && matchesDate;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Discover Events
          </h1>
          <p className="text-lg text-gray-600">
            Find amazing events happening on campus and connect with your
            community.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search events by title or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white text-gray-800 placeholder:text-gray-400 border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            {/* Category Filter */}
            <div className="min-w-[200px]">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-white text-gray-800 border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-white text-gray-800">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Filter */}
            <div className="min-w-[200px]">
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="bg-white text-gray-800 border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                  <SelectValue placeholder="All Dates" />
                </SelectTrigger>
                <SelectContent className="bg-white text-gray-800">
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {selectedCategory !== "all" && (
              <Badge className="bg-gray-100 text-gray-700 border border-gray-300">
                {selectedCategory}
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                >
                  ×
                </button>
              </Badge>
            )}
            {searchTerm && (
              <Badge className="bg-gray-100 text-gray-700 border border-gray-300">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredEvents.length} of {events.length} events
          </p>
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={{
                  ...event,
                  registered_users_count: typeof event.registered_users_count === 'number' ? event.registered_users_count : (typeof event.attendees === 'number' ? event.attendees : 0),
                  max_capacity: typeof event.max_capacity === 'number' ? event.max_capacity : (typeof event.maxCapacity === 'number' ? event.maxCapacity : (typeof event.maxAttendees === 'number' ? event.maxAttendees : 0)),
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No events found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or browse all events.
            </p>
            <Button className="bg-white text-gray-800 border border-gray-300 hover:bg-gray-100">
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;