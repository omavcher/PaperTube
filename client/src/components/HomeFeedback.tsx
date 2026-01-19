"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// 1. Define the data structure
export interface FeedbackData {
  quote: string;
  name: string;
  profileName: string;
  profilePicture?: string;
  location?: string;
  time?: string;
}

// 2. Define the Props (The Fix)
interface FeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (feedback: FeedbackData) => void;
}

export function FeedbackDialog({ isOpen, onClose, onSuccess }: FeedbackDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    quote: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct the feedback object
    const feedback: FeedbackData = {
      name: formData.name,
      profileName: formData.username.startsWith("@") ? formData.username : `@${formData.username}`,
      quote: formData.quote,
      time: new Date().toLocaleDateString(),
    };

    onSuccess(feedback);
    onClose();
    setFormData({ name: "", username: "", quote: "" }); // Reset
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-neutral-950 border-neutral-800 text-white">
        <DialogHeader>
          <DialogTitle>Share Feedback</DialogTitle>
          <DialogDescription className="text-neutral-400">
            Your feedback helps us improve the experience for everyone.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-neutral-900 border-neutral-800"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="@johndoe"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="bg-neutral-900 border-neutral-800"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="quote">Your Thoughts</Label>
            <Textarea
              id="quote"
              placeholder="What did you love about the video-to-notes conversion?"
              value={formData.quote}
              onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
              className="bg-neutral-900 border-neutral-800 min-h-[100px]"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-white text-black hover:bg-neutral-200">
              Submit Feedback
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}