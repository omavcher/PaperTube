"use client";

import React from "react";
import { InfiniteMovingCards } from "./ui/infinite-moving-cards";
import { Star, MessageSquare } from "lucide-react";
import { useRegionConfig } from "@/lib/localization";

interface TestimonialsCarouselProps {
  region?: string;
}

export function TestimonialsCarousel({ region }: TestimonialsCarouselProps) {
  const { testimonials } = useRegionConfig(region);

  // Format reviews list for InfiniteMovingCards
  const formattedTestimonials = testimonials.map(t => ({
    quote: t.quote,
    name: t.name,
    location: t.university,
    time: t.exam, // Subtitle/designation
    ratingValue: String(t.rating)
  }));

  return (
    <section className="space-y-8 font-sans">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[9.5px] font-medium uppercase tracking-wider text-neutral-400">
          <MessageSquare size={11} className="text-neutral-300" />
          <span>Student Stories</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
          Loved by Scholars Worldwide
        </h2>

        <p className="text-xs sm:text-sm text-neutral-400 font-normal leading-relaxed">
          See how students and researchers use Paperxify to save hours every week.
        </p>

        <div className="flex items-center justify-center gap-1 pt-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
          ))}
          <span className="text-[11px] text-neutral-300 font-medium ml-1.5">4.9 / 5.0 Global Rating</span>
        </div>
      </div>

      <div className="flex flex-col antialiased relative overflow-hidden">
        <InfiniteMovingCards
          items={formattedTestimonials}
          direction="left"
          speed="slow"
        />
      </div>
    </section>
  );
}


