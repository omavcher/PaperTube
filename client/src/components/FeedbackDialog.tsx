// components/FeedbackDialog.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, Send, User, MapPin, Loader2, Mail, CheckCircle } from "lucide-react";
import { LoginDialog } from "./LoginDialog";

interface FeedbackData {
  quote: string;
  name: string;
  email: string;
  profileName: string;
  profilePicture?: string;
  location?: string;
  time?: string;
  rating: number;
}

interface FeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (feedback: FeedbackData) => void;
}

interface LocationData {
  city: string;
  region: string;
  country: string;
}

// Your Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyBcHKEijvUBqqfYbZsftydNYmaYNVoZDJVxDh2ZgqdbiDbbX2_EKzSgXUxsdjQ-jbu/exec';

export function FeedbackDialog({ isOpen, onClose, onSuccess }: FeedbackDialogProps) {
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [formData, setFormData] = useState({
    quote: "",
    name: "",
    email: "",
    location: "",
  });

  // Use useMemo to prevent unnecessary recreations of user object
  const user = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }, []);

  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  // Get user location using IP API
  const getUserLocation = async (): Promise<string> => {
    try {
      setIsGettingLocation(true);
      const response = await fetch('https://ipapi.co/json/');
      const data: LocationData = await response.json();
      
      const locationParts = [];
      if (data.city) locationParts.push(data.city);
      if (data.region && data.region !== data.city) locationParts.push(data.region);
      if (data.country) locationParts.push(data.country);
      
      return locationParts.join(', ');
    } catch (error) {
      console.error('Failed to get location:', error);
      return '';
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Initialize form data with user info and location
  useEffect(() => {
    const initializeFormData = async () => {
      if (user?.name || user?.email) {
        const newFormData = {
          quote: "",
          name: user.name || "",
          email: user.email || "",
          location: "",
        };

        // Auto-fill location if user is logged in
        if (token) {
          const location = await getUserLocation();
          newFormData.location = location;
        }

        setFormData(newFormData);
      }
    };

    if (isOpen) {
      initializeFormData();
      setIsSuccess(false); // Reset success state when dialog opens
    }
  }, [user?.name, user?.email, token, isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGetLocation = async () => {
    const location = await getUserLocation();
    if (location) {
      setFormData(prev => ({
        ...prev,
        location
      }));
    }
  };

  // Save feedback to Google Sheets
  const saveToGoogleSheets = async (feedback: Omit<FeedbackData, 'profileName'>): Promise<boolean> => {
  try {
    // Option A: Use a CORS proxy
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const response = await fetch(proxyUrl + GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedback),
    });

    // Option B: Or use your own proxy route if you have a backend
    // const response = await fetch('/api/feedback', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(feedback),
    // });

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error saving to Google Sheets:', error);
    return false;
  }
};

  const handleSubmit = async () => {
    if (!token) {
      setIsLoginDialogOpen(true);
      return;
    }

    if (!formData.quote.trim()) {
      alert("Please enter your feedback");
      return;
    }

    if (!formData.email.trim()) {
      alert("Please enter your email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackData = {
        quote: formData.quote,
        name: formData.name || user?.name || "Anonymous",
        email: formData.email,
        location: formData.location,
        rating: rating,
        profilePicture: user?.picture,
        time: "Just now"
      };

      // Save to Google Sheets
      const savedToSheets = await saveToGoogleSheets(feedbackData);

      if (!savedToSheets) {
        throw new Error('Failed to save feedback to Google Sheets');
      }

      const completeFeedback: FeedbackData = {
        ...feedbackData,
        profileName: formData.email, // Using email as profileName
      };

      onSuccess?.(completeFeedback);
      setIsSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        setRating(0);
        setFormData({
          quote: "",
          name: user?.name || "",
          email: user?.email || "",
          location: "",
        });
        setIsSuccess(false);
        onClose();
      }, 2000);

    } catch (error) {
      console.error("Feedback submission error:", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoginDialogOpen(false);
    window.location.reload();
  };

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-black dark:text-white">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl text-center font-semibold">
              Thank You!
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <p className="text-center text-neutral-600 dark:text-neutral-400">
              Your feedback has been submitted successfully!
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-black dark:text-white max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl text-center font-semibold">
              Share Your Feedback
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Rating Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">How would you rate your experience?</Label>
              <div className="flex justify-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= (hoverRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-neutral-300 dark:text-neutral-600"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Textarea */}
            <div className="space-y-3">
              <Label htmlFor="feedback" className="text-sm font-medium">
                Your Feedback
              </Label>
              <Textarea
                id="feedback"
                placeholder="Tell us what you loved, what could be better, or any suggestions you have..."
                value={formData.quote}
                onChange={(e) => handleInputChange("quote", e.target.value)}
                className="min-h-[120px] resize-none bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 placeholder:text-neutral-500 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
              />
            </div>

            {/* User Info Section */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Display Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                  />
                </div>
              </div>
              
              {/* Location with auto-detect button */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="location" className="text-sm font-medium">
                    Location
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGetLocation}
                    disabled={isGettingLocation}
                    className="h-8 text-xs"
                  >
                    {isGettingLocation ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    ) : (
                      <MapPin className="w-3 h-3 mr-1" />
                    )}
                    Auto-detect
                  </Button>
                </div>
                <Input
                  id="location"
                  placeholder="Your location will be auto-detected"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                />
                <p className="text-xs text-neutral-500">
                  Your approximate location helps us understand our user distribution
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.quote.trim() || !formData.email.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Send className="w-4 h-4" />
                  <span>{token ? "Submit Feedback" : "Login to Submit"}</span>
                </div>
              )}
            </Button>

            {/* Login Prompt */}
            {!token && (
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <User className="w-4 h-4" />
                  <span>Login required to submit feedback</span>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <LoginDialog
        isOpen={isLoginDialogOpen}
        onClose={() => setIsLoginDialogOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
}