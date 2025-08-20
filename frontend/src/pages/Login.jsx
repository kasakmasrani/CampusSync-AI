
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";



const Login = () => {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch('http://localhost:8000/api/auth/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
      }),
    });

    let data = {};
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error("Unexpected response (non-JSON):", text);
      alert("Unexpected server response.");
      return;
    }

    if (response.ok) {
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.localStorage.setItem("authUpdate", Date.now());
      window.dispatchEvent(new Event("authUpdated"));
      window.dispatchEvent(new Event("storage"));

      if (data.user.role === 'organizer') {
        navigate('/organizer-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } else {
      const errorMsg = data.detail || 'Login failed';
      if (
        errorMsg.toLowerCase().includes("password") ||
        errorMsg.toLowerCase().includes("invalid")
      ) {
        toast({
          title: "Password invalid",
          description: "The password you entered is incorrect.",
          variant: "destructive",
        });
      }
      // Optionally, handle other errors with a generic toast or do nothing
    }
  } catch (error) {
    // Only log unexpected errors, not auth failures
    if (
      error &&
      error.message &&
      (error.message.toLowerCase().includes("password") || error.message.toLowerCase().includes("invalid"))
    ) {
      // Do not log expected auth errors
    } else {
      console.error('Login error:', error);
      toast({
        title: "Login Error",
        description: "An error occurred during login.",
        variant: "destructive",
      });
    }
  }
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-full">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CampusSync AI
            </span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-gray-600">
            Sign in to your account to continue your journey
          </p>
        </div>

        <Card className="glass-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#111827]">Sign In</CardTitle>
            <CardDescription className="text-[#6B7280] text-lg">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <Label htmlFor="email" className="text-[#111827] font-medium">Email Address</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="pl-10 bg-white text-gray-900 placeholder-black-900 rounded-xl h-11 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-900 autofill:shadow-inner"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-[#111827] font-medium">Password</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 bg-white text-gray-900 placeholder-black-900 rounded-xl h-11 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-900 autofill:shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                
                <Link 
                  to="/forgot-password" 
                  className="text-indigo-600 hover:text-indigo-500 font-medium smooth-transition"
                >
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                disabled={
                  !formData.email ||
                  !formData.password
                }
              >
                Sign In
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up now
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
