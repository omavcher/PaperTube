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
              src="/pro/step/11.avif"
              alt="Copy YouTube link"
              width={500}
              height={500}
              className="h-24 md:h-44 lg:h-60 w-full rounded-lg object-cover shadow-lg"
            />
            <img
              src="/pro/step/12.avif"
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
              src="/pro/step/21.avif"
              alt="Paste YouTube link on PaperTube"
              width={500}
              height={500}
              className="h-24 md:h-44 lg:h-60 w-full rounded-lg object-cover shadow-lg"
            />
            <img
              src="/pro/step/22.avif"
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
          <div className="grid grid-cols-1 gap-4">
            <img
              src="/pro/step/3.avif"
              alt="AI generated notes preview"
              width={500}
              height={500}
              className="h-24 md:h-44 lg:h-60 w-[70%] rounded-lg object-cover shadow-lg"
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
          <div className="grid grid-cols-1 gap-4">
            <img
              src="/pro/step/4.avif"
              alt="PDF preview"
              width={500}
              height={500}
              className="h-64 md:h-64 lg:h-80 w-[35%] lg:w-[35%] rounded-lg object-cover shadow-lg"
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
