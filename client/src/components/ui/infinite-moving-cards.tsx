"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "normal",
  pauseOnHover = true,
  className,
}: {
  items: {
    quote: string;
    name: string;
    location?: string;
    time?: string;
    profileName?: string;
    profilePicture?: string;
    ratingValue?: string;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);

  useEffect(() => {
    addAnimation();
  }, []);
  const [start, setStart] = useState(false);
  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      setStart(true);
    }
  }
  const getDirection = () => {
    if (containerRef.current) {
      if (direction === "left") {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "forwards",
        );
      } else {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "reverse",
        );
      }
    }
  };
  const getSpeed = () => {
    if (containerRef.current) {
      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "20s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "40s");
      } else {
        containerRef.current.style.setProperty("--animation-duration", "80s");
      }
    }
  };
  
  // Safe function to get profile initial
  const getProfileInitial = (profileName?: string, name?: string) => {
    const source = profileName || name || '';
    return source.charAt(0).toUpperCase();
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className,
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex w-max min-w-full shrink-0 flex-nowrap gap-4 py-4",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]",
        )}
      >
        {items.map((item, idx) => (
          <li
            className="relative w-[320px] sm:w-[380px] md:w-[420px] max-w-full shrink-0 rounded-2xl bg-[#09090c] border border-white/[0.08] hover:border-white/[0.14] p-5 sm:p-6 transition-all duration-200 shadow-sm"
            key={item.name + idx}
          >
            <blockquote className="flex flex-col justify-between h-full">
              <div>
                {item.ratingValue && (
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => {
                      const rating = Number(item.ratingValue);
                      const isFilled = i < rating;
                      return (
                        <Star
                          key={i}
                          size={13}
                          className={isFilled ? "fill-amber-400 text-amber-400" : "text-neutral-700"}
                        />
                      );
                    })}
                  </div>
                )}
                <p className="text-xs sm:text-[13px] leading-relaxed font-normal text-neutral-300">
                  "{item.quote}"
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-white/[0.04] flex items-center gap-3">
                <div className="shrink-0">
                  {item.profilePicture ? (
                    <img 
                      src={item.profilePicture} 
                      alt={item.name}
                      className="w-8 h-8 rounded-full object-cover border border-white/10"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-neutral-300 text-xs font-semibold">
                      {getProfileInitial(item.profileName, item.name)}
                    </div>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 truncate">
                    <span>{item.location}</span>
                    {item.location && item.time && <span>•</span>}
                    <span>{item.time}</span>
                  </div>
                </div>
              </div>
            </blockquote>
          </li>
        ))}
      </ul>
    </div>
  );
};