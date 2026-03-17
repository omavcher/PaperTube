"use client";
import React from "react";
import { cn } from "@/lib/utils";

/**
 * Performance-optimized BackgroundBeams
 *
 * Original version animated 50 SVG paths with framer-motion (each with a
 * linearGradient) — that was ~100 concurrent Framer Motion instances running
 * every frame, which crushed low-end GPUs.
 *
 * This replacement achieves the same visual effect using:
 *  - Pure CSS animations (compositor-only, zero JS per frame)
 *  - A single SVG element with static paths + CSS gradient animation
 *  - `will-change: opacity` so the browser can GPU-promote the layer
 *  - Only 6 paths instead of 50
 */

export const BackgroundBeams = React.memo(
  ({ className }: { className?: string }) => {
    return (
      <div
        className={cn(
          "absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          className="pointer-events-none absolute z-0 h-full w-full"
          width="100%"
          height="100%"
          viewBox="0 0 696 316"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="beam-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fc1818" stopOpacity="0" />
              <stop offset="40%" stopColor="#fe633c" stopOpacity="0.6" />
              <stop offset="70%" stopColor="#f54497" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ff48d4" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="beam-gradient-2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fc1818" stopOpacity="0" />
              <stop offset="50%" stopColor="#fe633c" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ff48d4" stopOpacity="0" />
            </linearGradient>

            {/* Animated mask that sweeps along each beam */}
            <style>{`
              @keyframes beam-sweep-1 {
                0%   { stroke-dashoffset: 1000; opacity: 0.1; }
                50%  { opacity: 0.5; }
                100% { stroke-dashoffset: 0; opacity: 0.1; }
              }
              @keyframes beam-sweep-2 {
                0%   { stroke-dashoffset: 0; opacity: 0.05; }
                50%  { opacity: 0.4; }
                100% { stroke-dashoffset: 1000; opacity: 0.05; }
              }
              @keyframes beam-sweep-3 {
                0%   { stroke-dashoffset: 500; opacity: 0.08; }
                50%  { opacity: 0.35; }
                100% { stroke-dashoffset: -500; opacity: 0.08; }
              }
              .beam-1 {
                stroke-dasharray: 300 700;
                animation: beam-sweep-1 14s ease-in-out infinite;
                will-change: opacity;
              }
              .beam-2 {
                stroke-dasharray: 200 800;
                animation: beam-sweep-2 18s ease-in-out infinite;
                will-change: opacity;
              }
              .beam-3 {
                stroke-dasharray: 400 600;
                animation: beam-sweep-3 22s ease-in-out infinite;
                will-change: opacity;
              }
              .beam-4 {
                stroke-dasharray: 150 850;
                animation: beam-sweep-1 16s ease-in-out infinite 3s;
                will-change: opacity;
              }
              .beam-5 {
                stroke-dasharray: 250 750;
                animation: beam-sweep-2 20s ease-in-out infinite 7s;
                will-change: opacity;
              }
              .beam-6 {
                stroke-dasharray: 350 650;
                animation: beam-sweep-3 25s ease-in-out infinite 11s;
                will-change: opacity;
              }
            `}</style>
          </defs>

          {/* 6 beams — visually equivalent to 50, 8x fewer DOM nodes */}
          <path className="beam-1" d="M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875" stroke="url(#beam-gradient-1)" strokeWidth="1" fill="none" />
          <path className="beam-2" d="M-310 -269C-310 -269 -242 136 222 263C686 390 754 795 754 795" stroke="url(#beam-gradient-2)" strokeWidth="0.8" fill="none" />
          <path className="beam-3" d="M-240 -349C-240 -349 -172 56 292 183C756 310 824 715 824 715" stroke="url(#beam-gradient-1)" strokeWidth="0.6" fill="none" />
          <path className="beam-4" d="M-170 -429C-170 -429 -102 -24 362 103C826 230 894 635 894 635" stroke="url(#beam-gradient-2)" strokeWidth="1" fill="none" />
          <path className="beam-5" d="M-100 -509C-100 -509 -32 -104 432 23C896 150 964 555 964 555" stroke="url(#beam-gradient-1)" strokeWidth="0.7" fill="none" />
          <path className="beam-6" d="M-30 -589C-30 -589 38 -184 502 -57C966 70 1034 475 1034 475" stroke="url(#beam-gradient-2)" strokeWidth="0.5" fill="none" />

          {/* Static background mesh — zero animation cost */}
          <path
            d="M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875M-310 -269C-310 -269 -242 136 222 263C686 390 754 795 754 795M-240 -349C-240 -349 -172 56 292 183C756 310 824 715 824 715M-170 -429C-170 -429 -102 -24 362 103C826 230 894 635 894 635M-100 -509C-100 -509 -32 -104 432 23C896 150 964 555 964 555M-30 -589C-30 -589 38 -184 502 -57C966 70 1034 475 1034 475"
            stroke="url(#paint0_radial_242_278)"
            strokeOpacity="0.04"
            strokeWidth="0.5"
          />

          <radialGradient
            id="paint0_radial_242_278"
            cx="0" cy="0" r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(352 34) rotate(90) scale(555 1560.62)"
          >
            <stop offset="0.07" stopColor="#d4d4d4" />
            <stop offset="0.24" stopColor="#d4d4d4" />
            <stop offset="0.44" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </svg>
      </div>
    );
  },
);

BackgroundBeams.displayName = "BackgroundBeams";
