"use client";

import React, { useState } from "react";
import { Plus, Minus, Headphones, Sparkles, Mail, MessageSquare, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useRegionConfig } from "@/lib/localization";
import Link from "next/link";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs?: FAQItem[];
  region?: string;
}

export function FAQAccordion({ faqs: customFaqs, region }: FAQAccordionProps) {
  const { config } = useRegionConfig(region);

  const defaultFaqs: FAQItem[] = [
    {
      question: "How does Paperxify turn YouTube videos into notes?",
      answer:
        "Our AI analyzes the video transcript, extracts key concepts, mathematical formulas, and definitions, and structures them into organized study notes, lecture summaries, and flashcards in seconds.",
    },
    {
      question: "What formats can I generate and export?",
      answer:
        "You can generate LaTeX-formatted study notes, interactive quizzes, PowerPoint presentations (PPT), digital flashcard decks (compatible with Anki), mind maps, and clean PDF documents.",
    },
    {
      question: "Are mathematical formulas and LaTeX syntax supported?",
      answer:
        "Yes! Paperxify has native LaTeX rendering. Equations, theorems, code snippets, and chemical diagrams are parsed and formatted cleanly for STEM courses.",
    },
    {
      question: "Can I generate notes in multiple languages?",
      answer:
        "Paperxify supports over 30+ languages, including English, Spanish, German, French, Hindi, Japanese, and more. You can input videos in any language and export in your preferred language.",
    },
    {
      question: "Can I export directly to Notion or Anki?",
      answer:
        "Yes, Pro and Power tier users can sync study decks to Anki, export Markdown directly into Notion workspaces, and download ready-to-present PPT slides.",
    },
    {
      question: "Is my study data and uploaded material private?",
      answer:
        "Your privacy is our priority. All processed notes and transcripts are encrypted in transit and at rest. We never sell user data or train public models on your private documents.",
    },
    {
      question: "Can I cancel my subscription at any time?",
      answer:
        "Yes. You can cancel your subscription anytime with a single click from your Account Settings. You will retain access until the end of your current billing period.",
    },
    {
      question: "What is your refund policy?",
      answer:
        "We offer a 7-day money-back guarantee on all paid plans. If you are not completely satisfied, contact our support team within 7 days for a prompt refund.",
    },
  ];

  const displayFaqs = customFaqs || defaultFaqs;
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 font-sans">
      
      {/* Main Grid Section (Laptop 2 Columns, Mobile 1 Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
        
        {/* ─── LEFT COLUMN: Title & Still Have Questions Card ─── */}
        <div className="lg:col-span-5 text-center lg:text-left flex flex-col justify-between h-full">
          <div>
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[9.5px] font-medium uppercase tracking-wider text-neutral-400 mb-3 sm:mb-4">
              <span>Frequently Asked Questions</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Questions & <br className="hidden sm:inline" />
              <span className="text-[#ef4444]">Answers.</span>
            </h2>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-neutral-400 font-normal leading-relaxed mt-2 sm:mt-4 max-w-md mx-auto lg:mx-0">
              Everything you need to know about Paperxify, AI synthesis tools, exports, and academic workflows.
            </p>
          </div>

          {/* Support Card (Desktop) */}
          <div className="hidden lg:block mt-8">
            <div className="rounded-2xl bg-[#09090c] border border-white/[0.08] p-5 shadow-sm">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-300 shrink-0">
                  <Headphones size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Need personal help?</h3>
                  <p className="text-xs text-neutral-400 mt-0.5 leading-normal">
                    Our team responds to all student inquiries within a few hours.
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <Link
                  href="mailto:support@paperxify.com"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white font-medium text-xs transition-all cursor-pointer"
                >
                  <span>Contact Support</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>

        </div>


        {/* ─── RIGHT COLUMN: Accordion Items (01 - 08) ─── */}
        <div className="lg:col-span-7 space-y-2 sm:space-y-2.5">
          {displayFaqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className={cn(
                  "rounded-2xl transition-all duration-200 overflow-hidden cursor-pointer",
                  isOpen
                    ? "bg-[#09090c] border border-white/[0.16] shadow-sm p-4 sm:p-5"
                    : "bg-[#09090c] border border-white/[0.07] hover:border-white/[0.14] p-4 sm:p-5"
                )}
                onClick={() => toggleFAQ(index)}
              >
                {/* Header Row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-neutral-500 font-medium text-xs sm:text-sm font-mono shrink-0 w-6">
                      {pad(index + 1)}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight leading-snug">
                      {faq.question}
                    </h3>
                  </div>

                  {/* Plus / Minus Toggle Button */}
                  <div className={cn(
                    "w-7 h-7 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                    isOpen
                      ? "border-white/20 text-white bg-white/[0.08]"
                      : "border-white/[0.08] text-neutral-400 hover:border-white/20 hover:text-white"
                  )}>
                    {isOpen ? <Minus size={12} /> : <Plus size={12} />}
                  </div>
                </div>

                {/* Animated Answer Body */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 mt-3 border-t border-white/[0.06]">
                        <p className="text-xs sm:text-[13px] text-neutral-400 font-normal leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>


      {/* ─── BOTTOM FULL-WIDTH BANNER: Still have questions? ─── */}
      <div className="mt-8 sm:mt-12 rounded-2xl bg-[#09090c] border border-white/[0.08] p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left Side: Icon + Heading */}
        <div className="flex items-center gap-3 w-full md:w-auto text-left">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-200 shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Can’t find what you are looking for?
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Reach out to our support team and we will get back to you within 24 hours.
            </p>
          </div>
        </div>

        {/* Right Side: Email Us & Live Chat Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-stretch md:justify-end shrink-0">
          <Link
            href="mailto:support@paperxify.com"
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white text-xs font-medium transition-all cursor-pointer"
          >
            <Mail size={13} />
            <span>Email Support</span>
          </Link>

          <Link
            href="mailto:support@paperxify.com"
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#ef4444] hover:bg-[#dc2626] text-white text-xs font-medium transition-all cursor-pointer active:scale-98"
          >
            <MessageSquare size={13} />
            <span>Live Help</span>
          </Link>
        </div>

      </div>

    </section>
  );
}
