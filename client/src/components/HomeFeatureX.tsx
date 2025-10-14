"use client";

import { BookOpen, Brain, FileText, Timer, Lightbulb } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

export function HomeFeatureX() {
  return (
    <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
      
      <GridItem
        area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
        icon={<BookOpen className="h-4 w-4 text-[#FB4B04]" />}
        title="Learn Smarter, Not Harder"
        description="Paste your favorite YouTube lectures — our AI instantly transforms them into structured notes, visuals, and summaries."
      />

      <GridItem
        area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
        icon={<Brain className="h-4 w-4 text-[#FB4B04]" />}
        title="AI That Understands Education"
        description="Trained on top academic data — it identifies key topics, timestamps, and explanations that matter most."
      />

      <GridItem
        area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
        icon={<FileText className="h-4 w-4 text-[#FB4B04]" />}
        title="Beautiful Notes in One Click"
        description="Get clean, aesthetic PDFs — with summaries, timestamps, and AI-generated concept images for each topic."
      />

      <GridItem
        area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
        icon={<Timer className="h-4 w-4 text-[#FB4B04]" />}
        title="Save Time, Study Deep"
        description="Stop pausing and writing manually. Let AI summarize your lecture and create study material in seconds."
      />

      <GridItem
        area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
        icon={<Lightbulb className="h-4 w-4 text-[#FB4B04]" />}
        title="Built for Students by Learners"
        description="We know the struggle of last-minute revision — that’s why Placcademy turns your learning videos into smart, ready-to-revise notes."
      />
    </ul>
  );
}

interface GridItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
}

const GridItem = ({ area, icon, title, description }: GridItemProps) => {
  return (
    <li className={`min-h-[14rem] list-none ${area}`}>
      <div className="relative h-full rounded-2xl border border-neutral-800 bg-neutral-950 p-2 md:rounded-3xl md:p-3 hover:border-[#FB4B04]/50 transition-all duration-300">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
        />
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6 dark:shadow-[0px_0px_27px_0px_#2D2D2D]">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit rounded-lg border border-[#FB4B04]/40 p-2 bg-neutral-900">
              {icon}
            </div>
            <div className="space-y-3">
              <h3 className="font-sans text-xl/[1.375rem] font-semibold text-white md:text-2xl/[1.875rem]">
                {title}
              </h3>
              <p className="font-sans text-sm/[1.125rem] text-neutral-400 md:text-base/[1.375rem]">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};
