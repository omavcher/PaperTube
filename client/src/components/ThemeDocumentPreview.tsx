"use client";

import React from 'react';
import { NoteTheme } from '@/config/themes';
import { cn } from '@/lib/utils';
import { Sparkles, Lightbulb, Layers } from 'lucide-react';

interface MiniThemeDocumentPreviewProps {
  theme: NoteTheme;
  className?: string;
}

/**
 * Lightweight, deterministic miniature study note document preview.
 * Renders realistic headings, body lines, callout card, and bullets in the theme's colors and fonts.
 */
export function MiniThemeDocumentPreview({ theme, className }: MiniThemeDocumentPreviewProps) {
  return (
    <div 
      className={cn(
        "w-full h-full rounded-xl p-3 flex flex-col justify-between overflow-hidden select-none transition-transform duration-200 text-left relative",
        className
      )}
      style={{
        backgroundColor: theme.bg,
        color: theme.text,
        fontFamily: theme.font || 'sans-serif',
        borderColor: theme.border,
      }}
    >
      {/* Mini top chapter header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span 
            className="text-[7.5px] font-extrabold uppercase tracking-wider px-1 py-0.5 rounded leading-none"
            style={{ 
              backgroundColor: `${theme.primary}18`, 
              color: theme.primary 
            }}
          >
            Chapter 01
          </span>
          <span 
            className="text-[7px] font-mono opacity-60"
            style={{ color: theme.accent }}
          >
            Study Notes
          </span>
        </div>

        {/* Title */}
        <h4 
          className="text-[11px] font-black tracking-tight leading-tight line-clamp-1 mt-0.5"
          style={{ color: theme.primary }}
        >
          Neural Networks
        </h4>

        {/* Subhead / Section rule */}
        <div 
          className="h-[1px] w-full my-1 opacity-70"
          style={{ backgroundColor: theme.border }}
        />

        {/* Realistic body text representation */}
        <div className="space-y-0.5">
          <p 
            className="text-[7.5px] leading-tight opacity-80 line-clamp-2"
            style={{ color: theme.text }}
          >
            Computational models inspired by the brain. Interconnected nodes transform input signals into predictions.
          </p>
        </div>

        {/* Mini Bullets */}
        <div className="space-y-0.5 pt-0.5">
          <div className="flex items-center gap-1 text-[7px] opacity-85">
            <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: theme.accent }} />
            <span className="truncate">Feature extraction layers</span>
          </div>
          <div className="flex items-center gap-1 text-[7px] opacity-85">
            <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: theme.accent }} />
            <span className="truncate">Backpropagation algorithm</span>
          </div>
        </div>
      </div>

      {/* Mini Callout Card */}
      <div 
        className="mt-1 p-1.5 rounded-lg border flex items-start gap-1"
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.border,
          color: theme.text,
        }}
      >
        <span className="text-[8px] shrink-0" style={{ color: theme.primary }}>💡</span>
        <span className="text-[6.5px] font-medium leading-tight opacity-90 line-clamp-1">
          Deep architectures progressively extract hierarchical representations.
        </span>
      </div>
    </div>
  );
}

interface FullThemeDocumentPreviewProps {
  theme: NoteTheme;
  className?: string;
}

/**
 * Large, realistic study note document preview for the Theme Library right-hand inspector.
 * Accurately demonstrates headings, tables, callout blocks, math snippets, and visual slots.
 */
