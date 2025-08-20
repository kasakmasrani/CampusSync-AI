import Contact from "./pages/Contact";
import About from "./pages/About";
import Support from "./pages/Support";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";

import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Dashboard from "./pages/Dashboard.jsx";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Settings from "./pages/Settings";
import CreateEvent from "./pages/CreateEvent";
import NotFound from "./pages/NotFound";

import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";


const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-white flex flex-col font-['Poppins',sans-serif]">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />

                <Route path="/events" element={<Events />} />

                <Route path="/events/:id" element={<EventDetail />} />

                <Route path="/dashboard" element={<Dashboard />} />

                <Route
                  path="/organizer-dashboard"
                  element={<OrganizerDashboard />}
                />
                <Route
                  path="/student-dashboard"
                  element={<StudentDashboard />}
                />
                <Route path="/settings" element={<Settings />} />
                <Route path="/create-event" element={<CreateEvent />} />
                <Route path="/login" element={<Login />} />

                <Route path="/register" element={<Register />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/support" element={<Support />} />

                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route
                  path="/reset-password/:uid/:token"
                  element={<ResetPassword />}
                />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
