import { Link } from "react-router-dom";
import {
  Calendar,
  Users,
  TrendingUp,
  Sparkles,
  Play,
  ChevronRight,
  Target,
  Zap,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Home = () => {
  const features = [
    {
      icon: Calendar,
      title: "Smart Event Planning",
      description:
        "AI-powered event recommendations and automated scheduling to optimize your event calendar.",
    },
    {
      icon: Users,
      title: "Enhanced Engagement",
      description:
        "Interactive features and personalized content to boost student participation and engagement.",
    },
    {
      icon: TrendingUp,
      title: "Analytics & Insights",
      description:
        "Real-time analytics and detailed insights to measure event success and improve future planning.",
    },
    {
      icon: Sparkles,
      title: "Seamless Experience",
      description:
        "Intuitive interface designed specifically for educational institutions and student communities.",
    },
  ];

  const stats = [
    { value: "10K+", label: "Active Students" },
    { value: "500+", label: "Events Created" },
    { value: "95%", label: "Satisfaction Rate" },
    { value: "24/7", label: "AI Support" },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-emerald-50/50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold text-[#111827] mb-6 leading-tight">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
                CampusSync AI
              </span>
            </h1>
            <p className="text-xl text-[#6B7280] mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your educational events with AI-powered management.
              Streamline planning, boost engagement, and create memorable
              experiences for your student community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              
              
              <Link to="/events">
                <Button size="lg" className="primary-button px-8 py-4 text-lg font-semibold">
                  Explore Events
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link to="/register">
                <Button
                  size="lg"
                  className="glass-button text-indigo-600 px-8 py-4 text-lg font-semibold"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>

          {/* Demo Video Section */}
          <div className="max-w-4xl mx-auto">
            <Card className="glass-card overflow-hidden">
              <CardContent className="p-0">
                <div className="relative bg-gradient-to-br from-indigo-100/80 to-emerald-100/80 h-80 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-emerald-500/10 backdrop-blur-sm"></div>
                  <Button
                    size="lg"
                    className="relative z-10 glass-button text-indigo-600 h-20 w-20 p-0 animate-glow"
                  >
                    <Play className="h-8 w-8 ml-1" />
                  </Button>
                  <div className="absolute bottom-6 left-6 text-[#111827]">
                    <h3 className="text-xl font-semibold">
                      See CampusSync AI in Action
                    </h3>
                    <p className="text-[#6B7280]">2:30 min demo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-indigo-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-[#6B7280] font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#111827] mb-6">
              Why Choose CampusSync AI?
            </h2>
            <p className="text-xl text-[#6B7280] max-w-2xl mx-auto">
              Discover the features that make event management effortless and
              engaging for educational institutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="glass-card text-center group">
                  <CardHeader>
                    <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-2xl w-fit shadow-lg group-hover:animate-float">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl text-[#111827]">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-[#6B7280] leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Flat Illustrations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            <div className="text-center">
              <div className="w-36 h-36 mx-auto mb-6 glass-card flex items-center justify-center group">
                <Target className="h-16 w-16 text-indigo-600 group-hover:animate-float" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-2">
                Smart Scheduling
              </h3>
              <p className="text-[#6B7280]">AI-powered calendar optimization</p>
            </div>

            <div className="text-center">
              <div className="w-36 h-36 mx-auto mb-6 glass-card flex items-center justify-center group">
                <TrendingUp className="h-16 w-16 text-emerald-600 group-hover:animate-float" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-2">
                ML Analytics
              </h3>
              <p className="text-[#6B7280]">Data-driven event insights</p>
            </div>

            <div className="text-center">
              <div className="w-36 h-36 mx-auto mb-6 glass-card flex items-center justify-center group">
                <Zap className="h-16 w-16 text-indigo-600 group-hover:animate-float" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-2">
                Smart Feedback
              </h3>
              <p className="text-[#6B7280]">AI-powered sentiment analysis</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#111827] mb-6">
              Powerful Dashboards for Everyone
            </h2>
            <p className="text-xl text-[#6B7280]">
              Role-based interfaces designed for organizers and students
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="glass-card overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-emerald-500 p-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Organizer Dashboard
                </h3>
                <p className="text-indigo-100">
                  Complete event management suite
                </p>
              </div>
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 glass-button">
                    <span className="font-medium text-[#111827]">
                      Create Events
                    </span>
                    <div className="w-12 h-6 bg-indigo-200 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between p-4 glass-button">
                    <span className="font-medium text-[#111827]">
                      ML Analytics
                    </span>
                    <div className="w-12 h-6 bg-emerald-200 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between p-4 glass-button">
                    <span className="font-medium text-[#111827]">
                      Student Matching
                    </span>
                    <div className="w-12 h-6 bg-indigo-200 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-indigo-500 p-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Student Dashboard
                </h3>
                <p className="text-emerald-100">Personalized event discovery</p>
              </div>
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 glass-button">
                    <span className="font-medium text-[#111827]">
                      Recommended Events
                    </span>
                    <div className="w-12 h-6 bg-emerald-200 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between p-4 glass-button">
                    <span className="font-medium text-[#111827]">
                      Smart Feedback
                    </span>
                    <div className="w-12 h-6 bg-indigo-200 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between p-4 glass-button">
                    <span className="font-medium text-[#111827]">
                      Community Hub
                    </span>
                    <div className="w-12 h-6 bg-emerald-200 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-emerald-500"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Events?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of educational institutions already using Smart Event
            Hub to create amazing experiences.
          </p>
          <Link to="/register">
            <Button
              size="lg"
              className="glass-button text-indigo-600 px-8 py-4 text-lg font-semibold"
            >
              Start Your Journey
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
