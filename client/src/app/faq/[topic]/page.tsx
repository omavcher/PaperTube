import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HelpCircle, ChevronRight, ArrowLeft } from "lucide-react";
import { generateFAQSchema, generateBreadcrumbSchema } from "@/lib/schema-generators";
import { SchemaMarkup } from "@/components/SchemaMarkup";

interface FAQItem {
  question: string;
  answer: string;
}

// 15-20 Questions specifically mapped for the youtube-to-notes tool
const youtubeToNotesFaqs: FAQItem[] = [
  {
    question: "Is Paperxify free?",
    answer: "Yes, Paperxify offers a free tier that lets you summarize YouTube videos up to a certain duration. We also offer premium upgrades for unlimited transcription, customized formatting templates, and advanced features."
  },
  {
    question: "How do I convert a YouTube video to notes?",
    answer: "Simply paste the link of any YouTube lecture or video on Paperxify's search box. Our AI will automatically transcribe the audio, analyze key concepts, and structure them into notes, summaries, and flashcards."
  },
  {
    question: "What formats can I export?",
    answer: "You can export your generated study notes as clean Markdown (.md) files, print-ready PDF documents (featuring Lora and EB Garamond typography), or directly sync them to Notion and Obsidian."
  },
  {
    question: "Does it work with age-restricted videos?",
    answer: "Paperxify can process public YouTube video streams. Age-restricted or private videos require account permissions that standard scrapers can't access, but you can upload text transcripts to our AI study room instead."
  },
  {
    question: "Can I edit the notes after generation?",
    answer: "Yes! Paperxify has a fully-featured markdown editor built-in. You can rewrite sections, add headers, format code blocks, and customize variables before downloading."
  },
  {
    question: "How long does the summarization process take?",
    answer: "Most videos under 30 minutes are fully summarized in less than 30 seconds. Longer lecture streams of 2-3 hours can take up to 2 minutes to generate notes, flashcards, and quizzes."
  },
  {
    question: "Does Paperxify support languages other than English?",
    answer: "Yes! We support transcription and summarization in over 40 languages, including German, Spanish, French, Hindi, and Portuguese, preserving technical keywords accurately."
  },
  {
    question: "Can I generate flashcards automatically?",
    answer: "Absolutely! Paperxify's flashcard creator reads the lecture transcript and extracts key terms, definitions, and equations into study cards that you can study using spaced repetition."
  },
  {
    question: "How accurate is the transcript generator?",
    answer: "Our speech-to-text engine has a 95%+ accuracy rating, specifically trained to recognize academic terminology, coding syntax, and mathematical symbols correctly."
  },
  {
    question: "Can I generate diagram flowcharts from videos?",
    answer: "Yes, Paperxify includes an AI Diagram Maker that turns lecture topics into interactive sequence diagrams, concept maps, and mind maps using Mermaid.js."
  },
  {
    question: "Is there a limit on video length?",
    answer: "Free accounts can summarize videos up to 30 minutes. Premium accounts have no limit and can summarize multi-hour courses and lecture playlists."
  },
  {
    question: "Can I ask questions about the video?",
    answer: "Yes, Paperxify features PaperChat, an active study chat assistant where you can ask questions, request simple explanations, or solve specific parts of the video transcript."
  },
  {
    question: "Does it work on mobile devices?",
    answer: "Yes, Paperxify is fully responsive and optimized for mobile devices, enabling you to study notes and play quiz games on the go."
  },
  {
    question: "Can I share my notes with classmates?",
    answer: "Yes, each note set has a shareable link that allows you to share formatted study guides and active recall quizzes with your peers."
  },
  {
    question: "Are my uploaded videos or transcripts private?",
    answer: "Yes! We prioritize data privacy. Your personal study dashboard and notes are secure and only visible to you unless you explicitly choose to share them."
  }
];

const faqsByTopic: Record<string, { title: string; items: FAQItem[] }> = {
  "youtube-to-notes": {
    title: "YouTube to Notes AI FAQs",
    items: youtubeToNotesFaqs
  }
};

export async function generateStaticParams() {
  return [
    { topic: "youtube-to-notes" }
  ];
}

interface PageProps {
  params: Promise<{ topic: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { topic } = await params;
  const faqData = faqsByTopic[topic];
  if (!faqData) {
    return {
      title: "Frequently Asked Questions | Paperxify"
    };
  }

  return {
    title: `${faqData.title} | Paperxify FAQ`,
    description: `Find answers to frequently asked questions about ${faqData.title}. Learn how to transcribe YouTube videos to study notes, flashcards, and PDFs using Paperxify.`,
    alternates: {
      canonical: `https://paperxify.com/faq/${topic}`,
    }
  };
}

export default async function FAQTopicPage({ params }: PageProps) {
  const { topic } = await params;
  const faqData = faqsByTopic[topic];

  if (!faqData) {
    notFound();
  }

  const faqSchema = generateFAQSchema(faqData.items);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "FAQ", item: `/faq/${topic}` }
  ]);

  return (
    <main className="min-h-screen bg-black text-white relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Dynamic Schema Tags Injection */}
      <SchemaMarkup schema={faqSchema} />
      <SchemaMarkup schema={breadcrumbSchema} />

      {/* Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-red-900/10 via-transparent to-transparent pointer-events-none -z-10 blur-[120px]" />

      <div className="max-w-4xl mx-auto space-y-12">
        {/* Navigation Breadcrumb visually */}
        <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium tracking-tight">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-neutral-500 uppercase font-black">FAQ</span>
          <ChevronRight size={12} />
          <span className="text-white">{faqData.title}</span>
        </div>

        <div className="space-y-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
            {faqData.title}
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base font-light max-w-2xl leading-relaxed">
            Everything you need to know about transcribing and summarizing lectures using Paperxify's artificial intelligence suite.
          </p>
        </div>

        {/* FAQs List */}
        <div className="grid gap-6">
          {faqData.items.map((item, idx) => (
            <div 
              key={idx}
              className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700/60 transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <HelpCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                <div className="space-y-2">
                  <h3 className="text-lg font-black tracking-tight text-white">
                    {item.question}
                  </h3>
                  <p className="text-sm text-neutral-400 font-light leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
