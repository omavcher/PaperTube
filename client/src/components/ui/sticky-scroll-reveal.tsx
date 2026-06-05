"use client";
import React, { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const StickyScroll = ({
  content,
  contentClassName,
}: {
  content: {
    title: string;
    description: string;
    content?: React.ReactNode;
  }[];
  contentClassName?: string;
}) => {
  const [activeCard, setActiveCard] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    container: ref,
    offset: ["start start", "end start"],
  });

  const cardLength = content.length;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / cardLength);
    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint);
        if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
          return index;
        }
        return acc;
      },
      0
    );
    setActiveCard(closestBreakpointIndex);
  });

  const backgroundColors = [
    "rgba(5,5,5,1)",
    "rgba(5,5,5,1)",
    "rgba(5,5,5,1)",
    "rgba(5,5,5,1)",
    "rgba(5,5,5,1)",
  ];

  const linearGradients = [
    "linear-gradient(to bottom right, #ef4444, #f97316)",
    "linear-gradient(to bottom right, #8b5cf6, #ec4899)",
    "linear-gradient(to bottom right, #3b82f6, #06b6d4)",
    "linear-gradient(to bottom right, #10b981, #14b8a6)",
    "linear-gradient(to bottom right, #f59e0b, #ef4444)",
  ];

  const [backgroundGradient, setBackgroundGradient] = useState(
    linearGradients[0]
  );

  useEffect(() => {
    setBackgroundGradient(linearGradients[activeCard % linearGradients.length]);
  }, [activeCard]);

  return (
    <motion.div
      animate={{
        backgroundColor: backgroundColors[activeCard % backgroundColors.length],
      }}
      className="relative flex h-[30rem] justify-around space-x-10 overflow-y-auto rounded-2xl p-10 scrollbar-hide"
      ref={ref}
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <div className="div relative flex items-start px-4">
        <div className="max-w-2xl">
          {content.map((item, index) => (
            <div key={item.title + index} className="my-20">
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: activeCard === index ? 1 : 0.3 }}
                className="text-2xl font-black text-white"
              >
                {item.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: activeCard === index ? 1 : 0.3 }}
                className="text-kg mt-10 max-w-sm text-neutral-400 font-light leading-relaxed"
              >
                {item.description}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{
                  opacity: activeCard === index ? 1 : 0,
                  height: activeCard === index ? "auto" : 0,
                }}
                className={cn(
                  "lg:hidden mt-8 overflow-hidden rounded-2xl w-full aspect-video border border-white/10 bg-neutral-950 transition-all duration-500",
                  activeCard === index ? "block" : "hidden"
                )}
              >
                {item.content ?? null}
              </motion.div>
            </div>
          ))}
          <div className="h-40" />
        </div>
      </div>
      <div
        className={cn(
          "sticky top-10 hidden w-[400px] aspect-video overflow-hidden rounded-2xl lg:block ",
          contentClassName
        )}
      >
        {content[activeCard].content ?? null}
      </div>
    </motion.div>
  );
};
