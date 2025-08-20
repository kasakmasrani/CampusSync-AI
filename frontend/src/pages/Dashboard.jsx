
import { useState } from "react";
import { Calendar, TrendingUp, Users, Star, Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";

function Dashboard() {
  const stats = [
    {
      title: "Events Attended",
      value: "24",
      change: "+3 this month",
      icon: Calendar,
      color: "text-blue-600"
    },
    {
      title: "Hours Engaged",
      value: "156",
      change: "+12 this week",
      icon: Clock,
      color: "text-green-600"
    },
    {
      title: "Network Connections",
      value: "89",
      change: "+8 new connections",
      icon: Users,
      color: "text-purple-600"
    },
    {
      title: "Avg. Rating Given",
      value: "4.8",
      change: "⭐ Excellent feedback",
      icon: Star,
      color: "text-yellow-600"
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "AI & Machine Learning Bootcamp",
      date: "2024-07-30",
      time: "09:00 AM",
      location: "Tech Lab",
      category: "Technology",
      status: "registered"
    },
    {
      id: 2,
      title: "International Food Fair",
      date: "2024-08-05",
      time: "12:00 PM",
      location: "Student Plaza",
      category: "Cultural",
      status: "registered"
    },
    {
      id: 3,
      title: "Startup Pitch Competition",
      date: "2024-08-10",
      time: "01:00 PM",
      location: "Business Center",
      category: "Professional",
      status: "waitlist"
    }
  ];

  const pastEvents = [
    {
      id: 1,
      title: "Tech Innovation Summit 2024",
      date: "2024-06-15",
      location: "Main Auditorium",
      rating: 5,
      feedback: "Amazing event with great networking opportunities!"
    },
    {
      id: 2,
      title: "Cultural Diversity Festival",
      date: "2024-06-10",
      location: "Campus Grounds",
      rating: 4,
      feedback: "Loved the variety of cultural performances."
    },
    {
      id: 3,
      title: "Career Development Workshop",
      date: "2024-06-05",
      location: "Conference Room A",
      rating: 5,
      feedback: "Very informative and practical career advice."
    }
  ];

  const recommendations = [
    {
      id: 4,
      title: "Web Development Workshop",
      date: "2024-08-15",
      match: "95%",
      reason: "Based on your technology interests"
    },
    {
      id: 5,
      title: "Leadership Summit",
      date: "2024-08-20",
      match: "88%",
      reason: "Matches your professional development goals"
    },
    {
      id: 6,
      title: "Art & Design Exhibition",
      date: "2024-08-25",
      match: "72%",
      reason: "New interest area suggestion"
    }
  ];


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const variants = {
      registered: "bg-green-100 text-green-800",
      waitlist: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return variants[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Welcome back, Alex! 👋
          </h1>
          <p className="text-lg text-gray-600">
            Here's your event activity and personalized recommendations.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <p className="text-xs text-gray-600">
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="past">Event History</TabsTrigger>
            <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          </TabsList>

          {/* Upcoming Events */}
          <TabsContent value="upcoming">
            <Card>
              <CardHeader>
                <CardTitle>Your Upcoming Events</CardTitle>
                <CardDescription>
                  Events you've registered for or are on the waitlist
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{event.title}</h3>
                            <Badge className={getStatusBadge(event.status)}>
                              {event.status}
                            </Badge>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 gap-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(event.date)} at {event.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {event.location}
                            </span>
                          </div>
                        </div>
                        <Link to={`/events/${event.id}`}>
                          <Button variant="outline">View Details</Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No upcoming events registered</p>
                    <Link to="/events">
                      <Button>Browse Events</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Past Events */}
          <TabsContent value="past">
            <Card>
              <CardHeader>
                <CardTitle>Event History</CardTitle>
                <CardDescription>
                  Events you've attended with your feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pastEvents.map((event) => (
                    <div key={event.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                          <div className="flex items-center text-sm text-gray-600 gap-4">
                            <span>{formatDate(event.date)}</span>
                            <span>{event.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < event.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 italic">"{event.feedback}"</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Recommendations */}
          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  AI-Powered Recommendations
                </CardTitle>
                <CardDescription>
                  Events curated based on your interests and activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{event.title}</h3>
                          <Badge variant="outline" className="text-blue-600 border-blue-200">
                            {event.match} match
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 gap-4">
                          <span>{formatDate(event.date)}</span>
                          <span>• {event.reason}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Not Interested
                        </Button>
                        <Link to={`/events/${event.id}`}>
                          <Button size="sm">View Event</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default Dashboard;
