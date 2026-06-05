"use client";

import React from "react";
import { InfiniteMovingCards } from "./ui/infinite-moving-cards";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "Paperxify is the best ai notes from yt link tool on the market. I use it daily for my high-level algorithms classes. The formatting handles markdown code blocks and quotes beautifully.",
    name: "David Miller",
    location: "US",
    time: "CS Major, Stanford University",
    profileName: "David",
  },
  {
    quote:
      "Hervorragend! Ich lade meine deutschen Vorlesungs-Links hoch und erhalte perfekte strukturierte Notizen. Die Übersetzungen und Fachbegriffe werden extrem präzise übersetzt. Definitiv besser als NoteGPT.",
    name: "Lukas Weber",
    location: "DE",
    time: "Engineering Student, TU Munich",
    profileName: "Lukas",
  },
  {
    quote:
      "Paperxify has optimized my lecture study flow. Generating flashcards directly from long lecture streams allows me to recall equations and definitions on the train. Truly elite tool.",
    name: "Sarah Jenkins",
    location: "AU",
    time: "Medical Student, University of Melbourne",
    profileName: "Sarah",
  },
  {
    quote:
      "I love the custom document styling. I can print my notes in Lora or EB Garamond sepia themes which matches my paper planner. An essential study tool for college kids.",
    name: "Emily Tremblay",
    location: "CA",
    time: "Biology Sophomore, McGill University",
    profileName: "Emily",
  },
  {
    quote:
      "The active study chat (PaperChat) solves any confusion. I ask it to explain tricky parts of the lecture in simple terms and it instantly uses the transcript as context.",
    name: "James Sterling",
    location: "UK",
    time: "Economics Student, LSE",
    profileName: "James",
  },
  {
    quote:
      "Paperxify is the fastest youtube notes generator. Instant transcription, excellent quiz integration, and beautiful visual templates. 10/10 recommend.",
    name: "Elena Rostova",
    location: "Global",
    time: "Product Manager & Continuous Learner",
    profileName: "Elena",
  },
];

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
          items={testimonials}
          direction="left"
          speed="slow"
        />
      </div>
    </section>
  );
}
