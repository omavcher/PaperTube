import React from "react";
import { Timeline } from "@/components/ui/timeline";

export default function HomeLine() {
  const data = [
    {
      title: "Step 1 — Copy the Lecture Link 🎥",
      content: (
        <div>
          <p className="mb-8 text-xs md:text-sm text-neutral-800 dark:text-neutral-200">
            Find any YouTube lecture, class, or podcast that you want to turn into beautiful notes.
            Just copy the video link from YouTube — yes, that’s it! No downloads, no ads.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="/timeline/copy-link.jpg"
              alt="Copy YouTube link"
              width={500}
              height={500}
              className="h-24 md:h-44 lg:h-60 w-full rounded-lg object-cover shadow-lg"
            />
            <img
              src="/timeline/youtube-page.jpg"
              alt="YouTube lecture example"
              width={500}
              height={500}
              className="h-24 md:h-44 lg:h-60 w-full rounded-lg object-cover shadow-lg"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Step 2 — Paste it on PaperTube 🔗",
      content: (
        <div>
          <p className="mb-8 text-xs md:text-sm text-neutral-800 dark:text-neutral-200">
            Go to the PaperTube home page and paste your YouTube link in the input box.
            Our AI instantly starts processing the lecture — analyzing topics, timestamps, and visuals.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="/timeline/paste-link.jpg"
              alt="Paste YouTube link on PaperTube"
              width={500}
              height={500}
              className="h-24 md:h-44 lg:h-60 w-full rounded-lg object-cover shadow-lg"
            />
            <img
              src="/timeline/ai-processing.jpg"
              alt="AI processing notes"
              width={500}
              height={500}
              className="h-24 md:h-44 lg:h-60 w-full rounded-lg object-cover shadow-lg"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Step 3 — Get AI-Generated Notes 🧠",
      content: (
        <div>
          <p className="mb-8 text-xs md:text-sm text-neutral-800 dark:text-neutral-200">
            Within seconds, your lecture is transformed into clear, colorful, and time-stamped notes.
            Every key topic, definition, and timestamp is clickable — perfect for quick revision.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="/timeline/generated-notes.jpg"
              alt="AI generated notes preview"
              width={500}
              height={500}
              className="h-24 md:h-44 lg:h-60 w-full rounded-lg object-cover shadow-lg"
            />
            <img
              src="/timeline/note-details.jpg"
              alt="Notes example layout"
              width={500}
              height={500}
              className="h-24 md:h-44 lg:h-60 w-full rounded-lg object-cover shadow-lg"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Step 4 — Download Beautiful PDF 📄",
      content: (
        <div>
          <p className="mb-8 text-xs md:text-sm text-neutral-800 dark:text-neutral-200">
            Once your notes are ready, just click “Download.”  
            You’ll get a stunning, colorful PDF — organized, readable, and perfect for offline study.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="/timeline/pdf-preview.jpg"
              alt="PDF preview"
              width={500}
              height={500}
              className="h-24 md:h-44 lg:h-60 w-full rounded-lg object-cover shadow-lg"
            />
            <img
              src="/timeline/download-btn.jpg"
              alt="Download PDF"
              width={500}
              height={500}
              className="h-24 md:h-44 lg:h-60 w-full rounded-lg object-cover shadow-lg"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Step 5 — Study Smart, Stay Inspired ✨",
      content: (
        <div>
          <p className="mb-8 text-xs md:text-sm text-neutral-800 dark:text-neutral-200">
            That’s it! Your long lectures are now simplified into quick, smart, and aesthetic notes.
            Whether you’re preparing for exams or just revising concepts, PaperTube saves hours — every single day.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="/timeline/study-session.jpg"
              alt="Study with AI notes"
              width={500}
              height={500}
              className="h-24 md:h-44 lg:h-60 w-full rounded-lg object-cover shadow-lg"
            />
            <img
              src="/timeline/success.jpg"
              alt="Student success image"
              width={500}
              height={500}
              className="h-24 md:h-44 lg:h-60 w-full rounded-lg object-cover shadow-lg"
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="relative w-full overflow-clip">
      <Timeline data={data} />
    </div>
  );
}
