"use client";
import React from "react";
import { LayoutTextFlip } from "@/components/ui/layout-text-flip";
import { motion } from "motion/react";
import Footer from "@/components/Footer";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";


function Page() {
  return (
    <div className=" w-full">
              <BackgroundRippleEffect />

<div>
  <motion.div className="relative mx-4 my-4 flex flex-col items-center justify-center gap-4 text-center sm:mx-0 sm:mb-0 sm:flex-row">
    <LayoutTextFlip
      text="Explore the Power of "
      words={["PaperTube", "AI Notes", "Smart Learning", "Instant PDFs"]}
    />
  </motion.div>

  <p className="mt-4 text-center text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
    Discover how PaperTube turns your YouTube lectures into clean, clickable, and beautifully formatted notes — all powered by AI.
  </p>
</div>

      
      <Footer/>
    </div>
  );
}

export default Page;