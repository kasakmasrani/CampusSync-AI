import { useState } from "react";

import {
  Calendar,
  MapPin,
  Users,
  Tag,
  Upload,
  Sparkles,
  ArrowLeft,
  Clock,
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const CreateEvent = () => {
  const { toast } = useToast();
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "",
    targetYear: "",
    department: "",
    maxCapacity: "",
    tags: [],
  });

  const [currentTag, setCurrentTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mlPrediction, setMlPrediction] = useState(null);
  const [poster, setPoster] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const accessToken = localStorage.getItem("access_token");
  const categories = [
    "Technology",
    "Cultural",
    "Sports",
    "Academic",
    "Professional",
    "Workshop",
    "Seminar",
    "Competition",
  ];

  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year", "All Years"];
  const departments = [
    "Computer Science",
    "Engineering",
    "Business",
    "Arts",
    "Science",
    "All Departments",
  ];
  const [schedule, setSchedule] = useState([{ time: "", activity: "" }]);
  const handleScheduleChange = (idx, field, value) => {
    setSchedule((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const handleAddSchedule = () => {
    setSchedule((prev) => [...prev, { time: "", activity: "" }]);
  };

  const handleRemoveSchedule = (idx) => {
    setSchedule((prev) => prev.filter((_, i) => i !== idx));
  };
  const handleInputChange = (field, value) => {
    setEventData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddTag = () => {
    if (currentTag.trim()) {
      const newTags = currentTag
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0 && !eventData.tags.includes(tag));

      setEventData((prev) => ({
        ...prev,
        tags: [...prev.tags, ...newTags],
      }));
      setCurrentTag(""); // clear input
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setEventData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handlePosterUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPoster(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Inside handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!eventData.title || !eventData.date || !eventData.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("title", eventData.title);
    formData.append("description", eventData.description);
    formData.append("date", eventData.date);
    formData.append("time", eventData.time);
    formData.append("location", eventData.location);
    formData.append("category", eventData.category);
    formData.append("target_year", eventData.targetYear);
    formData.append("department", eventData.department);
    formData.append("max_capacity", parseInt(eventData.maxCapacity));

    if (poster) {
      formData.append("poster", poster);
    }

    if (eventData.tags && eventData.tags.length > 0) {
      eventData.tags.forEach((tag) => {
        formData.append("tags", tag);
      });
    }

    try {
      const response = await fetch("http://localhost:8000/api/predict/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to generate prediction");
      }

      const result = await response.json();

      // ML prediction returned from backend
      setMlPrediction({
        successRate: result.success_rate,
        expectedAttendees: result.expected_attendees,
        engagement: result.engagement,
        sentiment: result.sentiment,
      });

      const fullForm = new FormData();
      for (const [key, value] of Object.entries(eventData)) {
        if (key === "maxCapacity") {
          fullForm.append("max_capacity", parseInt(value));
        } else if (key === "targetYear") {
          fullForm.append("target_year", value);
        } else if (key === "tags") {
          value.forEach((tag) => {
            fullForm.append("tags", tag);
          });
        } else {
          fullForm.append(key, value);
        }
      }

      fullForm.append("success_rate", result.success_rate);
      fullForm.append("expected_attendees", result.expected_attendees);
      fullForm.append("engagement", result.engagement);
      fullForm.append("sentiment", result.sentiment);
      if (poster) fullForm.append("poster", poster);

      
      if (schedule.length > 0) {
        schedule.forEach((item, idx) => {
          fullForm.append(`schedule[${idx}][time]`, item.time);
          fullForm.append(`schedule[${idx}][activity]`, item.activity);
        });
      }
      console.log("🔥 FINAL FORM DATA:");
      for (let pair of fullForm.entries()) {
        console.log(pair[0], pair[1]);
      }
      const res = await fetch("http://localhost:8000/api/events/create/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: fullForm,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("🔥 BAD REQUEST:", errorText);
        throw new Error(`Event creation failed: ${res.status}`);
      }

      toast({
        title: "Event Created Successfully! 🎉",
        description: `Your event "${eventData.title}" has been created with ${result.success_rate}% predicted success rate.`,
      });
    } catch (error) {
      if (error.response) {
        console.log("🔥 Backend responded with:", await error.response.json());
      }
      toast({
        title: "Error Creating Event",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/organizer-dashboard">
            <Button
              variant="outline"
              size="sm"
              className="border-indigo-200 hover:bg-indigo-50 text-indigo-700 bg-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-semibold text-slate-800 mb-2">
              Create New Event
            </h1>
            <p className="text-slate-600">
              Fill in the details below to create an engaging event for students
            </p>
          </div>
        </div>

        {/* Main Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-800">Event Details</CardTitle>
                <CardDescription>
                  Provide basic information about your event
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Event Title */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="title"
                      className="text-slate-700 font-medium"
                    >
                      Event Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="Enter event title"
                      value={eventData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      className="border-slate-200 focus:border-indigo-400 bg-white placeholder:text-slate-400"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-slate-700 font-medium"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your event..."
                      value={eventData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      className="border-slate-200 focus:border-indigo-400 bg-white placeholder:text-slate-400"
                      rows={4}
                    />
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="date"
                        className="text-slate-700 font-medium"
                      >
                        Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={eventData.date}
                        onChange={(e) =>
                          handleInputChange("date", e.target.value)
                        }
                        className="border-slate-200 focus:border-indigo-400 bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="time"
                        className="text-slate-700 font-medium"
                      >
                        Time
                      </Label>
                      <Input
                        id="time"
                        type="time"
                        value={eventData.time}
                        onChange={(e) =>
                          handleInputChange("time", e.target.value)
                        }
                        className="border-slate-200 focus:border-indigo-400 bg-white"
                      />
                    </div>
                  </div>

                  {/* Location & Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="location"
                        className="text-slate-700 font-medium"
                      >
                        Location
                      </Label>
                      <Input
                        id="location"
                        placeholder="Event location"
                        value={eventData.location}
                        onChange={(e) =>
                          handleInputChange("location", e.target.value)
                        }
                        className="border-slate-200 focus:border-indigo-400 bg-white placeholder:text-slate-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="category"
                        className="text-slate-700 font-medium"
                      >
                        Category <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={eventData.category}
                        onValueChange={(value) =>
                          handleInputChange("category", value)
                        }
                      >
                        <SelectTrigger className="border-slate-200 focus:border-indigo-400 bg-white">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-white shadow-lg border border-gray-200">
                          {categories.map((category) => (
                            <SelectItem
                              key={category}
                              value={category.toLowerCase()}
                            >
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Target Audience */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="targetYear"
                        className="text-slate-700 font-medium"
                      >
                        Target Year
                      </Label>
                      <Select
                        value={eventData.targetYear}
                        onValueChange={(value) =>
                          handleInputChange("targetYear", value)
                        }
                      >
                        <SelectTrigger className="border-slate-200 focus:border-indigo-400 bg-white">
                          <SelectValue placeholder="Select target year" />
                        </SelectTrigger>
                        <SelectContent className="bg-white shadow-lg border border-gray-200">
                          {years.map((year) => (
                            <SelectItem key={year} value={year.toLowerCase()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="department"
                        className="text-slate-700 font-medium"
                      >
                        Department
                      </Label>
                      <Select
                        value={eventData.department}
                        onValueChange={(value) =>
                          handleInputChange("department", value)
                        }
                      >
                        <SelectTrigger className="border-slate-200 focus:border-indigo-400 bg-white">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent className="bg-white shadow-lg border border-gray-200">
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept.toLowerCase()}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Max Capacity */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="maxCapacity"
                      className="text-slate-700 font-medium"
                    >
                      Maximum Capacity
                    </Label>
                    <Input
                      id="maxCapacity"
                      type="number"
                      placeholder="Enter maximum number of attendees"
                      value={eventData.maxCapacity}
                      onChange={(e) =>
                        handleInputChange("maxCapacity", e.target.value)
                      }
                      className="border-slate-200 focus:border-indigo-400 bg-white placeholder:text-slate-400"
                    />
                  </div>

                  {/* Event Tags */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="tags"
                      className="text-slate-700 font-medium"
                    >
                      Event Tags
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="tags"
                        placeholder="Add a tag"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), handleAddTag())
                        }
                        className="border-slate-200 focus:border-indigo-400 bg-white placeholder:text-slate-400"
                      />
                      <Button
                        type="button"
                        onClick={handleAddTag}
                        variant="outline"
                        className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        <Tag className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {eventData.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="border-slate-200 text-slate-700"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-2 text-slate-500 hover:text-slate-700"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {/* Event Schedule */}
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">
                      Event Schedule
                    </Label>
                    {schedule.map((item, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <Input
                          type="time"
                          value={item.time}
                          onChange={(e) =>
                            handleScheduleChange(idx, "time", e.target.value)
                          }
                          className="border-slate-200 bg-white"
                          placeholder="Time"
                          required
                        />
                        <Input
                          type="text"
                          value={item.activity}
                          onChange={(e) =>
                            handleScheduleChange(
                              idx,
                              "activity",
                              e.target.value
                            )
                          }
                          className="border-slate-200 bg-white"
                          placeholder="Activity"
                          required
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => handleRemoveSchedule(idx)}
                          disabled={schedule.length === 1}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddSchedule}
                    >
                      + Add Schedule Item
                    </Button>
                  </div>
                  {/* Poster Upload */}

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">
                      Event Poster
                    </p>

                    {/* Label as dropzone AND clickable area */}
                    <label
                      htmlFor="poster-upload"
                      className="block w-full border-2 border-dashed border-slate-300 rounded-lg p-6 text-center bg-white cursor-pointer hover:border-slate-400 transition-all"
                    >
                      <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600 mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-slate-500">
                        PNG, JPG up to 10MB
                      </p>

                      <input
                        id="poster-upload"
                        type="file"
                        accept="image/*"
                        onChange={handlePosterUpload}
                        className="hidden"
                      />
                    </label>

                    {poster && (
                      <p className="text-sm text-slate-600">
                        Selected: {poster.name}
                      </p>
                    )}
                    {previewUrl && (
                      <div className="mt-2">
                        <img
                          src={previewUrl}
                          alt="Poster Preview"
                          className="w-full max-h-64 object-contain border border-slate-200 rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                        Creating Event...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Create Event with AI Insights
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* AI Prediction Sidebar */}
          <div className="space-y-6">
            {/* Preview Card */}
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-800 text-lg">
                  Event Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-slate-600" />
                  <span className="text-slate-600">
                    {eventData.date || "Select date"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-slate-600" />
                  <span className="text-slate-600">
                    {eventData.time || "Select time"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-slate-600" />
                  <span className="text-slate-600">
                    {eventData.location || "Add location"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-slate-600" />
                  <span className="text-slate-600">
                    {eventData.maxCapacity || "0"} max attendees
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* ML Prediction Results */}
            {mlPrediction && (
              <Card className="bg-white/80 backdrop-blur-sm border border-emerald-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-slate-800 text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-600" />
                    AI Predictions
                  </CardTitle>
                  <CardDescription>
                    ML-powered insights for your event
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-700">
                      {mlPrediction.successRate}%
                    </div>
                    <div className="text-sm text-emerald-600">Success Rate</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-indigo-50 rounded-lg">
                      <div className="text-lg font-semibold text-indigo-700">
                        {mlPrediction.expectedAttendees}
                      </div>
                      <div className="text-xs text-indigo-600">
                        Expected Attendees
                      </div>
                    </div>
                    <div className="text-center p-3 bg-emerald-50 rounded-lg">
                      <div className="text-lg font-semibold text-emerald-700">
                        {mlPrediction.engagement}%
                      </div>
                      <div className="text-xs text-emerald-600">Engagement</div>
                    </div>
                  </div>

                  <div className="text-center p-3 bg-indigo-50 rounded-lg">
                    <div className="text-sm font-medium text-indigo-700">
                      Predicted Sentiment: {mlPrediction.sentiment}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 text-center">
                    {/* TODO: Use ML model prediction from Python here */}
                    Predictions powered by machine learning algorithms
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
