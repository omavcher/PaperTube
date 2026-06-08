"use client";

import React from "react";
import { InfiniteMovingCards } from "./ui/infinite-moving-cards";
import { Star } from "lucide-react";
import { reviews } from "@/data/reviews";

export function TestimonialsCarousel() {
  return (
    <section className="space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">Worldwide User Feedback</h2>
        <p className="text-neutral-400 text-xs sm:text-sm font-light">See what students and academic professionals from leading regions say about Paperxify.</p>
        <div className="flex items-center justify-center gap-1.5 pt-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
          ))}
          <span className="text-xs text-neutral-400 font-bold ml-2">Trusted Globally</span>
        </div>
      </div>

      <div className="flex flex-col antialiased relative overflow-hidden rounded-3xl">
        <InfiniteMovingCards
          items={reviews}
          direction="left"
          speed="slow"
        />
      </div>
    </section>
  );
}

