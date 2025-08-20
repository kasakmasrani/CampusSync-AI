import { useState, useEffect } from "react";
import {
  Calendar,
  Star,
  Users,
  TrendingUp,
  Clock,
  Sparkles,
  Target,
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const StudentDashboard = () => {
  const { toast } = useToast();
  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating] = useState(0);
  const [feedbackEventId, setFeedbackEventId] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Fetch all events from backend
  const [allEvents, setAllEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // force re-render
  // Track registration state for instant UI feedback
  const [justRegistered, setJustRegistered] = useState({});

  // Fetch events function for reuse
  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const token = localStorage.getItem("access_token");
      const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};
      const res = await fetch("http://localhost:8000/api/events/", {
        headers,
      });
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      setAllEvents(data);
      setRefreshKey(prev => prev + 1); // force re-render
    } catch (err) {
      setAllEvents([]);
      setRefreshKey(prev => prev + 1);
    } finally {
      setLoadingEvents(false);
    }
  };
  useEffect(() => {
    fetchEvents();
  }, []);

  // Students Like You (ML Clustering)
  const [similarStudents, setSimilarStudents] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  useEffect(() => {
    const fetchSimilarStudents = async () => {
      setLoadingSimilar(true);
      try {
        const token = localStorage.getItem("access_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch("http://localhost:8000/api/students/similar/", { headers });
        if (!res.ok) throw new Error("Failed to fetch similar students");
        const data = await res.json();
        setSimilarStudents(data);
      } catch (err) {
        setSimilarStudents([]);
      } finally {
        setLoadingSimilar(false);
      }
    };
    fetchSimilarStudents();
  }, []);

  const recommendedEvents = [
    {
      id: 4,
      title: "Web Development Workshop",
      date: "2024-08-15",
      match: "95%",
      reason: "Based on your technology interests and past feedback",
      category: "Technology",
      predictedSatisfaction: 4.8,
    },
    {
      id: 5,
      title: "Leadership Summit",
      date: "2024-08-20",
      match: "88%",
      reason: "Matches your professional development goals",
      category: "Professional",
      predictedSatisfaction: 4.6,
    },
    {
      id: 6,
      title: "Art & Design Exhibition",
      date: "2024-08-25",
      match: "72%",
      reason: "New interest area suggestion based on similar students",
      category: "Cultural",
      predictedSatisfaction: 4.2,
    },
  ];



  const handleRegister = async (eventId) => {
    // Optimistically update UI
    setJustRegistered((prev) => ({ ...prev, [eventId]: true }));
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast({
        title: "Not Authenticated",
        description: "Please log in to register for events.",
        variant: "destructive",
      });
      setJustRegistered((prev) => ({ ...prev, [eventId]: false }));
      return;
    }
    try {
      const res = await fetch(`http://localhost:8000/api/events/${eventId}/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Registration Successful!",
          description: data.detail || "You've been registered for this event",
        });
        await fetchEvents();
      } else if (res.status === 409) {
        toast({
          title: "Already Registered",
          description: data.detail || "You are already registered for this event.",
          variant: "destructive",
        });
        await fetchEvents();
      } else {
        toast({
          title: "Registration Failed",
          description: data.detail || "Could not register for this event.",
          variant: "destructive",
        });
        setJustRegistered((prev) => ({ ...prev, [eventId]: false }));
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An error occurred while registering.",
        variant: "destructive",
      });
      setJustRegistered((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackEventId) {
      toast({
        title: "Select Event",
        description: "Please select an event to give feedback on.",
        variant: "destructive",
      });
      return;
    }
    if (!feedbackText.trim() || rating === 0) {
      toast({
        title: "Incomplete Feedback",
        description: "Please provide a rating and comment.",
        variant: "destructive",
      });
      return;
    }
    setSubmittingFeedback(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://localhost:8000/api/events/${feedbackEventId}/feedback/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: Number(rating),
          comment: feedbackText,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Feedback Submitted!",
          description: "Thank you! Your feedback helps improve our ML recommendations.",
        });
        setFeedbackText("");
        setRating(0);
        setFeedbackEventId("");
      } else {
        toast({
          title: "Feedback Failed",
          description: data.detail || "Could not submit feedback.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An error occurred while submitting feedback.",
        variant: "destructive",
      });
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };


  // Get user info from localStorage (like in Login.jsx)
  let studentName = "Student";
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      // Prefer 'name', fallback to 'email'
      if (user.name && user.name.trim()) {
        // If name is more than one word, use first word
        studentName = user.name.split(" ")[0];
      } else if (user.email) {
        // Use first part of email as name
        studentName = user.email.split("@")[0];
      }
    }
  } catch (e) {
    studentName = "Student";
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-[#111827] mb-2">
            Welcome back, {studentName}! 🎓
          </h1>
          <p className="text-[#6B7280] text-xl">
            Discover amazing events tailored just for you with AI-powered
            recommendations
          </p>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="events" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 glass-card p-2 h-auto">
            <TabsTrigger
              value="events"
              className="rounded-2xl py-3 data-[state=active]:bg-indigo-500 data-[state=active]:text-white smooth-transition"
            >
              Upcoming Events
            </TabsTrigger>
            
            <TabsTrigger
              value="community"
              className="rounded-2xl py-3 data-[state=active]:bg-indigo-500 data-[state=active]:text-white smooth-transition"
            >
              Community
            </TabsTrigger>
            <TabsTrigger
              value="feedback"
              className="rounded-2xl py-3 data-[state=active]:bg-indigo-500 data-[state=active]:text-white smooth-transition"
            >
              Feedback
            </TabsTrigger>
          </TabsList>

          {/* Upcoming Events */}
          <TabsContent value="events">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allEvents
                .filter(event => {
                  // Only show events whose date is today or in the future
                  if (!event.date) return false;
                  const eventDate = new Date(event.date);
                  // Remove time part for comparison (treat as local date)
                  const now = new Date();
                  now.setHours(0,0,0,0);
                  eventDate.setHours(0,0,0,0);
                  return eventDate >= now;
                })
                .map((event) => (
                  <Card
                    key={event.id + '-' + refreshKey}
                    className="glass-card overflow-hidden group"
                  >
                    <div className="relative">
                      <img
                        src={event.image || event.poster}
                        alt={event.title}
                        className="w-full h-48 object-cover smooth-transition group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge className="bg-white/90 text-indigo-600 rounded-full px-3 py-1">
                          {event.category}
                        </Badge>
                        
                      </div>
                      {/* Removed like, share, and bookmark buttons */}
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-bold text-xl text-[#111827] mb-3">
                        {event.title}
                      </h3>
                      <div className="flex items-center text-[#6B7280] mb-4 gap-4">
                        <span className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(event.date)}
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {event.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-[#6B7280]">
                          {typeof event.registered_users_count !== 'undefined' ? event.registered_users_count : 0}/{event.max_capacity ?? event.maxCapacity ?? 0} registered
                        </span>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-2 rounded-full smooth-transition"
                            style={{
                              width: `${
                                (event.max_capacity ?? event.maxCapacity)
                                  ? Math.round(((typeof event.registered_users_count !== 'undefined' ? event.registered_users_count : 0) / (event.max_capacity ?? event.maxCapacity)) * 100)
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      {/* Show 'Registered' if user is already registered, or just registered, else show 'Register Now' */}
                      {(() => {
                        // Always use backend is_registered for button state, fallback to justRegistered for instant feedback
                        let isRegistered = false;
                        if (typeof event.is_registered !== 'undefined') {
                          isRegistered = event.is_registered;
                        } else if (justRegistered[event.id]) {
                          isRegistered = true;
                        }
                        if (isRegistered) {
                          return (
                            <Button className="primary-button w-full" disabled>
                              Registered
                            </Button>
                          );
                        } else {
                          return (
                            <Button
                              onClick={async () => {
                                await handleRegister(event.id);
                              }}
                              className="primary-button w-full"
                              disabled={!!justRegistered[event.id]}
                            >
                              Register Now
                            </Button>
                          );
                        }
                      })()}
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          

          {/* Community */}
          <TabsContent value="community">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#111827] flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-xl">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  Students Like You
                </CardTitle>
                <CardDescription className="text-[#6B7280] text-lg">
                  Connect with students who share similar interests based on ML
                  clustering
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {similarStudents.map((student, index) => (
                    <div key={index} className="glass-button p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                          {student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#111827]">
                            {student.name}
                          </h3>
                          <div className="flex items-center gap-2 text-[#6B7280]">
                            <Badge className="bg-gradient-to-r from-indigo-500 to-emerald-500 text-white rounded-full px-2 py-1 text-xs">
                              {student.similarity}% similar
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {student.interests.map((interest, idx) => (
                          <Badge
                            key={idx}
                            className="bg-indigo-100 text-indigo-600 rounded-full px-3 py-1"
                          >
                            {interest}
                          </Badge>
                        ))}
                      </div>
                      {/* Connect button removed */}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback */}
          <TabsContent value="feedback">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#111827] flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-xl">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  Smart Feedback System
                </CardTitle>
                <CardDescription className="text-[#6B7280] text-lg">
                  Your feedback helps us improve event recommendations using AI
                  sentiment analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="glass-button p-6">
                  <h4 className="font-semibold text-[#111827] mb-3 text-lg">
                    Why Your Feedback Matters
                  </h4>
                  <p className="text-[#6B7280] leading-relaxed">
                    Our AI analyzes your feedback to understand your preferences
                    and improve future event recommendations. The more feedback
                    you provide, the better our suggestions become!
                  </p>
                </div>

                <div>
                  <label className="block text-lg font-medium text-[#111827] mb-4">
                    Select Event
                  </label>
                  <select
                    className="rounded-xl border-gray-300 bg-white text-[#111827] px-4 py-2 mb-4 w-full"
                    value={feedbackEventId}
                    onChange={e => setFeedbackEventId(e.target.value)}
                  >
                    <option value="">-- Choose an event --</option>
                    {allEvents
                      .filter(event => {
                        // Only allow feedback for events the student is registered for and already occurred
                        const isRegistered = event.is_registered;
                        const eventDate = new Date(event.date);
                        const now = new Date();
                        eventDate.setHours(0,0,0,0);
                        now.setHours(0,0,0,0);
                        return isRegistered && eventDate <= now;
                      })
                      .map(event => (
                        <option key={event.id} value={event.id}>
                          {event.title} ({event.date})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-lg font-medium text-[#111827] mb-4">
                    Rate your overall experience
                  </label>
                  <div className="flex items-center gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none smooth-transition hover:scale-110"
                      >
                        <Star
                          className={`h-10 w-10 ${
                            star <= rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300 hover:text-yellow-400"
                          } smooth-transition`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-medium text-[#111827] mb-4">
                    Tell us about your experience
                  </label>
                  <Textarea
                    placeholder="Share your thoughts about the event. What did you like? What could be improved? Your detailed feedback helps our AI understand your preferences better..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="rounded-2xl border-gray-200/50 bg-white/50 backdrop-blur-sm focus:bg-white/80 smooth-transition min-h-[120px]"
                    rows={5}
                  />
                </div>

                <Button
                  onClick={handleFeedbackSubmit}
                  disabled={submittingFeedback || !feedbackText.trim() || rating === 0 || !feedbackEventId}
                  className="primary-button text-lg px-8 py-3"
                >
                  {submittingFeedback ? "Submitting..." : "Submit Feedback"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;
