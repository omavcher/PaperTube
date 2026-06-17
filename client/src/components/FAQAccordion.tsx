"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useRegionConfig } from "@/lib/localization";

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
  region?: string;
}

export function FAQAccordion({ faqs: customFaqs, region }: FAQAccordionProps) {
  const { config } = useRegionConfig(region);
  const regionExams = config.exams.slice(0, 3).join(", ");
  const regionUnis = config.universities.slice(0, 2).join(" or ");
  const isDe = config.region === "de";

  const defaultFaqs: FAQItem[] = [
    {
      question: isDe
        ? `Wie konvertiert man ein YouTube-Video mit KI in Notizen für das Abitur oder Studium?`
        : `How to convert a YouTube video to study notes for ${config.region === 'global' ? 'exams' : regionExams}?`,
      answer: isDe
        ? `Fügen Sie einfach den Link des YouTube-Videos in das Suchfeld oben ein. Unser System extrahiert das Transkript, strukturiert es in detaillierte Konzepte und mathematische/naturwissenschaftliche Abitur-Themen und gibt sofort lernfertige Notizen aus.`
        : `To convert a YouTube video to notes, simply paste the video link into the search bar at the top of Paperxify. Our system extracts the transcript, structures it into detailed concepts matching ${config.region === 'global' ? 'academic' : regionExams} standards, embeds relevant visual aids, and outputs study-ready notes.`,
    },
    {
      question: isDe
        ? `Was ist das beste YouTube-Link-zu-Notizen KI-Tool für Studenten an der ${config.universities[0]} oder ${config.universities[1]}?`
        : `What is the best AI notes from YouTube link tool for students at ${config.region === 'global' ? 'universities' : regionUnis}?`,
      answer: isDe
        ? `Paperxify ist die führende YouTube-Notizen-KI. Im Gegensatz zu einfachen Transkriptoren können Sie visuelle Layouts wählen, auf Deutsch lernen, mit Übungsfragen passend zum Numerus Clausus üben und wasserzeichenfreie PDFs exportieren.`
        : `Paperxify is the leading YouTube link-to-notes AI. Unlike standard summarizers, it allows students at ${config.region === 'global' ? 'universities worldwide' : regionUnis} to choose visual theme layouts, practice with quizzes matching ${config.region === 'global' ? 'their syllabus' : regionExams}, and download watermark-free PDFs.`,
    },
    {
      question: isDe
        ? `Warum ist Paperxify besser als Alternativen wie NoteGPT?`
        : `Why is Paperxify better than alternatives like NoteGPT?`,
      answer: isDe
        ? `NoteGPT gibt nur einfache, flache Texttranskripte aus. Paperxify bietet strukturierte Formeln, LaTeX-Unterstützung, Code-Kompilierung, interaktive Flowcharts und direkte Notion-Synchronisierung.`
        : `NoteGPT prints out simple, flat text-based transcripts. Paperxify gives you full visual layout formats, customizable font styling matching the theme, a dedicated code solution compiler, and direct Notion synchronization features.`,
    },
    {
      question: isDe
        ? `Kann ich Notizen aus YouTube-Links kostenlos generieren?`
        : `Can I generate notes from YouTube links for free?`,
      answer: isDe
        ? `Ja, Paperxify ist kostenlos und ohne Registrierung nutzbar. Fügen Sie einfach Ihre YouTube-URL ein. Das kostenlose Flash-Modell erstellt schnell gegliederte Notizen und Zusammenfassungen.`
        : `Yes, Paperxify is free to try with no initial sign-up required. Simply paste your YouTube URL to get started. The free Flash model quickly constructs structured outline notes and key points for all students.`,
    },
    {
      question: isDe
        ? `Unterstützt es Vorlesungsvideos in mehreren Sprachen?`
        : `Does it support multi-language lecture video files?`,
      answer: isDe
        ? `Ja. Paperxify versteht Sprache in Deutsch, Englisch, Spanisch, Französisch und anderen wichtigen Sprachen und generiert die Zusammenfassungen automatisch in Ihrer Zielsprache.`
        : `Yes. Paperxify understands speech in English, German (Deutsch), Spanish (Español), French (Français), Hindi, and other major languages, automatically generating structured summaries in the selected output language.`,
    },
    {
      question: isDe
        ? `Kann ich die Notizen direkt mit Notion synchronisieren?`
        : `Can I synchronize note pages directly with Notion?`,
      answer: isDe
        ? `Ja! Abonnenten der Pro- und Power-Stufen können ihre generierten Studiennotizen mit nur einem Klick direkt in ihre Notion-Arbeitsbereiche importieren und so ihr persönliches Wiki aufbauen.`
        : `Yes! Pro and Power tier subscribers can synchronize their generated study notes directly to their Notion workspaces with a single click inside the export dialog, keeping their personal wikis organized automatically.`,
    },
  ];

  const displayFaqs = customFaqs || defaultFaqs;
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full max-w-6xl mx-auto py-8 md:py-16">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
        {/* Left Side - Large Title */}
        <div className="lg:w-1/3">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-none">
            {isDe ? (
              <>
                Häufig
                <br />
                gestellte Fragen
              </>
            ) : (
              <>
                Frequently
                <br />
                asked questions
              </>
            )}
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
