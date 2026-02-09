"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Clock, 
  Share2, 
  Bookmark, 
  Menu, 
  X, 
  ChevronRight, 
  Copy, 
  Check, 
  Loader2, 
  AlertCircle 
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import api from "@/config/api";

// --- HELPERS ---

const extractYoutubeId = (url: string) => {
  const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[1]) ? match[1] : null;
};

// --- TYPES ---
interface ContentBlock {
  id: string;
  type: "paragraph" | "heading" | "quote" | "image" | "youtube" | "code" | "list" | "table";
  text?: string;
  level?: number;
  author?: string;
  src?: string;
  caption?: string;
  code?: string;
  language?: string;
  items?: string[];
  headers?: string[];
  rows?: string[][];
}

interface BlogPost {
  _id: string;
  title: string;
  subtitle: string;
  slug: string;
  author: { name: string; role: string; avatar: string };
  meta: { date: string; readTime: string; views: number };
  coverImage: string;
  toc: { id: string; label: string }[];
  content: ContentBlock[];
}

// --- SUB-COMPONENTS ---

const CodeBlock = ({ code, language }: { code: string, language: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-8 rounded-xl overflow-hidden bg-[#1e1e1e] border border-white/10 shadow-2xl relative group">
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-white/5">
        <span className="text-[10px] font-mono text-neutral-400 uppercase">{language || "text"}</span>
        <button 
          onClick={copyToClipboard}
          className="flex items-center gap-2 text-[10px] text-neutral-400 hover:text-white transition-colors"
        >
          {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy Code"}
        </button>
      </div>
      <div className="overflow-x-auto">
        <pre className="p-4 text-sm font-mono text-neutral-300 leading-relaxed min-w-full">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

const StickyTOC = ({ toc }: { toc: { id: string; label: string }[] }) => {
  const [activeId, setActiveId] = useState("");

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveId(id);
    }
  };

  if (!toc || toc.length === 0) return null;

  return (
    <div className="hidden lg:block sticky top-32 w-full">
      <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6 shadow-xl">
        <h4 className="text-xs font-black uppercase tracking-widest text-white mb-4 flex items-center gap-2">
          <Menu size={12} className="text-red-600" /> Contents
        </h4>
        <ul className="space-y-1 relative border-l border-white/10 ml-2">
          {toc.map((item) => (
            <li key={item.id} className="relative pl-4">
              <button
                onClick={() => scrollToSection(item.id)}
                className={cn(
                  "text-xs font-medium text-left transition-all duration-300 hover:text-white w-full py-1 line-clamp-1",
                  activeId === item.id ? "text-red-500 font-bold translate-x-1" : "text-neutral-500"
                )}
              >
                {item.label}
              </button>
              {activeId === item.id && (
                <motion.div 
                  layoutId="active-toc"
                  className="absolute left-[-1px] top-0 bottom-0 w-[2px] bg-red-600"
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---

export default function BlogDetailPage() {
  const params = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [generatedToc, setGeneratedToc] = useState<{id: string, label: string}[]>([]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/general/blog/${params.slug}`);
        if (response.data.success) {
          setPost(response.data.data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchPost();
      
      // TRACK VIEW ANALYTICS
      api.post('/general/track', {
        type: 'blog',
        id: params.slug,
        metric: 'view'
      }).catch(err => console.error("Tracking failed", err));
    }
  }, [params.slug]);

  // Dynamic TOC Generation
  useEffect(() => {
    if (post) {
      if (post.toc && post.toc.length > 0) {
        setGeneratedToc(post.toc);
      } else {
        const headings = post.content
          .filter(block => block.type === 'heading')
          .map(block => ({
            id: block.id || block.text?.toLowerCase().replace(/\s+/g, '-') || "", 
            label: block.text || ""
          }));
        setGeneratedToc(headings);
      }
    }
  }, [post]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.subtitle,
          url: window.location.href,
        });
        // Track share
        api.post('/general/track', { type: 'blog', id: params.slug, metric: 'share' });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // Track share (optimistic)
      api.post('/general/track', { type: 'blog', id: params.slug, metric: 'share' });
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="animate-spin text-red-600" size={40} />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <AlertCircle className="mx-auto text-red-500" size={48} />
          <h1 className="text-2xl font-bold">Article Not Found</h1>
          <Link href="/blog">
            <Button variant="outline" className="mt-4 border-white/10 text-white hover:bg-white/10">Return to Intel</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-900/50 pb-24 md:pb-20">
      
      {/* Background Matrix */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Progress Bar (Top) */}
      <motion.div className="fixed top-0 left-0 h-1 bg-red-600 z-50" style={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 1 }} /> 

      <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-7xl">
        
        {/* Navigation */}
        <nav className="flex items-center justify-between py-6 md:py-10">
          <Link href="/blog">
            <Button variant="ghost" className="text-neutral-400 hover:text-white hover:bg-white/5 gap-2 pl-0 text-xs font-bold uppercase tracking-widest">
              <ArrowLeft size={16} /> Back to Intel
            </Button>
          </Link>
          
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" onClick={handleShare} className="text-neutral-400 hover:text-white">
               <Share2 size={18} />
             </Button>
             <div className="lg:hidden">
                <Button onClick={() => setMobileMenuOpen(true)} size="icon" variant="ghost">
                  <Menu size={20} />
                </Button>
             </div>
          </div>
        </nav>

        {/* Hero Header */}
        <header className="max-w-4xl mx-auto mb-12 md:mb-16">
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="px-3 py-1 rounded-full bg-red-600/10 text-red-500 border border-red-600/20 text-[10px] font-black uppercase tracking-widest">
              Tech
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 text-neutral-400 border border-white/10 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
              <Clock size={12} /> {post.meta.readTime}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-8">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 border-y border-white/10 py-6">
            <Avatar className="h-12 w-12 border-2 border-white/10">
              <AvatarImage src={post.author.avatar} />
              <AvatarFallback className="bg-neutral-800 text-white font-bold">{post.author.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{post.author.name}</p>
              <p className="text-xs text-neutral-500 font-medium">{post.author.role}</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-neutral-400">{post.meta.date}</p>
              <p className="text-[10px] text-neutral-600 font-black uppercase tracking-widest">{post.meta.views} Views</p>
            </div>
          </div>
        </header>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
          
          {/* Left Content Column */}
          <article className="lg:col-span-8 lg:col-start-1 space-y-8 md:space-y-12">
            
            {/* Cover Image */}
            {post.coverImage && (
              <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl aspect-video relative group">
                <img 
                  src={post.coverImage} 
                  alt="Cover" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent opacity-60" />
              </div>
            )}

            {/* Introduction Lead */}
            {post.subtitle && (
              <p className="text-lg md:text-xl font-medium text-neutral-200 leading-relaxed border-l-4 border-red-600 pl-6 italic">
                {post.subtitle}
              </p>
            )}

            {/* Dynamic Content Rendering */}
            <div className="space-y-8 text-neutral-300 leading-relaxed font-light">
              {post.content.map((block, index) => {
                const uniqueKey = block.id || index;

                switch (block.type) {
                  case "paragraph":
                    return <p key={uniqueKey} className="text-base md:text-lg whitespace-pre-line leading-8">{block.text}</p>;
                  
                  case "heading":
                    return (
                      <h2 
                        key={uniqueKey} 
                        id={block.id || block.text?.toLowerCase().replace(/\s+/g, '-')} 
                        className={cn(
                          "text-2xl md:text-3xl font-black text-white mt-12 mb-6 scroll-mt-32 flex items-center gap-3",
                          block.level === 3 && "text-xl md:text-2xl mt-8"
                        )}
                      >
                        <span className="text-red-600">#</span> {block.text}
                      </h2>
                    );

                  case "quote":
                    return (
                      <div key={uniqueKey} className="bg-[#0f0f0f] border border-white/10 p-8 rounded-2xl my-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-red-600" />
                        <p className="text-xl md:text-2xl font-black italic text-white mb-4">"{block.text}"</p>
                        {block.author && <footer className="text-sm font-bold text-neutral-500 uppercase tracking-widest">— {block.author}</footer>}
                      </div>
                    );

                  case "image":
                    return (
                      <figure key={uniqueKey} className="my-8">
                        <img 
                          src={block.src} 
                          alt="Content" 
                          className="w-full rounded-2xl border border-white/10 shadow-lg" 
                        />
                        {block.caption && (
                          <figcaption className="text-center text-xs text-neutral-500 mt-3 font-medium italic">
                            {block.caption}
                          </figcaption>
                        )}
                      </figure>
                    );

                  case "youtube":
                    const videoId = extractYoutubeId(block.text || "");
                    if (!videoId) return null;
                    return (
                      <div key={uniqueKey} className="my-10">
                        <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative bg-black">
                          <iframe 
                            width="100%" 
                            height="100%" 
                            src={`https://www.youtube.com/embed/${videoId}`} 
                            title="YouTube video player" 
                            className="absolute inset-0 border-none"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                        {block.caption && (
                          <p className="text-center text-xs text-neutral-500 mt-3 font-medium">{block.caption}</p>
                        )}
                      </div>
                    );

                  case "code":
                    return <CodeBlock key={uniqueKey} code={block.code || ""} language={block.language || "text"} />;

                  case "list":
                    return (
                      <ul key={uniqueKey} className="space-y-3 my-6 pl-4">
                        {block.items?.map((item, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <ChevronRight size={16} className="text-red-600 mt-1 shrink-0" />
                            <span className="text-base" dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
                          </li>
                        ))}
                      </ul>
                    );

                  case "table":
                    return (
                      <div key={uniqueKey} className="my-10 overflow-x-auto rounded-xl border border-white/10 bg-[#0f0f0f]">
                        <table className="w-full text-left text-sm whitespace-nowrap md:whitespace-normal">
                          <thead className="bg-[#1a1a1a] text-xs uppercase font-black tracking-wider text-neutral-400">
                            <tr>
                              {block.headers?.map((h, i) => (
                                <th key={i} className="px-6 py-4 border-b border-white/5">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {block.rows?.map((row, rI) => (
                              <tr key={rI} className="hover:bg-white/[0.02] transition-colors">
                                {row.map((cell, cI) => (
                                  <td key={cI} className="px-6 py-4 font-medium">{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );

                  default:
                    return null;
                }
              })}
            </div>

            {/* Author Bio Box */}
            <div className="mt-20 p-8 rounded-3xl bg-[#0f0f0f] border border-white/10 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
              <Avatar className="h-20 w-20 border-2 border-red-600">
                <AvatarImage src={post.author.avatar} />
                <AvatarFallback className="bg-neutral-800 text-white font-bold">{post.author.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="text-lg font-black text-white uppercase italic">Written by {post.author.name}</h4>
                <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">{post.author.role}</p>
                <p className="text-sm text-neutral-400 leading-relaxed max-w-xl">
                  Expert contributor at PaperTube. Sharing insights on engineering, AI systems, and student success.
                </p>
              </div>
            </div>

          </article>

          {/* Right Sidebar (Sticky Table of Contents) */}
          <aside className="lg:col-span-4 relative">
            <StickyTOC toc={generatedToc} />
          </aside>

        </div>
      </div>

      {/* Mobile Table of Contents (Slide-over / Bottom Sheet) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] lg:hidden"
            />
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-[#111] border-t border-white/10 rounded-t-[2rem] z-[100] p-6 lg:hidden max-h-[75vh] overflow-y-auto pb-12"
            >
              {/* Drag Handle Visual */}
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black uppercase italic text-white flex items-center gap-2">
                  <Menu size={18} className="text-red-600" /> Contents
                </h3>
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white" onClick={() => setMobileMenuOpen(false)}>
                  <X size={16} />
                </Button>
              </div>
              
              <ul className="space-y-4">
                {generatedToc.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        const el = document.getElementById(item.id);
                        if (el) {
                          const y = el.getBoundingClientRect().top + window.scrollY - 100;
                          window.scrollTo({ top: y, behavior: 'smooth' });
                          setMobileMenuOpen(false);
                        }
                      }}
                      className="text-sm font-medium text-neutral-400 hover:text-white flex items-center gap-3 w-full text-left active:text-red-500 transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}