import { useState } from "react";
import { User, Bell, Lock, Trash2, Save, Eye, EyeOff } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  
 

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });


  const handlePasswordReset = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation don't match.",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://localhost:8000/api/auth/change-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        
        
        body: JSON.stringify({
          old_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        toast({
          title: "Password Updated!",
          description: "Your password has been successfully changed.",
        });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const data = await response.json();
        toast({
          title: "Password Change Failed",
          description: data.detail || "Could not update password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Could not connect to server.",
        variant: "destructive",
      });
    }
  };

  
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-800 mb-2">
            Settings
          </h1>
          <p className="text-slate-600">
            Manage your account preferences and settings
          </p>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="security" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white border border-slate-200">
            

            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-800"
            >
              Security
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-800"
            >
              ML Actions
            </TabsTrigger>
          </TabsList>

         
         
          {/* Security Settings */}
          <TabsContent value="security">
            <Card className="bg-white shadow-lg border border-slate-200 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Lock className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Update your password and security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-slate-700">
                      Current Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                        className="border-slate-200 focus:border-indigo-400 bg-white pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-slate-700">
                      New Password
                    </Label>
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      className="border-slate-200 focus:border-indigo-400 bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-700">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className="border-slate-200 focus:border-indigo-400 bg-white"
                    />
                  </div>
                </div>

                <Button
                  onClick={handlePasswordReset}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ML Actions */}
          <TabsContent value="account">
            <Card className="bg-white shadow-lg border border-slate-200 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Save className="h-5 w-5" />
                  ML Actions
                </CardTitle>
                <CardDescription>
                  Retrain machine learning models for event recommendations and clustering.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col gap-4">
                  <Button
                    className="bg-indigo-500 hover:bg-indigo-600 text-white"
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem("access_token");
                        const response = await fetch("http://localhost:8000/api/ml/retrain/predict/", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                        });
                        if (response.ok) {
                          toast({
                            title: "Prediction Model Retraining Started",
                            description: "Event prediction model retraining has been triggered.",
                          });
                        } else {
                          const data = await response.json();
                          toast({
                            title: "Retraining Failed",
                            description: data.detail || "Could not start retraining.",
                            variant: "destructive",
                          });
                        }
                      } catch (error) {
                        toast({
                          title: "Network Error",
                          description: "Could not connect to server.",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Retrain Event Prediction Model
                  </Button>
                  <Button
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem("access_token");
                        // Step 1: Export features
                        const exportResp = await fetch("http://localhost:8000/api/ml/export/student-features/", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                        });
                        if (!exportResp.ok) {
                          const data = await exportResp.json();
                          toast({
                            title: "Export Failed",
                            description: data.detail || "Could not export student features.",
                            variant: "destructive",
                          });
                          return;
                        }
                        // Step 2: Retrain clustering model
                        const retrainResp = await fetch("http://localhost:8000/api/ml/retrain/clustering/", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                        });
                        if (retrainResp.ok) {
                          toast({
                            title: "Clustering Model Retraining Started",
                            description: "Student clustering model retraining has been triggered.",
                          });
                        } else {
                          const data = await retrainResp.json();
                          toast({
                            title: "Retraining Failed",
                            description: data.detail || "Could not start retraining.",
                            variant: "destructive",
                          });
                        }
                      } catch (error) {
                        toast({
                          title: "Network Error",
                          description: "Could not connect to server.",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Retrain Student Clustering Model
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
