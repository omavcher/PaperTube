"use client";

import React from "react";
import { InfiniteMovingCards } from "./ui/infinite-moving-cards";

function Testimonials() {
  return (
    <div className="h-auto rounded-md flex flex-col antialiased bg-white dark:bg-black dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden py-8 md:py-12">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <InfiniteMovingCards
          items={testimonials}
          direction="right"
          speed="slow"
        />
      </div>
    </div>
  )
}

const testimonials = [
  {
    quote: "This service completely transformed how I manage my business. The speed and reliability are unmatched!",
    name: "Sarah Johnson",
    profileName: "sarahj",
    profilePicture: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face",
    location: "New York, USA",
    time: "2 hours ago"
  },
  {
    quote: "Incredible experience from start to finish. The team was professional and delivered beyond expectations.",
    name: "Michael Chen",
    profileName: "mchen",
    profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
    location: "Tokyo, Japan",
    time: "5 hours ago"
  },
  {
    quote: "The quality of service is outstanding. I've recommended it to all my colleagues and friends!",
    name: "Emma Rodriguez",
    profileName: "emmar",
    profilePicture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
    location: "London, UK",
    time: "1 day ago"
  },
  {
    quote: "Fast, efficient, and incredibly user-friendly. This has saved me so much time and effort.",
    name: "Alex Thompson",
    profileName: "alexthomp",
    profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
    location: "Sydney, Australia",
    time: "3 hours ago"
  },
  {
    quote: "Outstanding customer support and seamless integration. Couldn't be happier with the results!",
    name: "Priya Patel",
    profileName: "priyap",
    profilePicture: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=64&h=64&fit=crop&crop=face",
    location: "Mumbai, India",
    time: "6 hours ago"
  }
];

export default Testimonials;