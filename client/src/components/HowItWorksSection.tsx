"use client";

import React from "react";
import { StickyScroll } from "./ui/sticky-scroll-reveal";

export function HowItWorksSection({ mode = 'notes' }: { mode?: 'notes' | 'flashcards' | 'test' }) {
  const getStep4Title = () => {
    if (mode === 'flashcards') return "Flashcards Are Generated Instantly";
    if (mode === 'test') return "Practice Tests Are Generated Instantly";
    return "Notes Are Generated Instantly";
  };

  const getStep4Desc = () => {
    if (mode === 'flashcards') {
      return "Watch Paperxify build your flashcard deck in real time. It extracts core questions and answers directly from the transcript, structuring them for active recall.";
    }
    if (mode === 'test') {
      return "Watch Paperxify construct your custom practice tests in real time. It generates multiple choice, fill in the blanks, or multi-select questions with step-by-step solutions.";
    }
    return "Watch Paperxify build your notes in real time with an active audio-wave progress indicator. The output includes structured headings, bullet points, code blocks, definitions, and curated contextual images automatically embedded within the document.";
  };

  const getStep5Title = () => {
    if (mode === 'flashcards') return "Study, Edit, Review & Export";
    if (mode === 'test') return "Practice, Review Answers & Track Progress";
    return "Study, Chat, Quiz & Export";
  };

  const getStep5Desc = () => {
    if (mode === 'flashcards') {
      return "Your flashcards are now ready for study. Practice with our spaced repetition scheduler, edit questions, or export your deck directly to Notion or other formats.";
    }
    if (mode === 'test') {
      return "Test yourself with the interactive quiz interface. View instant feedback, expand answers to see explanation keys, and lock in concepts before exams.";
    }
    return "Your notes are now your study hub. Use PaperChat to ask questions directly about the video's content. Test your recall with AI-generated active-recall quizzes. Sync directly to your Notion workspace in one click, or export a watermark-free, high-quality PDF in your chosen theme.";
  };

  const getStepFolder = () => {
    if (mode === 'flashcards') return 'youtube-to-flashcards';
    if (mode === 'test') return 'youtube-to-quiz';
    return 'youtube-to-notes';
  };

  const folder = getStepFolder();

  const steps = [
    {
      title: "Step 1 — Paste Your YouTube URL",
      description:
        "Copy any YouTube video link — a lecture, tutorial, documentary, or podcast — and paste it directly into Paperxify's input bar. Our system instantly detects video metadata, duration, and available transcript pathways. No account needed to start.",
    },
    {
      title: "Step 2 — Choose Your Style, Theme & Model",
      description:
        "Before generation, personalize your output. Pick from 20+ premium note themes — sepia, minimalist, dark scholar, cream — and pair it with a font like Lora, EB Garamond, or Inter. Select an AI model that fits your depth needs: Flash for fast summaries, Scholar or Atlas for deep academic breakdowns.",
    },
    {
      title: "Step 3 — AI Extracts & Processes the Transcript",
      description:
        "Paperxify's backend instantly fetches the video transcript and sends it through our AI pipeline. Advanced models like DeepSeek V4 Flash, GPT-4o, Claude, or Gemini parse the raw text, identify key concepts, extract definitions, and structure the content into logical academic sections — all within seconds.",
    },
    {
      title: getStep4Title(),
      description: getStep4Desc(),
    },
    {
      title: getStep5Title(),
      description: getStep5Desc(),
    },
  ];

  const content = steps.map((step, index) => {
    const stepNumber = index + 1;
    return {
      title: step.title,
      description: step.description,
      content: (
        <div className="w-full h-full overflow-hidden relative group">
          <img
            src={`/${folder}/step${stepNumber}.png`}
            alt={`${step.title} Preview`}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      ),
    };
  });

  const getHeaderTitle = () => {
    if (mode === 'flashcards') return "How Paperxify YouTube flashcard generator works";
    if (mode === 'test') return "How Paperxify YouTube practice test maker works";
    return "How Paperxify YouTube notes generator works";
  };

  const getHeaderDesc = () => {
    if (mode === 'flashcards') return "Five intelligent steps from raw video link to fully styled, exportable flashcard decks.";
    if (mode === 'test') return "Five intelligent steps from raw video link to fully styled, customizable quizzes and mock exams.";
    return "Five intelligent steps from raw video link to fully styled, exportable study notes.";
  };

  return (
    <section className="space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          {getHeaderTitle()}
        </h2>
        <p className="text-neutral-400 text-xs sm:text-sm font-light">
          {getHeaderDesc()}
        </p>
      </div>
      <StickyScroll content={content} />
    </section>
  );
}
