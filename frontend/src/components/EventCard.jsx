import { Link } from "react-router-dom";
import { Calendar, MapPin, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const EventCard = ({ event }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getAttendancePercentage = () => {
    const registered = typeof event.registered_users_count === "number" ? event.registered_users_count : 0;
    const max = typeof event.max_capacity === "number" ? event.max_capacity : 0;
    if (max === 0) return 0;
    return Math.round((registered / max) * 100);
  };
  const getCategoryColor = (category) => {
    const colors = {
      Technology: "bg-indigo-100 text-indigo-800",
      Cultural: "bg-emerald-100 text-emerald-800",
      Professional: "bg-indigo-100 text-indigo-800",
      Sports: "bg-emerald-100 text-emerald-800",
      Academic: "bg-indigo-100 text-indigo-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <Card className="overflow-hidden bg-white text-gray-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative">
          <img
            src={event.poster || event.image}
            alt={event.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-4 left-4">
            <Badge
              className={`${getCategoryColor(
                event.category
              )} rounded-full px-3 py-1 text-sm font-medium`}
            >
              {event.category}
            </Badge>
          </div>
          <div className="absolute top-4 right-4 bg-white text-gray-800 rounded-lg p-2 shadow-md">
            <div className="text-center">
              <div className="text-sm font-bold text-gray-900">
                {formatDate(event.date).split(" ")[1]}
              </div>
              <div className="text-xs text-gray-600">
                {formatDate(event.date).split(" ")[0]}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
          {event.title}
        </h3>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-indigo-600" />
            <span>
              {formatDate(event.date)} at {event.time}
            </span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-indigo-600" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-indigo-600" />
            <span>
              {typeof event.registered_users_count === "number" ? event.registered_users_count : 0}
              /
              {typeof event.max_capacity === "number" ? event.max_capacity : 0} registered
            </span>
          </div>
        </div>

        {/* Attendance Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Registration Progress</span>
            <span>{getAttendancePercentage()}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getAttendancePercentage()}%` }}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Link to={`/events/${event.id}`} className="w-full">
          <Button className="w-full bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 text-white">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
