import {
  Calendar,
  Users,
  TrendingUp,
  Star,
  Plus,
  Bell,
  BarChart3,
  MessageSquare,
  Edit,
  Trash2,
  Target,
  Brain,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
const OrganizerDashboard = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState([]);
  const [feedbackData, setFeedbackData] = useState([]);
  const [sentimentData, setSentimentData] = useState({
    positive: 0,
    neutral: 0,
    negative: 0,
  });
  const [stats, setStats] = useState();
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    eventId: null,
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedInterest, setSelectedInterest] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [studentInterests, setStudentInterests] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingFeedback, setLoadingFeedback] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get(
          "http://localhost:8000/api/organizer/events/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const mappedEvents = res.data.map((event) => ({
          id: event.id,
          title: event.title,
          date: event.date,
          category: event.category,
          registered: event.registered_users_count,
          feedback: 0, // Placeholder
          status: new Date(event.date) >= new Date() ? "upcoming" : "past",
          successPrediction: Math.round(event.success_rate || 0),
          targetStudents: event.expected_attendees || 0,
        }));

        setEvents(mappedEvents);
        console.log("📅 Events fetched:", mappedEvents);
      } catch (err) {
        console.error("❌ Failed to fetch events:", err);
      } finally {
        setLoadingEvents(false);
      }
    };

    const fetchFeedback = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const allFeedbacks = [];

        const eventRes = await axios.get(
          "http://localhost:8000/api/organizer/events/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const events = eventRes.data;
        for (const event of events) {
          const res = await axios.get(
            `http://localhost:8000/api/events/${event.id}/feedback/`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const feedbacks = res.data.map((item) => ({
            id: item.id,
            event: event.title,
            student: item.user_name,
            rating: item.rating,
            comment: item.comment,
            sentiment: "positive", // 🔮 Replace later with actual NLP
          }));
          allFeedbacks.push(...feedbacks);
        }

        setFeedbackData(allFeedbacks);
        console.log("📝 Feedback fetched:", allFeedbacks);
      } catch (err) {
        console.error("❌ Failed to fetch feedback:", err);
      } finally {
        setLoadingFeedback(false);
      }
    };

    const fetchSentimentStats = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get(
          "http://localhost:8000/api/organizer/sentiment-analysis/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSentimentData(res.data);
        console.log("📊 Sentiment stats fetched:", res.data);
      } catch (err) {
        console.error("❌ Failed to fetch sentiment analytics:", err);
      }
    };
    const fetchStudentInterests = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get(
          "http://localhost:8000/api/organizer/trending-interests/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setStudentInterests(res.data);

        console.log("📊 Student interests fetched:", res.data);
      } catch (err) {
        console.error("❌ Failed to fetch student interests:", err);
      }
    };
    const fetchStats = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/organizer/stats/",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );

        const data = res.data;
        setStats([
          {
            title: "Total Events Created",
            value: data.total_events_created,
            icon: Calendar,
            color: "from-indigo-500 to-indigo-600",
          },
          {
            title: "Total Students Reached",
            value: data.total_students_reached,
            icon: Users,
            color: "from-emerald-500 to-emerald-600",
          },
          {
            title: "Average Rating",
            value: data.average_rating,
            icon: Star,
            color: "from-indigo-400 to-emerald-500",
          },
          {
            title: "Success Rate",
            value: `${data.average_success_rate}%`,
            icon: TrendingUp,
            color: "from-emerald-400 to-indigo-500",
          },
          {
            title: "Attendance Rate",
            value: `${data.attendance_rate}%`,
            icon: Target,
            color: "from-yellow-400 to-orange-500",
          },
          {
            title: "Total Capacity",
            value: data.total_capacity,
            icon: Users,
            color: "from-purple-400 to-pink-500",
          },
        ]);
      } catch (err) {
        console.error("❌ Failed to fetch organizer stats:", err);
      }
    };

    fetchStats();
    fetchStudentInterests();
    fetchEvents();
    fetchFeedback();
    fetchSentimentStats();
  }, []);

  const handleUpdateEvent = async (eventId, updatedFields) => {
    const token = localStorage.getItem("access_token");
    try {
      const response = await axios.patch(
        `http://localhost:8000/api/events/${eventId}/`,
        updatedFields,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        variant: "default",
        title: "Event Updated!",
        description: "Event details have been successfully updated.",
      });

      // Update the local events state
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId ? { ...event, ...updatedFields } : event
        )
      );

      console.log("✅ Event updated:", response.data);
    } catch (error) {
      console.error(
        "❌ Event update failed:",
        error.response?.data || error.message
      );
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Please check the required fields and try again.",
      });
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const token = localStorage.getItem("access_token");

    try {
      await axios.delete(`http://localhost:8000/api/events/${eventId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update frontend state (assuming you have setEvents)
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== eventId)
      );

      // Show success toast
      toast({
        variant: "destructive",
        title: "Event Deleted!",
        description: "Event has been successfully removed.",
      });
    } catch (error) {
      console.error("❌ Failed to delete event:", error);
      toast({
        variant: "default",
        title: "Deletion Failed",
        description: "There was an issue deleting the event. Please try again.",
      });
    }
  };

  const handleViewStudents = async (interest) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:8000/api/students/by-interest/?interest=${encodeURIComponent(
          interest
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setSelectedInterest(interest);
      setStudentsList(data);
    // console.log('👥 StudentsList:', data);
      setShowStudentModal(true);
    } catch (error) {
      console.error("❌ Failed to fetch students:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#111827] mb-2">
              Organizer Dashboard
            </h1>
            <p className="text-[#6B7280] text-lg">
              Manage your events with AI-powered insights and analytics
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Link to="/create-event">
              <Button className="primary-button">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats ? (
            stats.slice(0, 4).map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[#6B7280]">
                      {stat.title}
                    </CardTitle>
                    <div
                      className={`p-2 bg-gradient-to-r ${stat.color} rounded-xl shadow-md`}
                    >
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-[#111827] mb-1">
                      {stat.value}
                    </div>
                    <p className="text-xs text-emerald-600 font-medium">
                      {stat.change}
                    </p>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <p>Loading stats...</p>
          )}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 glass-card p-2 h-auto">
            <TabsTrigger
              value="events"
              className="rounded-2xl py-3 data-[state=active]:bg-indigo-500 data-[state=active]:text-white smooth-transition"
            >
              Events Management
            </TabsTrigger>
            <TabsTrigger
              value="feedback"
              className="rounded-2xl py-3 data-[state=active]:bg-indigo-500 data-[state=active]:text-white smooth-transition"
            >
              Feedback & Reviews
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="rounded-2xl py-3 data-[state=active]:bg-indigo-500 data-[state=active]:text-white smooth-transition"
            >
              ML Analytics
            </TabsTrigger>
            <TabsTrigger
              value="students"
              className="rounded-2xl py-3 data-[state=active]:bg-indigo-500 data-[state=active]:text-white smooth-transition"
            >
              Student Insights
            </TabsTrigger>
          </TabsList>

          {/* Events Management */}
          <TabsContent value="events">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#111827] flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-xl">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  Your Events
                </CardTitle>
                <CardDescription className="text-[#6B7280] text-lg">
                  Manage your existing events with ML predictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {events.map((event) => (
                    <div key={event.id} className="glass-button p-6 group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-[#111827] text-lg">
                            {event.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-[#6B7280] mt-2">
                            <span>{event.date}</span>
                            <Badge className="bg-indigo-100 text-indigo-600 rounded-full px-3 py-1">
                              {event.category}
                            </Badge>
                            <span>{event.registered} registered</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            
                            onClick={() => {
                              setSelectedEvent(event);
                              setEditDialog(true);
                            }}
                          >
                            
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() =>
                              setConfirmDelete({
                                open: true,
                                eventId: event.id,
                              })
                            }
                            className="glass-button text-red-600"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* ML Predictions */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200/50">
                        <div className="text-center p-4 bg-emerald-50 rounded-2xl border border-emerald-200/50">
                          <div className="text-2xl font-bold text-emerald-600">
                            {event.successPrediction}%
                          </div>
                          <div className="text-sm text-emerald-700 mt-1 font-medium">
                            Success Prediction
                          </div>
                          <div className="text-xs text-[#6B7280] mt-1">
                            ML-powered prediction
                          </div>
                        </div>
                        <div className="text-center p-4 bg-indigo-50 rounded-2xl border border-indigo-200/50">
                          <div className="text-2xl font-bold text-indigo-600">
                            {event.targetStudents}
                          </div>
                          <div className="text-sm text-indigo-700 mt-1 font-medium">
                            Target Students
                          </div>
                          <div className="text-xs text-[#6B7280] mt-1">
                            AI-matched students
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-8">
                  <Link to="/create-event">
                    <Button className="accent-button text-lg px-8 py-3">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Event
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback & Reviews */}
          <TabsContent value="feedback">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#111827] flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-xl">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  Student Feedback & Reviews
                </CardTitle>
                <CardDescription className="text-[#6B7280] text-lg">
                  Review feedback with AI sentiment analysis from your events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {feedbackData.map((feedback) => (
                    <div key={feedback.id} className="glass-button p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-[#111827]">
                            {feedback.student}
                          </h4>
                          <Badge className="bg-indigo-100 text-indigo-600 rounded-full px-3 py-1">
                            {feedback.event}
                          </Badge>
                          <Badge className="bg-emerald-100 text-emerald-600 rounded-full px-3 py-1">
                            {feedback.sentiment} sentiment
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < feedback.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-[#6B7280] italic leading-relaxed">
                        "{feedback.comment}"
                      </p>
                      <p className="text-xs text-[#6B7280] mt-3">
                        Sentiment analyzed using advanced NLP algorithms
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ML Analytics */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-[#111827] flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-xl">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    AI Sentiment Analysis
                  </CardTitle>
                  <CardDescription className="text-[#6B7280] text-lg">
                    Machine learning-powered feedback sentiment analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-emerald-700 flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                        Positive Feedback
                      </span>
                      <span className="text-sm font-bold text-[#111827]">
                        {sentimentData.positive}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-3 rounded-full smooth-transition"
                        style={{ width: `${sentimentData.positive}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#6B7280] flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        Neutral Feedback
                      </span>
                      <span className="text-sm font-bold text-[#111827]">
                        {sentimentData.neutral}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gray-400 h-3 rounded-full smooth-transition"
                        style={{ width: `${sentimentData.neutral}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-red-700 flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        Needs Improvement
                      </span>
                      <span className="text-sm font-bold text-[#111827]">
                        {sentimentData.negative}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-red-500 h-3 rounded-full smooth-transition"
                        style={{ width: `${sentimentData.negative}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-xs text-[#6B7280] mt-6">
                    Data processed using advanced NLP and sentiment analysis
                    algorithms
                  </p>
                </CardContent>
              </Card>

              {stats && stats.length >= 6 && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-[#111827] flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-xl">
                        <BarChart3 className="h-6 w-6 text-white" />
                      </div>
                      Event Performance Metrics
                    </CardTitle>
                    <CardDescription className="text-[#6B7280] text-lg">
                      Key performance indicators for your events
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-indigo-50 rounded-2xl border border-indigo-200/50">
                        <div className="text-3xl font-bold text-indigo-600">
                          {stats[0].value}
                        </div>
                        <div className="text-sm text-indigo-700 font-medium">
                          Total Events
                        </div>
                      </div>
                      <div className="text-center p-4 bg-emerald-50 rounded-2xl border border-emerald-200/50">
                        <div className="text-3xl font-bold text-emerald-600">
                          {stats[4].value}
                        </div>
                        <div className="text-sm text-emerald-700 font-medium">
                          Attendance Rate
                        </div>
                      </div>
                      <div className="text-center p-4 bg-indigo-50 rounded-2xl border border-indigo-200/50">
                        <div className="text-3xl font-bold text-indigo-600">
                          {stats[2].value}
                        </div>
                        <div className="text-sm text-indigo-700 font-medium">
                          Avg. Rating
                        </div>
                      </div>
                      <div className="text-center p-4 bg-emerald-50 rounded-2xl border border-emerald-200/50">
                        <div className="text-3xl font-bold text-emerald-600">
                          {stats[5].value}
                        </div>
                        <div className="text-sm text-emerald-700 font-medium">
                          Total Capacity
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Student Insights */}
          <TabsContent value="students">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#111827] flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-xl">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  Student Interest Analysis & Matching
                </CardTitle>
                <CardDescription className="text-[#6B7280] text-lg">
                  Filter and target students by their interests using ML
                  analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {studentInterests.length === 0 ? (
                    <p className="text-sm text-[#6B7280]">
                      No interest data available yet.
                    </p>
                  ) : (
                    studentInterests.map((interest, index) => {
                      // Pick a color and icon based on interest (simple hash)
                      const colors = [
                        'from-indigo-500 to-emerald-500',
                        'from-pink-500 to-yellow-500',
                        'from-blue-500 to-purple-500',
                        'from-green-500 to-teal-400',
                        'from-orange-500 to-red-400',
                        'from-cyan-500 to-blue-400',
                      ];
                      const icons = [
                        <Brain className="h-6 w-6 text-white" key="brain" />, // fallback
                        <Star className="h-6 w-6 text-white" key="star" />, // fallback
                        <TrendingUp className="h-6 w-6 text-white" key="trend" />,
                        <Users className="h-6 w-6 text-white" key="users" />,
                        <BarChart3 className="h-6 w-6 text-white" key="bar" />,
                        <Target className="h-6 w-6 text-white" key="target" />,
                      ];
                      const color = colors[index % colors.length];
                      const icon = icons[index % icons.length];
                      // Growth badge color
                      let growthColor = 'bg-gray-100 text-gray-700';
                      if (interest.growth > 0) growthColor = 'bg-emerald-100 text-emerald-600';
                      if (interest.growth < 0) growthColor = 'bg-red-100 text-red-600';
                      // Progress bar width (max 100%)
                      const progress = Math.min((interest.count / 500) * 100, 100);
                      return (
                        <div
                          key={index}
                          className="glass-button p-6 flex flex-col gap-4 shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100 hover:border-indigo-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl bg-gradient-to-r ${color} shadow-md`}>{icon}</div>
                              <div>
                                <h3 className="font-semibold text-[#111827] flex items-center gap-2 text-lg">
                                  {interest.interest}
                                  <Badge className={`${growthColor} rounded-full px-3 py-1 ml-1 text-xs font-semibold`}>
                                    {interest.growth > 0 ? '+' : ''}{interest.growth}
                                  </Badge>
                                </h3>
                                <p className="text-xs text-[#6B7280] mt-1">
                                  {interest.count} interested students
                                </p>
                              </div>
                            </div>
                            <Button
                              className="glass-button text-indigo-600 border border-indigo-200 hover:bg-indigo-50 px-4 py-2 text-sm font-medium"
                              onClick={() => handleViewStudents(interest.interest)}
                            >
                              View
                            </Button>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-3 rounded-full smooth-transition shadow"
                              style={{ width: `${progress}%` }}
                            ></div>
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-600 font-semibold">
                              {progress.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <p className="text-xs text-[#6B7280] mt-6">
                  Interest data processed using machine learning algorithms and
                  behavioral analysis
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {confirmDialog.open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
            <h3 className="text-xl font-semibold mb-2">
              {confirmDialog.title}
            </h3>
            <p className="text-gray-600 mb-6">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
                onClick={() =>
                  setConfirmDialog((prev) => ({ ...prev, open: false }))
                }
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog((prev) => ({ ...prev, open: false }));
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {confirmDelete.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">🗑️ Are you sure?</h2>
            <p className="text-gray-600 mb-6">
              This action will permanently delete the event.
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setConfirmDelete({ open: false, eventId: null })}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={() => {
                  handleDeleteEvent(confirmDelete.eventId);
                  setConfirmDelete({ open: false, eventId: null });
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {editDialog && selectedEvent && (
        <Dialog open={editDialog} onOpenChange={setEditDialog}>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
              <DialogDescription>
                Modify event details and save.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Input
                value={selectedEvent.title}
                onChange={(e) =>
                  setSelectedEvent({ ...selectedEvent, title: e.target.value })
                }
                placeholder="Title"
                required
              />
              <Input
                value={selectedEvent.description}
                onChange={(e) =>
                  setSelectedEvent({
                    ...selectedEvent,
                    description: e.target.value,
                  })
                }
                placeholder="Description"
              />
              <Input
                type="date"
                value={selectedEvent.date}
                onChange={(e) =>
                  setSelectedEvent({ ...selectedEvent, date: e.target.value })
                }
                required
              />
              <Input
                type="time"
                value={selectedEvent.time || ''}
                onChange={(e) =>
                  setSelectedEvent({ ...selectedEvent, time: e.target.value })
                }
                placeholder="Time"
              />
              <Input
                value={selectedEvent.location || ''}
                onChange={(e) =>
                  setSelectedEvent({ ...selectedEvent, location: e.target.value })
                }
                placeholder="Location"
              />
              {/* Category Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={selectedEvent.category || ''}
                  onChange={e => setSelectedEvent({ ...selectedEvent, category: e.target.value })}
                  required
                >
                  <option value="">Select category</option>
                  <option value="technology">Technology</option>
                  <option value="cultural">Cultural</option>
                  <option value="sports">Sports</option>
                  <option value="academic">Academic</option>
                  <option value="professional">Professional</option>
                  <option value="workshop">Workshop</option>
                  <option value="seminar">Seminar</option>
                  <option value="competition">Competition</option>
                </select>
              </div>
              {/* Target Year Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-1">Target Year</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={selectedEvent.target_year || ''}
                  onChange={e => setSelectedEvent({ ...selectedEvent, target_year: e.target.value })}
                >
                  <option value="">Select target year</option>
                  <option value="1st year">1st Year</option>
                  <option value="2nd year">2nd Year</option>
                  <option value="3rd year">3rd Year</option>
                  <option value="4th year">4th Year</option>
                  <option value="all years">All Years</option>
                </select>
              </div>
              {/* Department Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={selectedEvent.department || ''}
                  onChange={e => setSelectedEvent({ ...selectedEvent, department: e.target.value })}
                >
                  <option value="">Select department</option>
                  <option value="computer science">Computer Science</option>
                  <option value="engineering">Engineering</option>
                  <option value="business">Business</option>
                  <option value="arts">Arts</option>
                  <option value="science">Science</option>
                  <option value="all departments">All Departments</option>
                </select>
              </div>
              <Input
                type="number"
                value={selectedEvent.max_capacity || ''}
                onChange={(e) =>
                  setSelectedEvent({ ...selectedEvent, max_capacity: e.target.value })
                }
                placeholder="Max Capacity"
              />
              {/* Tags Field (like CreateEvent) */}
              <div className="space-y-2">
                <label className="block text-sm font-medium mb-1">Event Tags</label>
                <div className="flex gap-2">
                  <Input
                    value={selectedEvent.currentTag || ''}
                    onChange={e => setSelectedEvent({ ...selectedEvent, currentTag: e.target.value })}
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (selectedEvent.currentTag && selectedEvent.currentTag.trim()) {
                          const newTags = selectedEvent.currentTag
                            .split(',')
                            .map(tag => tag.trim())
                            .filter(tag => tag.length > 0 && !(selectedEvent.tags || []).includes(tag));
                          setSelectedEvent(prev => ({
                            ...prev,
                            tags: [...(prev.tags || []), ...newTags],
                            currentTag: '',
                          }));
                        }
                      }
                    }}
                    placeholder="Add a tag"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (selectedEvent.currentTag && selectedEvent.currentTag.trim()) {
                        const newTags = selectedEvent.currentTag
                          .split(',')
                          .map(tag => tag.trim())
                          .filter(tag => tag.length > 0 && !(selectedEvent.tags || []).includes(tag));
                        setSelectedEvent(prev => ({
                          ...prev,
                          tags: [...(prev.tags || []), ...newTags],
                          currentTag: '',
                        }));
                      }
                    }}
                    variant="outline"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(selectedEvent.tags || []).map((tag, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="border-slate-200 text-slate-700"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => setSelectedEvent(prev => ({
                          ...prev,
                          tags: prev.tags.filter((t, i) => i !== idx),
                        }))}
                        className="ml-2 text-slate-500 hover:text-slate-700"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => {
                  handleUpdateEvent(selectedEvent.id, {
                    title: selectedEvent.title,
                    description: selectedEvent.description,
                    date: selectedEvent.date,
                    time: selectedEvent.time,
                    location: selectedEvent.location,
                    category: selectedEvent.category,
                    target_year: selectedEvent.target_year,
                    department: selectedEvent.department,
                    max_capacity: selectedEvent.max_capacity,
                    tags: selectedEvent.tags,
                  });
                  setEditDialog(false);
                }}
              >
                Confirm Update
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showStudentModal && (
        <Dialog open={showStudentModal} onOpenChange={setShowStudentModal}>
          <DialogContent className="max-w-lg w-full">
            <DialogHeader>
              <DialogTitle>
                Students Interested in {selectedInterest}
              </DialogTitle>
              <DialogDescription>
                Below is the list of students. You can filter and render their names in descending order:
              </DialogDescription>
              <div className="mt-4 mb-2 flex gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    const extractNum = str => {
                      const match = str.match(/(\d+)/);
                      return match ? parseInt(match[1], 10) : 0;
                    };
                    setStudentsList(prev => [...prev].sort((a, b) => extractNum(b.username) - extractNum(a.username)));
                  }}
                  className="bg-indigo-500 text-white px-4 py-2 rounded"
                >
                  Sort Descending
                </Button>
              </div>
              {studentsList.length > 0 ? (
                <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto mt-4">
                  {studentsList.map((student) => (
                    <div key={student.id} className="flex items-center gap-4 py-3">
                      {/* Avatar: fallback to initials if no avatar */}
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg shadow">
                        {student.avatar ? (
                          <img src={student.avatar} alt={student.username} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          (student.username && student.username.length > 0)
                            ? student.username[0].toUpperCase()
                            : '?'
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[#111827] truncate">{student.username}</div>
                        <div className="text-xs text-[#6B7280] truncate">{student.email}</div>
                      </div>
                      {/* Optionally, add more info or actions here */}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="block text-center text-gray-500 py-8">No students found.</span>
              )}
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default OrganizerDashboard;