export function FullThemeDocumentPreview({ theme, className }: FullThemeDocumentPreviewProps) {
  return (
    <div 
      className={cn(
        "w-full max-w-2xl rounded-2xl border p-6 sm:p-8 shadow-2xl transition-all duration-300 relative overflow-hidden select-text text-left",
        className
      )}
      style={{
        backgroundColor: theme.bg,
        color: theme.text,
        borderColor: theme.border,
        fontFamily: theme.font || 'sans-serif',
      }}
    >
      {/* Document Top Header Metadata */}
      <div className="space-y-3 pb-4 border-b" style={{ borderColor: theme.border }}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span 
            className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md"
            style={{ 
              backgroundColor: `${theme.primary}15`, 
              color: theme.primary,
              borderColor: `${theme.primary}30`,
            }}
          >
            <Sparkles size={10} /> Chapter 01 &bull; Artificial Intelligence
          </span>
          <span className="text-[9.5px] font-mono font-medium opacity-60" style={{ color: theme.accent }}>
            Paperxify Neural Notes &bull; 12 min read
          </span>
        </div>

        {/* Main Note Title */}
        <h1 
          className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-snug"
          style={{ color: theme.primary }}
        >
          Neural Networks & Deep Learning Architectures
        </h1>

        {/* Subhead meta */}
        <p className="text-xs leading-relaxed opacity-75" style={{ color: theme.text }}>
          A rigorous examination of multi-layer perceptrons, forward propagation, activation functions, and backpropagation gradients.
        </p>
      </div>

      {/* Section 1: Introduction */}
      <div className="space-y-2.5 mt-5">
        <h2 
          className="text-sm sm:text-base font-bold tracking-tight pb-1 border-b"
          style={{ 
            color: theme.primary,
            borderColor: theme.border 
          }}
        >
          1. Introduction & Biological Foundation
        </h2>
        <p className="text-xs sm:text-[13px] leading-relaxed opacity-85" style={{ color: theme.text }}>
          Artificial Neural Networks (ANNs) are computational models inspired by biological neural circuits in the cerebral cortex. Rather than following explicitly programmed conditional statements, neural networks derive internal representations by adjusting parameters across interconnected layers of artificial neurons.
        </p>
      </div>

      {/* Callout / Key Takeaways Box */}
      <div 
        className="my-4 p-3.5 sm:p-4 rounded-xl border flex items-start gap-3"
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.border,
          color: theme.text,
        }}
      >
        <div 
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${theme.primary}20`, color: theme.primary }}
        >
          <Lightbulb size={16} />
        </div>
        <div className="space-y-1 min-w-0">
          <h4 className="text-xs font-extrabold tracking-wide uppercase" style={{ color: theme.primary }}>
            Core Principle &bull; Universal Approximation
          </h4>
          <p className="text-[11.5px] leading-relaxed opacity-90">
            A feedforward network with a single non-linear hidden layer and sufficient neurons can approximate any continuous function on compact subsets of Euclidean space to arbitrary precision.
          </p>
        </div>
      </div>

      {/* Section 2: Layer Types Table */}
      <div className="space-y-2.5 mt-5">
        <h3 className="text-xs sm:text-sm font-bold tracking-tight" style={{ color: theme.primary }}>
          2. Structural Architecture & Layer Functions
        </h3>
        <div 
          className="overflow-hidden rounded-xl border"
          style={{ 
            backgroundColor: theme.cardBg,
            borderColor: theme.border 
          }}
        >
          <table className="w-full text-left text-[11px] sm:text-xs border-collapse">
            <thead>
              <tr className="border-b" style={{ borderColor: theme.border }}>
                <th className="p-2.5 font-bold" style={{ color: theme.primary }}>Layer</th>
                <th className="p-2.5 font-bold" style={{ color: theme.primary }}>Mathematical Function</th>
                <th className="p-2.5 font-bold" style={{ color: theme.primary }}>Pipeline Role</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b" style={{ borderColor: theme.border }}>
                <td className="p-2.5 font-semibold">Input</td>
                <td className="p-2.5 font-mono text-[10px] opacity-80">X \in \mathbb&#123;R&#125;^&#123;d&#125;</td>
                <td className="p-2.5 opacity-85">Ingests feature vector</td>
              </tr>
              <tr className="border-b" style={{ borderColor: theme.border }}>
                <td className="p-2.5 font-semibold">Hidden</td>
                <td className="p-2.5 font-mono text-[10px] opacity-80">\sigma(W^T X + b)</td>
                <td className="p-2.5 opacity-85">Extracts non-linear latent manifolds</td>
              </tr>
              <tr>
                <td className="p-2.5 font-semibold">Output</td>
                <td className="p-2.5 font-mono text-[10px] opacity-80">\text&#123;Softmax&#125;(z)</td>
                <td className="p-2.5 opacity-85">Generates probabilistic inferences</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Bullet points & Link */}
      <div className="space-y-2 mt-5">
        <h3 className="text-xs sm:text-sm font-bold tracking-tight" style={{ color: theme.primary }}>
          3. Optimization & Training Dynamics
        </h3>
        <ul className="space-y-1.5 pl-4 text-xs list-disc" style={{ color: theme.text }}>
          <li className="opacity-90">
            <strong style={{ color: theme.primary }}>Loss Minimization:</strong> Empirical risk reduction utilizing Cross-Entropy loss.
          </li>
          <li className="opacity-90">
            <strong style={{ color: theme.primary }}>Backpropagation:</strong> Reverse-mode automatic differentiation via chain rule tensor products.
          </li>
          <li className="opacity-90">
            <strong style={{ color: theme.primary }}>Adaptive Optimizers:</strong> AdamW gradient updates with momentum decoupling.
          </li>
        </ul>
        <div className="pt-1">
          <a 
            href="#" 
            onClick={(e) => e.preventDefault()}
            className="text-xs font-semibold underline hover:opacity-80 transition-opacity"
            style={{ color: theme.link }}
          >
            Explore Stanford CS229 Deep Learning Lecture Notes &rarr;
          </a>
        </div>
      </div>

      {/* Visual Slot / Diagram Card */}
      <div 
        className="mt-5 p-4 rounded-xl border border-dashed flex flex-col items-center justify-center text-center"
        style={{
          borderColor: theme.border,
          backgroundColor: `${theme.cardBg}60`,
        }}
      >
        <Layers size={22} style={{ color: theme.accent }} className="mb-1.5 opacity-80" />
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80" style={{ color: theme.primary }}>
          Visual Illustration Slot &bull; Layer Signal Flow
        </span>
        <span className="text-[9px] opacity-60 mt-0.5">
          Automatic SVG diagram & chart injection supported in this theme
        </span>
      </div>

      {/* Buttons Demo */}
      <div className="flex items-center gap-2.5 pt-5 mt-5 border-t" style={{ borderColor: theme.border }}>
        <button
          type="button"
          onClick={(e) => e.preventDefault()}
          className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm hover:opacity-90 transition-opacity"
          style={{
            backgroundColor: theme.primary,
            color: theme.btnText || '#ffffff',
          }}
        >
          Export Study Guide
        </button>
        <button
          type="button"
          onClick={(e) => e.preventDefault()}
          className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border bg-transparent hover:opacity-80 transition-opacity"
          style={{
            borderColor: theme.border,
            color: theme.primary,
          }}
        >
          Create Flashcards
        </button>
      </div>
    </div>
  );
}
