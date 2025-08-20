import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Calendar,
  User,
  Home,
  Layout,
  LogOut,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setCurrentUser(null);
          setLoading(false);
          return;
        }

        const response = await fetch(
          "http://localhost:8000/api/auth/profile/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
        } else {
          // If token is invalid, clear storage
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();

    // Listen for auth changes
    const handleStorageChange = () => fetchCurrentUser();
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("authUpdated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authUpdated", handleStorageChange);
    };
  }, []);

  const isActive = (path) => location.pathname === path;

  // Role-based navigation items
  const getNavItems = () => {
    if (!currentUser) {
      return [
        { path: "/", label: "Home", icon: Home },
        { path: "/events", label: "Events", icon: Calendar },
      ];
    }

    if (currentUser.role === "organizer") {
      return [
        { path: "/", label: "Home", icon: Home },
        { path: "/events", label: "Events", icon: Calendar },
        { path: "/organizer-dashboard", label: "Dashboard", icon: Layout },
      ];
    } else {
      return [
        { path: "/", label: "Home", icon: Home },
        { path: "/events", label: "Events", icon: Calendar },
        { path: "/student-dashboard", label: "Dashboard", icon: Layout },
      ];
    }
  };

  const navItems = getNavItems();


  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");

      const response = await fetch("http://localhost:8000/api/auth/logout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      let resData = null;
      try {
        resData = await response.json();
      } catch (err) {
        console.warn("Failed to parse JSON logout response");
      }

      if (!response.ok) {
        console.error("Logout failed:", resData?.detail || "Unknown error");
      } else {
        console.log("✅ Logout successful:", resData?.detail);
      }

      // Clear local storage regardless
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");

      window.dispatchEvent(new Event("authUpdated"));
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return null; // Or return a loading spinner
  }

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-r from-indigo-500 to-emerald-500 p-2 rounded-2xl shadow-lg group-hover:shadow-xl smooth-transition group-hover:scale-105">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-[#111827] group-hover:text-indigo-600 smooth-transition">
              CampusSync AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-2xl font-medium smooth-transition ${
                    isActive(item.path)
                      ? "text-indigo-600 bg-indigo-50 shadow-sm"
                      : "text-[#6B7280] hover:text-indigo-600 hover:bg-indigo-50/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-3">
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="glass-button flex items-center gap-3 hover:bg-indigo-50"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-md">
                      {currentUser.first_name?.charAt(0) ||
                        currentUser.email?.charAt(0) ||
                        "U"}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-[#111827]">
                        {currentUser.first_name || currentUser.email || "User"}
                      </div>
                      <Badge className="bg-indigo-100 text-indigo-600 rounded-full px-2 py-0.5 text-xs border-0 capitalize">
                        {currentUser.role || "user"}
                      </Badge>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 glass-card border-gray-200/50"
                >
                  {currentUser.role === "organizer" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link
                          to="/settings"
                          className="flex items-center rounded-xl px-2 py-1.5 text-sm text-gray-800 hover:text-indigo-600 hover:bg-indigo-50 focus:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:text-indigo-600"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-200 my-1" />
                    </>
                  )}
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 rounded-xl px-2 py-1.5 text-sm hover:text-red-700 hover:bg-red-50 focus:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:text-red-700"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#6B7280] hover:text-indigo-600 rounded-2xl smooth-transition"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="primary-button">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-2xl text-[#6B7280] hover:text-indigo-600 hover:bg-indigo-50 smooth-transition"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200/50 glass-card mt-2 mb-4 rounded-2xl">
            <div className="px-4 pt-4 pb-6 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-2xl font-medium smooth-transition ${
                      isActive(item.path)
                        ? "text-indigo-600 bg-indigo-50"
                        : "text-[#6B7280] hover:text-indigo-600 hover:bg-indigo-50/50"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Mobile Auth Section */}
              {currentUser ? (
                <div className="px-4 py-6 border-t border-gray-200/50 mt-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-medium shadow-md">
                      {currentUser.first_name?.charAt(0) ||
                        currentUser.email?.charAt(0) ||
                        "U"}
                    </div>
                    <div>
                      <p className="font-medium text-[#111827]">
                        {currentUser.first_name || currentUser.email || "User"}
                      </p>
                      <Badge className="bg-indigo-100 text-indigo-600 rounded-full px-2 py-1 text-xs border-0 capitalize">
                        {currentUser.role || "user"}
                      </Badge>
                    </div>
                  </div>

                  {currentUser.role === "organizer" && (
                    <Link to="/settings" onClick={() => setIsOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full mb-3 glass-button border-gray-200/50 text-gray-800 hover:text-indigo-700 hover:bg-indigo-50 rounded-2xl"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Button>
                    </Link>
                  )}

                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full bg-transparent border border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-2xl smooth-transition"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-3 px-4 py-6 border-t border-gray-200/50 mt-4">
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-2xl hover:bg-indigo-50 text-[#6B7280] hover:text-indigo-600"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)}>
                    <Button className="primary-button w-full">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
