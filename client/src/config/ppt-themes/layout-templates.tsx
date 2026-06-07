import React from "react";
import { 
  Sparkles, Layers, List, Columns, BarChart2, Star, CheckCircle, 
  Plus, Minus, Info, Calendar, ArrowRight, Quote,
  ChevronRight, Map, Image as ImageIcon
} from "lucide-react";
import { ThemeColors, ThemeLayoutVariant } from "./types";

export const createThemeLayouts = (colors: ThemeColors) => ({
  title: [
    {
      id: "hero-centered",
      name: "Hero Centered",
      render: (slide: any) => (
        <div className="text-center space-y-6 max-w-3xl mx-auto py-8">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-neutral-200">
            {slide.title}
          </h1>
          <div 
            className="h-1 w-24 mx-auto rounded-full" 
            style={{ backgroundColor: colors.primary, boxShadow: `0 0 10px ${colors.primary}` }}
          />
          {slide.subtitle && (
            <p className="text-sm sm:text-base text-neutral-300/80 font-light tracking-wide max-w-xl mx-auto leading-relaxed">
              {slide.subtitle}
            </p>
          )}
          {slide.author && (
            <p className="text-xs uppercase font-mono tracking-widest pt-2" style={{ color: colors.primary }}>
              // {slide.author}
            </p>
          )}
        </div>
      )
    },
    {
      id: "left-split",
      name: "Left Split Layout",
      render: (slide: any) => (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center text-left py-6">
          <div className="md:col-span-8 space-y-4">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
              {slide.title}
            </h1>
            {slide.subtitle && (
              <p className="text-sm sm:text-md font-medium" style={{ color: colors.accent }}>
                {slide.subtitle}
              </p>
            )}
            {slide.author && (
              <p className="text-xs text-neutral-400 font-mono pt-1">{slide.author}</p>
            )}
          </div>
          <div 
            className="md:col-span-4 p-6 rounded-2xl border flex flex-col justify-center items-center text-center shadow-lg"
            style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}
          >
            <Sparkles className="mb-2 animate-pulse" style={{ color: colors.primary }} size={28} />
            <span className="text-[10px] font-black tracking-widest text-neutral-450 uppercase">Interactive Deck</span>
            <span className="text-[9px] text-neutral-500 mt-1">Paperxify Presentation Room</span>
          </div>
        </div>
      )
    }
  ],
  section_break: [
    {
      id: "chapter-divide",
      name: "Modern Divider",
      render: (slide: any) => (
        <div className="text-left py-12 max-w-2xl border-l-4 pl-6 space-y-4" style={{ borderColor: colors.primary }}>
          <span className="font-mono uppercase tracking-widest text-xs font-black" style={{ color: colors.primary }}>Next Chapter</span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p className="text-xs sm:text-sm text-neutral-450 font-light max-w-lg leading-relaxed">
              {slide.subtitle}
            </p>
          )}
        </div>
      )
    }
  ],
  conclusion: [
    {
      id: "summary-takeaways",
      name: "Summary Takeaways",
      render: (slide: any) => (
        <div className="space-y-6 text-left">
          <h2 className="text-xl sm:text-3xl font-black tracking-tight border-l-3 pl-4" style={{ color: colors.primary, borderColor: colors.primary }}>
            {slide.title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {slide.bullets?.map((bullet: string, idx: number) => (
              <div 
                key={idx} 
                className="p-4 rounded-xl border flex gap-3 items-center"
                style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}
              >
                <CheckCircle style={{ color: colors.accent }} size={16} />
                <p className="text-xs sm:text-sm text-neutral-200 font-light">{bullet}</p>
              </div>
            ))}
          </div>
        </div>
      )
    }
  ],
  bullets: [
    {
      id: "clean-list",
      name: "Clean Sidebar List",
      render: (slide: any) => (
        <div className="space-y-5 text-left">
          <h2 className="text-xl sm:text-3xl font-black tracking-tight border-l-3 pl-4" style={{ color: colors.primary, borderColor: colors.primary }}>
            {slide.title}
          </h2>
          <ul className="space-y-3.5 pl-5 text-xs sm:text-sm md:text-base text-neutral-300 leading-relaxed font-light list-disc">
            {slide.bullets?.map((bullet: string, idx: number) => (
              <li key={idx} className="hover:text-white transition-colors pl-1" style={{ markerColor: colors.primary } as any}>
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      )
    },
    {
      id: "grid-cards",
      name: "Grid Layout Cards",
      render: (slide: any) => (
        <div className="space-y-6 text-left">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {slide.title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {slide.bullets?.map((bullet: string, idx: number) => (
              <div 
                key={idx} 
                className="p-4 rounded-xl border flex gap-2.5 items-start shadow-md transition-all hover:scale-[1.01]"
                style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}
              >
                <span 
                  className="w-5 h-5 rounded-full border font-mono text-[9px] font-black flex items-center justify-center shrink-0"
                  style={{ color: colors.accent, borderColor: colors.border, backgroundColor: `${colors.primary}10` }}
                >
                  0{idx + 1}
                </span>
                <p className="text-[11px] sm:text-xs text-neutral-300 font-light leading-relaxed">
                  {bullet}
                </p>
              </div>
            ))}
          </div>
        </div>
      )
    }
  ],
  paragraph: [
    {
      id: "reading-panel",
      name: "Focus Reading Panel",
      render: (slide: any) => (
        <div className="space-y-4 text-left max-w-3xl">
          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
            {slide.title}
          </h2>
          <div className="p-5 rounded-2xl border shadow-xl" style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-light whitespace-pre-wrap">
              {slide.content}
            </p>
          </div>
        </div>
      )
    }
  ],
  quote: [
    {
      id: "block-quote-card",
      name: "Testimonial Card",
      render: (slide: any) => (
        <div className="max-w-2xl mx-auto py-4 text-center space-y-4">
          <Quote className="mx-auto opacity-30" style={{ color: colors.primary }} size={40} />
          <blockquote className="text-lg sm:text-2xl font-medium italic leading-snug" style={{ color: colors.text }}>
            "{slide.quote_text}"
          </blockquote>
          <div className="flex flex-col items-center pt-2">
            <span className="text-xs sm:text-sm font-bold text-white">{slide.author}</span>
            {slide.role && (
              <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase mt-0.5">{slide.role}</span>
            )}
          </div>
        </div>
      )
    }
  ],
  two_column_text: [
    {
      id: "split-columns",
      name: "Double Columns",
      render: (slide: any) => (
        <div className="space-y-5 text-left h-full flex flex-col justify-center">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: colors.primary }}>
            {slide.title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005]">
              <p className="text-[11px] sm:text-xs text-neutral-350 leading-relaxed font-light whitespace-pre-wrap">
                {slide.left_text}
              </p>
            </div>
            <div className="p-4 rounded-xl border" style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}>
              <p className="text-[11px] sm:text-xs leading-relaxed font-light whitespace-pre-wrap" style={{ color: colors.text }}>
                {slide.right_text}
              </p>
            </div>
          </div>
        </div>
      )
    }
  ],
  comparison: [
    {
      id: "standard-split",
      name: "Standard Split Cards",
      render: (slide: any) => (
        <div className="space-y-5 h-full flex flex-col justify-center text-left">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight pl-1" style={{ color: colors.primary }}>
            {slide.title}
          </h2>
          <div className="grid grid-cols-2 gap-6 pt-2">
            <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2.5">
              <span className="text-[11px] font-mono text-neutral-500 block border-b border-white/5 pb-1">
                {slide.columns?.left[0]}
              </span>
              <ul className="space-y-2 text-[11px] sm:text-xs text-neutral-300 font-light list-disc pl-3">
                {slide.columns?.left.slice(1).map((item: string, idx: number) => (
                  <li key={idx} className="marker:text-neutral-600">{item}</li>
                ))}
              </ul>
            </div>
            <div 
              className="p-4 rounded-xl border space-y-2.5 shadow-lg"
              style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}
            >
              <span className="text-[11px] font-mono block border-b pb-1" style={{ color: colors.accent, borderColor: colors.border }}>
                {slide.columns?.right[0]}
              </span>
              <ul className="space-y-2 text-[11px] sm:text-xs text-neutral-300 font-light list-disc pl-3">
                {slide.columns?.right.slice(1).map((item: string, idx: number) => (
                  <li key={idx} className="marker:text-neutral-450" style={{ color: colors.text }}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )
    }
  ],
  pros_cons: [
    {
      id: "green-red-split",
      name: "Pros vs Cons Split",
      render: (slide: any) => (
        <div className="space-y-4 text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-white">{slide.title}</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-950/5 space-y-3">
              <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono font-black uppercase tracking-wider">
                <Plus size={14} /> Advantages
              </span>
              <ul className="space-y-2 text-[11px] sm:text-xs text-neutral-305 pl-3 list-disc">
                {slide.pros?.map((pro: string, idx: number) => (
                  <li key={idx} className="marker:text-emerald-500">{pro}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-xl border border-red-500/10 bg-red-950/5 space-y-3">
              <span className="flex items-center gap-1.5 text-red-400 text-xs font-mono font-black uppercase tracking-wider">
                <Minus size={14} /> Limitations
              </span>
              <ul className="space-y-2 text-[11px] sm:text-xs text-neutral-305 pl-3 list-disc">
                {slide.cons?.map((con: string, idx: number) => (
                  <li key={idx} className="marker:text-red-500">{con}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )
    }
  ],
  metric_callout: [
    {
      id: "three-cols-metric",
      name: "Multi-Metric Row",
      render: (slide: any) => (
        <div className="space-y-5 text-left h-full flex flex-col justify-center">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {slide.title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {slide.metrics?.map((m: any, idx: number) => (
              <div 
                key={idx} 
                className="p-4 rounded-xl border flex flex-col items-center justify-center text-center"
                style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}
              >
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-300" style={{ backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.accent})` }}>
                  {m.value}
                </span>
                <span className="text-[10px] font-bold text-neutral-450 uppercase mt-1 tracking-wider">
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    }
  ],
  matrix_2x2: [
    {
      id: "swot-quads",
      name: "Four Quadrants Grid",
      render: (slide: any) => (
        <div className="space-y-4 text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-white">{slide.title}</h2>
          <div className="grid grid-cols-2 gap-3 aspect-[2.2/1]">
            {slide.quadrants?.map((quad: string, idx: number) => {
              return (
                <div 
                  key={idx} 
                  className="p-3.5 border rounded-xl flex flex-col justify-center"
                  style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}
                >
                  <p className="text-[11px] sm:text-xs text-neutral-200 leading-relaxed font-light">{quad}</p>
                </div>
              );
            })}
          </div>
        </div>
      )
    }
  ],
  timeline: [
    {
      id: "horizontal-timeline",
      name: "Roadmap Timeline",
      render: (slide: any) => (
        <div className="space-y-5 text-left h-full flex flex-col justify-center">
          <h2 className="text-xl sm:text-2xl font-bold" style={{ color: colors.primary }}>
            {slide.title}
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch">
            {slide.events?.map((evt: any, idx: number) => (
              <div 
                key={idx} 
                className="flex-1 p-3.5 rounded-xl border bg-neutral-950 flex flex-col justify-between hover:bg-neutral-900/60 transition-all"
                style={{ borderColor: colors.border }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-black font-mono tracking-widest" style={{ color: colors.primary }}>{evt.year}</span>
                  <div className="flex-1 h-[1px] bg-white/10" />
                </div>
                <p className="text-[10px] text-neutral-300 font-light leading-relaxed">
                  {evt.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )
    }
  ],
  steps: [
    {
      id: "horizontal-steps",
      name: "Step Sequence Flow",
      render: (slide: any) => (
        <div className="space-y-5 text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-white">{slide.title}</h2>
          <div className="flex gap-4">
            {slide.steps?.map((step: string, idx: number) => (
              <div 
                key={idx} 
                className="flex-1 p-3.5 rounded-xl border relative flex flex-col"
                style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}
              >
                <div 
                  className="w-6 h-6 rounded-full text-xs font-bold font-mono flex items-center justify-center mb-2"
                  style={{ color: colors.accent, backgroundColor: `${colors.primary}20` }}
                >
                  {idx + 1}
                </div>
                <p className="text-[10px] text-neutral-300 font-light leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )
    }
  ],
  roadmap: [
    {
      id: "now-next-later",
      name: "Phased Roadmap",
      render: (slide: any) => (
        <div className="space-y-4 text-left">
          <h2 className="text-xl sm:text-2xl font-bold" style={{ color: colors.primary }}>{slide.title}</h2>
          <div className="grid grid-cols-3 gap-4">
            {slide.phases?.map((p: any, idx: number) => (
              <div key={idx} className="p-4 rounded-xl border border-white/5 bg-neutral-950 flex flex-col justify-between">
                <span className="text-xs font-mono font-black tracking-wider uppercase border-b pb-1.5 mb-2" style={{ color: colors.primary, borderColor: colors.border }}>{p.phase}</span>
                <p className="text-[10.5px] text-neutral-300 leading-relaxed font-light">{p.goal}</p>
              </div>
            ))}
          </div>
        </div>
      )
    }
  ],
  image_left: [
    {
      id: "img-left-default",
      name: "Image Split Left",
      render: (slide: any) => (
        <div className="grid grid-cols-2 gap-6 items-center text-left py-2 h-full">
          <div className="h-full min-h-[160px] rounded-xl overflow-hidden bg-neutral-900 border relative flex items-center justify-center" style={{ borderColor: colors.border }}>
            {slide.image_url ? (
              <img src={slide.image_url} alt={slide.alt_text || "Slide Image"} className="object-cover w-full h-full opacity-80" />
            ) : (
              <ImageIcon size={32} className="text-white/20" />
            )}
          </div>
          <div className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-extrabold" style={{ color: colors.primary }}>{slide.title}</h2>
            <p className="text-[11px] sm:text-xs text-neutral-300 leading-relaxed font-light whitespace-pre-wrap">
              {slide.content}
            </p>
          </div>
        </div>
      )
    }
  ],
  image_right: [
    {
      id: "img-right-default",
      name: "Image Split Right",
      render: (slide: any) => (
        <div className="grid grid-cols-2 gap-6 items-center text-left py-2 h-full">
          <div className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-extrabold" style={{ color: colors.primary }}>{slide.title}</h2>
            <p className="text-[11px] sm:text-xs text-neutral-300 leading-relaxed font-light whitespace-pre-wrap">
              {slide.content}
            </p>
          </div>
          <div className="h-full min-h-[160px] rounded-xl overflow-hidden bg-neutral-900 border relative flex items-center justify-center" style={{ borderColor: colors.border }}>
            {slide.image_url ? (
              <img src={slide.image_url} alt={slide.alt_text || "Slide Image"} className="object-cover w-full h-full opacity-80" />
            ) : (
              <ImageIcon size={32} className="text-white/20" />
            )}
          </div>
        </div>
      )
    }
  ],
  gallery_grid: [
    {
      id: "img-grid-four",
      name: "Image Grid 2x2",
      render: (slide: any) => (
        <div className="space-y-3 text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-white">{slide.title}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 h-[180px]">
            {slide.images?.map((img: string, idx: number) => (
              <div key={idx} className="rounded-xl overflow-hidden border border-white/5 bg-neutral-900 relative">
                <img src={img} alt={`Gallery ${idx + 1}`} className="object-cover w-full h-full opacity-70 hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      )
    }
  ],
  metric: [
    {
      id: "featured-stat",
      name: "Featured Stat Card",
      render: (slide: any) => (
        <div className="space-y-5 h-full flex flex-col justify-center text-left">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2" style={{ color: colors.primary }}>
            {slide.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
            <div 
              className="md:col-span-5 p-5 rounded-2xl border text-center flex flex-col justify-center"
              style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}
            >
              <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-350" style={{ backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.accent})` }}>
                {slide.metric?.value}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider mt-2" style={{ color: colors.primary }}>
                {slide.metric?.label}
              </span>
            </div>
            <div className="md:col-span-7 pl-0 md:pl-2">
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-light">
                {slide.metric?.description}
              </p>
            </div>
          </div>
        </div>
      )
    }
  ]
});
