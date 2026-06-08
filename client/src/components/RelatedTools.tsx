import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { Tool, getRandomAnchor } from "@/lib/internal-linking";

interface RelatedToolsProps {
  tools: Tool[];
}

export function RelatedTools({ tools }: RelatedToolsProps) {
  if (!tools || tools.length === 0) return null;

  return (
    <div className="space-y-6 bg-zinc-900/30 p-6 sm:p-8 rounded-3xl border border-zinc-800/80">
      <div>
        <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
          <Sparkles size={20} className="text-amber-400" />
          Recommended AI Study Tools
        </h3>
        <p className="text-zinc-400 text-sm mt-1">Boost your study productivity with these highly relevant tools.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => {
          const anchorText = getRandomAnchor(tool.id);
          return (
            <div
              key={tool.id}
              className="group relative flex flex-col justify-between p-6 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.03)]"
            >
              <div className="space-y-2">
                <h4 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors">
                  {tool.title}
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Try our specialized <Link href={tool.url} className="text-amber-400/95 hover:text-amber-300 underline font-medium">{anchorText.toLowerCase()}</Link> to optimize your lecture workflows and assignments instantly.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-900/50">
                <Link
                  href={tool.url}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-400 hover:text-white transition-colors group/btn"
                >
                  <span>{tool.cta}</span>
                  <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
