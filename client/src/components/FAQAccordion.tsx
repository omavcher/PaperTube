"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How to convert a YouTube video to notes using AI?",
    answer:
      "To convert a YouTube video to notes, simply paste the video link into the search bar at the top of Paperxify. Our system extracts the transcript, structures it into detailed concepts, embeds relevant visual aids, and outputs study-ready notes.",
  },
  {
    question: "What is the best AI notes from YouTube link tool?",
    answer:
      "Paperxify is the leading YouTube link-to-notes AI. Unlike standard summarizers, it allows you to choose visual theme layouts, chat with the notes using model selector layers (like DeepSeek V4 Flash), practice with quizzes, and download water-free PDFs.",
  },
  {
    question: "Why is Paperxify better than alternatives like NoteGPT?",
    answer:
      "NoteGPT prints out simple, flat text-based transcripts. Paperxify gives you full visual layout formats, customizable font styling matching the theme, a dedicated code solution compiler, and direct Notion synchronization features.",
  },
  {
    question: "Can I generate notes from YouTube links for free?",
    answer:
      "Yes, Paperxify is free to try with no initial sign-up required. Simply paste your YouTube URL to get started. The free Flash model quickly constructs structured outline notes and key points for all students.",
  },
  {
    question: "Does it support multi-language lecture video files?",
    answer:
      "Yes. Paperxify understands speech in English, German (Deutsch), Spanish (Español), French (Français), Hindi, and other major languages, automatically generating structured summaries in the selected output language.",
  },
  {
    question: "Can I synchronize note pages directly with Notion?",
    answer:
      "Yes! Pro and Power tier subscribers can synchronize their generated study notes directly to their Notion workspaces with a single click inside the export dialog, keeping their personal wikis organized automatically.",
  },
];

interface FAQAccordionProps {
  faqs?: FAQItem[];
}

export function FAQAccordion({ faqs: customFaqs }: FAQAccordionProps) {
  const displayFaqs = customFaqs || faqs;
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full max-w-6xl mx-auto py-16">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
        {/* Left Side - Large Title */}
        <div className="lg:w-1/3">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-none">
            Frequently
            <br />
            asked questions
          </h2>
        </div>

        {/* Right Side - Accordion */}
        <div className="lg:w-2/3 flex flex-col">
          {displayFaqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className={cn(
                  "border-b border-white/10 py-5 first:pt-0 last:border-b-0",
                )}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-start text-left gap-4 group focus:outline-none"
                >
                  <div className="mt-1 flex-shrink-0 text-blue-500 transition-transform duration-300">
                    {isOpen ? (
                      <Minus size={20} strokeWidth={2.5} />
                    ) : (
                      <Plus size={20} strokeWidth={2.5} />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-lg sm:text-xl font-medium text-white group-hover:text-neutral-200 transition-colors">
                      {faq.question}
                    </span>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed pt-1">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
