// import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
// import { useParams, Link } from "react-router-dom";

function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  // Remove local isRegistered state, use backend event.is_registered
  const isAuthenticated = Boolean(localStorage.getItem("access_token"));

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/api/events/${id}/`);
        if (!res.ok) throw new Error("Failed to fetch event");
        const data = await res.json();
        setEvent(data);
      } catch (err) {
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!event) return <div>Event not found.</div>;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Use backend fields for consistency with StudentDashboard, robust to 0/undefined/null
  const getAttendancePercentage = () => {
    const count =
      event && typeof event.registered_users_count === 'number'
        ? event.registered_users_count
        : (event && typeof event.attendees === 'number' ? event.attendees : 0);
    const max =
      event && typeof event.max_capacity === 'number'
        ? event.max_capacity
        : (event && typeof event.maxCapacity === 'number'
            ? event.maxCapacity
            : (event && typeof event.maxAttendees === 'number' ? event.maxAttendees : 0));
    if (!max || max === 0) return 0;
    if (!count || count < 0) return 0;
    return Math.round((count / max) * 100);
  };

  

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/events"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Link>

        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="relative">
            <img
              src={event.poster || event.image || "/placeholder.svg"}
              alt={event.title}
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute top-4 left-4">
              <Badge className="bg-blue-100 text-blue-800">
                {event.category}
              </Badge>
            </div>
            {/* Removed like, share, and bookmark buttons */}
          </div>

          <div className="p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {event.title}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-3 text-blue-600" />
                <div>
                  <div className="font-semibold">{formatDate(event.date)}</div>
                  <div className="text-sm">{event.time}</div>
                </div>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-3 text-blue-600" />
                <div>{event.location}</div>
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="h-5 w-5 mr-3 text-blue-600" />
                <div>
                  {/* Consistent registration numbers */}
                  {(typeof event.registered_users_count !== 'undefined' ? event.registered_users_count : (event.attendees ?? 0))}/
                  {event.max_capacity ?? event.maxCapacity ?? event.maxAttendees ?? 0} registered
                </div>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-5 w-5 mr-3 text-blue-600" />
                <div>
                  Organized by {event.organizer_name || "Unknown Organizer"}
                </div>
              </div>
            </div>

            {/* Registration Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Registration Progress</span>
                <span>{getAttendancePercentage()}% Full</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${getAttendancePercentage()}%` }}
                ></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                className="flex-1 sm:flex-none border border-gray-300 text-gray-800 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:border-indigo-500"
                onClick={() => navigate('/contact')}
              >
                Contact Organizer
              </Button>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Description */}
            <Card className="bg-white text-gray-800 border border-gray-200 shadow-md mb-8">
              <CardHeader>
                <CardTitle>About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-gray max-w-none">
                  {event.description.split("\n").map((paragraph, index) => (
                    <p
                      key={index}
                      className="mb-4 text-gray-700 leading-relaxed"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card className="bg-white text-gray-800 border border-gray-200 shadow-md">
              <CardHeader>
                <CardTitle>Event Schedule</CardTitle>
                <CardDescription>
                  Full day agenda with timing details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {event.schedule?.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-24 text-sm font-medium text-blue-600">
                        {item.time}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {item.activity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tags */}
            <Card className="bg-white text-gray-900 border border-gray-200 shadow-md">
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {event.tags?.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Similar Events */}
            <Card className="bg-white text-gray-800 border border-gray-200 shadow-md">
              <CardHeader>
                <CardTitle>You Might Also Like</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=80&h=80&fit=crop"
                      alt="Similar event"
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm line-clamp-2">
                        Cultural Diversity Festival
                      </div>
                      <div className="text-xs text-gray-500">July 20, 2024</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=80&h=80&fit=crop"
                      alt="Similar event"
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm line-clamp-2">
                        Career Development Workshop
                      </div>
                      <div className="text-xs text-gray-500">July 25, 2024</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetail;
