"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { 
  Save, Trash2, Edit3, Plus, X, 
  Image as ImageIcon, Type, Code, Video, 
  List, MoreVertical, GripVertical,
  CheckCircle2, ArrowLeft, Clock,
  Bot, Copy, Sparkles, UploadCloud,
  Eye, PenTool, Hash, Table, Quote,
  TrendingUp, RefreshCw, ChevronDown, 
  Search, SlidersHorizontal, ArrowRight,
  Terminal, ShieldCheck, FileText, Send, Zap,
  BarChart2, Star, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import api from "@/config/api";
import { cn } from "@/lib/utils";
import { uploadToR2 } from "@/utils/r2Upload";

// --- AI PROMPT TEMPLATE ---
const AI_GENERATION_PROMPT = `
You are a blog content generator for a tech platform. 
Generate a blog post about: [INSERT TOPIC HERE].

You MUST output ONLY valid JSON in the following format (no markdown, no backticks).
Ensure "content" is an array of blocks.

Structure:
{
  "title": "Catchy SEO Title",
  "subtitle": "Engaging short summary/hook.",
  "slug": "url-friendly-slug",
  "readTime": "X min read",
  "tags": ["Tech", "AI", "Guide"],
  "content": [
    { "type": "paragraph", "text": "..." },
    { "type": "heading", "level": 2, "text": "Section Header" },
    { "type": "quote", "text": "...", "author": "..." },
    { "type": "code", "language": "javascript", "code": "..." },
    { "type": "list", "items": ["Item 1", "Item 2"] },
    { "type": "youtube", "text": "YOUTUBE_VIDEO_ID_OR_LINK" },
    { "type": "table", "headers": ["Col1", "Col2"], "rows": [["A1", "A2"], ["B1", "B2"]] }
  ]
}
`;

// --- HELPERS ---
const extractYoutubeId = (url: string) => {
  const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[1]) ? match[1] : url;
};

const formatDate = (dateStr: string) =>
  dateStr ? new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "—";

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
  _id?: string;
  title: string;
  subtitle: string;
  slug: string;
  author: { name: string; role: string; avatar: string };
  meta: { readTime: string; views: number; shares: number; conversions: number };
  tags: string[];
  coverImage: string;
  toc: { id: string; label: string }[];
  content: ContentBlock[];
  isPublished?: boolean;
  createdAt?: string;
}

const DEFAULT_POST: BlogPost = {
  title: "",
  subtitle: "",
  slug: "",
  author: { name: "Admin", role: "Chief Editor", avatar: "https://github.com/shadcn.png" },
  meta: { readTime: "5 min", views: 0, shares: 0, conversions: 0 },
  tags: [],
  coverImage: "",
  toc: [],
  content: [],
  isPublished: true
};

// --- PREVIEW RENDERER ---
const PreviewRenderer = ({ data }: { data: BlogPost }) => {
  return (
    <div className="bg-[#050505] text-white font-mono p-4 md:p-8 rounded-[2rem] border border-neutral-900 h-full overflow-y-auto shadow-2xl backdrop-blur-md">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Cover */}
        {data.coverImage ? (
          <div className="aspect-video rounded-2xl overflow-hidden border border-neutral-900 relative shadow-2xl">
            <img src={data.coverImage} className="w-full h-full object-cover" alt="Cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6">
               <div className="flex flex-wrap gap-1.5 mb-2.5">
                 {data.tags.map(tag => (
                   <Badge key={tag} className="bg-red-500/10 text-red-400 border border-red-500/20 backdrop-blur-md text-[8px] uppercase tracking-wider font-bold rounded-lg">{tag}</Badge>
                 ))}
               </div>
               <h1 className="text-xl md:text-3xl font-black text-white leading-tight drop-shadow-xl">{data.title || "Untitled Post"}</h1>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-1.5 mb-2">
                 {data.tags.map(tag => (
                   <Badge key={tag} className="bg-red-500/10 text-red-400 border border-red-500/20 text-[8px] uppercase tracking-wider font-bold rounded-lg">{tag}</Badge>
                 ))}
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-white leading-tight">{data.title || "Untitled Post"}</h1>
          </>
        )}

        <div className="flex items-center gap-3 py-3 border-b border-neutral-900">
          <Avatar className="h-8 w-8 border border-neutral-800"><AvatarImage src={data.author.avatar} /></Avatar>
          <div className="flex-1">
            <p className="text-xs font-bold text-white">{data.author.name}</p>
            <p className="text-[8px] text-neutral-500 uppercase tracking-widest">{data.meta.readTime} • EDITOR</p>
          </div>
        </div>

        <p className="text-xs md:text-sm text-neutral-400 italic leading-relaxed border-l-2 border-neutral-800 pl-3">{data.subtitle}</p>

        <div className="space-y-6 text-neutral-300 text-xs md:text-sm leading-relaxed">
          {data.content.map((block) => (
            <div key={block.id}>
              {block.type === "paragraph" && <p className="leading-6 whitespace-pre-line text-neutral-400">{block.text}</p>}
              
              {block.type === "heading" && (
                <h2 className={cn("font-black text-white mt-6 mb-2.5 flex items-center gap-2", block.level === 3 ? "text-sm md:text-base" : "text-base md:text-lg")}>
                  <span className="text-red-500">#</span> {block.text}
                </h2>
              )}

              {block.type === "quote" && (
                <div className="bg-neutral-950 border-l-2 border-red-500 p-4 rounded-r-xl my-4 border border-neutral-900/60">
                  <p className="text-sm font-bold italic text-white mb-1.5">"{block.text}"</p>
                  <p className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">— {block.author}</p>
                </div>
              )}

              {block.type === "image" && (
                <figure className="my-5">
                  <img src={block.src} className="w-full rounded-xl border border-neutral-900 shadow-lg" alt="Block" />
                  {block.caption && <figcaption className="text-center text-[9px] text-neutral-500 mt-2 italic">{block.caption}</figcaption>}
                </figure>
              )}

              {block.type === "code" && (
                <div className="bg-[#0b0b0b] border border-neutral-900 rounded-xl overflow-hidden my-5 shadow-2xl">
                  <div className="bg-[#101010] px-3.5 py-1.5 border-b border-neutral-900 text-[8px] font-mono text-neutral-500 uppercase flex justify-between">
                    <span>{block.language}</span>
                    <div className="flex gap-1"><div className="w-1.5 h-1.5 rounded-full bg-neutral-800"/><div className="w-1.5 h-1.5 rounded-full bg-neutral-800"/></div>
                  </div>
                  <pre className="p-4 overflow-x-auto text-[10px] font-mono text-emerald-400"><code>{block.code}</code></pre>
                </div>
              )}

              {block.type === "list" && (
                <ul className="space-y-2 my-4 pl-4 border-l border-neutral-900">
                  {block.items?.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-neutral-400">
                      <span className="text-red-500 mt-1 text-[8px]">■</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {block.type === "table" && (
                <div className="my-5 overflow-x-auto rounded-xl border border-neutral-900 bg-neutral-950">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0d0d0d] text-[9px] uppercase font-bold tracking-wider text-neutral-500">
                      <tr>
                        {block.headers?.map((h, i) => (
                          <th key={i} className="px-3.5 py-2.5 border-b border-neutral-900">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900/60 text-neutral-400">
                      {block.rows?.map((row, rI) => (
                        <tr key={rI} className="hover:bg-neutral-900/20">
                          {row.map((cell, cI) => (
                            <td key={cI} className="px-3.5 py-2.5">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {block.type === "youtube" && (
                 <div className="aspect-video w-full rounded-xl overflow-hidden border border-neutral-900 shadow-2xl bg-black my-5 relative">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src={`https://www.youtube.com/embed/${extractYoutubeId(block.text || "")}`} 
                      title="YouTube" 
                      className="absolute inset-0 w-full h-full border-none" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                 </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
export default function AdminBlogPage() {
  const [view, setView] = useState<"list" | "edit">("list");
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [formData, setFormData] = useState<BlogPost>(DEFAULT_POST);
  const [aiRawText, setAiRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [sortBy, setSortBy] = useState<"date" | "views" | "conversions">("date");
  const [selectedTag, setSelectedTag] = useState("all");

  // Telemetry Drawer State
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [isBoosterLoading, setIsBoosterLoading] = useState(false);

  const authToken = typeof window !== 'undefined' ? localStorage.getItem("authToken") || "" : "";

  const fetchBlogs = async (showSync = false) => {
    try {
      if (showSync) setIsRefreshing(true);
      else setLoading(true);
      const res = await api.get("/admin/blog/all", { headers: { Authorization: `Bearer ${authToken}` } });
      setBlogs(res.data.data);
    } catch (err) { 
      toast.error("Database connection failed"); 
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { 
    fetchBlogs(); 
  }, []);

  // Compute HUD telemetry
  const hudStats = useMemo(() => {
    const total = blogs.length;
    const published = blogs.filter(b => b.isPublished !== false).length;
    const views = blogs.reduce((acc, curr) => acc + (Number(curr.meta?.views) || 0), 0);
    const conversions = blogs.reduce((acc, curr) => acc + (Number(curr.meta?.conversions) || 0), 0);
    
    // Average Conversion Rate
    const conversionEfficiency = views > 0 ? ((conversions / views) * 100).toFixed(1) : "0.0";
    
    return {
      total,
      published,
      views,
      conversions,
      conversionEfficiency
    };
  }, [blogs]);

  // Compute all unique tags for filter
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    blogs.forEach(blog => {
      if (Array.isArray(blog.tags)) {
        blog.tags.forEach(t => tagsSet.add(t));
      }
    });
    return Array.from(tagsSet);
  }, [blogs]);

  const _uploadToR2 = async (file: File): Promise<string> => {
    return await uploadToR2(file, "blog-images", true);
  };

  // --- AI PARSER LOGIC ---
  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(AI_GENERATION_PROMPT);
    toast.success("System Prompt copied to clipboard");
  };

  const handleAiInject = () => {
    try {
      let cleanJson = aiRawText.replace(/```json/gi, "").replace(/```/g, "").trim();
      cleanJson = cleanJson.replace(/\\_/g, "_").replace(/\\'/g, "'");

      const parsed = JSON.parse(cleanJson);

      setFormData(prev => ({
        ...prev,
        title: parsed.title || prev.title,
        subtitle: parsed.subtitle || prev.subtitle,
        slug: parsed.slug || prev.slug,
        meta: {
          ...prev.meta,
          readTime: parsed.readTime || prev.meta.readTime,
        },
        tags: Array.isArray(parsed.tags) ? parsed.tags : prev.tags,
        content: (parsed.content || []).map((block: any) => ({
          ...block,
          id: crypto.randomUUID(),
          items: Array.isArray(block.items) ? block.items : block.items ? [block.items] : undefined,
          headers: Array.isArray(block.headers) ? block.headers : block.headers ? [block.headers] : undefined,
          rows: Array.isArray(block.rows) ? block.rows : undefined,
        }))
      }));

      toast.success("Neural data injected successfully ✓");
      setIsAiOpen(false);
      setAiRawText("");
    } catch (err: any) {
      toast.error(`JSON Parse Error: ${err.message}`);
    }
  };

  // --- CRUD ---
  const handleSave = async () => {
    if (!formData.title) return toast.error("Title required");
    if (!formData.slug) return toast.error("Slug required");
    try {
      if (formData._id) {
        await api.patch(`/admin/blog/update/${formData._id}`, formData, { headers: { Authorization: `Bearer ${authToken}` } });
        toast.success("Post Updated ✓");
      } else {
        await api.post("/admin/blog/create", formData, { headers: { Authorization: `Bearer ${authToken}` } });
        toast.success("Post Deployed ✓");
      }
      setView("list");
      fetchBlogs();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Transmission failed";
      toast.error(msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this post?")) return;
    try {
      await api.delete(`/admin/blog/delete/${id}`, { headers: { Authorization: `Bearer ${authToken}` } });
      toast.success("Post deleted");
      fetchBlogs();
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  // Toggle published status from telemetry drawer
  const togglePublishStatus = async (blog: BlogPost) => {
    try {
      const updatedStatus = blog.isPublished === false ? true : false;
      await api.patch(`/admin/blog/update/${blog._id}`, { isPublished: updatedStatus }, { headers: { Authorization: `Bearer ${authToken}` } });
      toast.success(updatedStatus ? "Article Published ✓" : "Article Drafted ✓");
      if (selectedBlog?._id === blog._id) {
        setSelectedBlog(prev => prev ? { ...prev, isPublished: updatedStatus } : null);
      }
      fetchBlogs();
    } catch (e) {
      toast.error("Failed to update publication status");
    }
  };

  // --- Block Logic ---
  const addBlock = (type: ContentBlock["type"]) => {
    const defaults: Partial<ContentBlock> = {
      paragraph: { text: "" },
      heading: { text: "", level: 2 },
      quote: { text: "", author: "" },
      image: { src: "", caption: "" },
      code: { code: "", language: "javascript" },
      youtube: { text: "" },
      list: { items: [""] },
      table: { headers: ["Column 1", "Column 2"], rows: [["", ""]] },
    }[type] || {};
    setFormData(prev => ({
      ...prev,
      content: [...prev.content, { id: crypto.randomUUID(), type, ...defaults }]
    }));
  };

  const updateBlock = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content.map(b => b.id === id ? { ...b, [field]: value } : b)
    }));
  };

  const handleImageUploadForBlock = async (id: string, file: File) => {
    const toastId = toast.loading("Uploading image…");
    try {
      const url = await _uploadToR2(file);
      updateBlock(id, "src", url);
      toast.dismiss(toastId);
      toast.success("Image uploaded ✓");
    } catch (e) {
      toast.dismiss(toastId);
      toast.error("Upload failed");
    }
  };

  const handleCoverUpload = async (file: File) => {
    setCoverUploading(true);
    const toastId = toast.loading("Uploading cover image…");
    try {
      const url = await _uploadToR2(file);
      setFormData(prev => ({ ...prev, coverImage: url }));
      toast.dismiss(toastId);
      toast.success("Cover image uploaded ✓");
    } catch (e) {
      toast.dismiss(toastId);
      toast.error("Cover upload failed");
    } finally {
      setCoverUploading(false);
    }
  };

  // Filter & Sort blogs list
  const filteredBlogs = useMemo(() => {
    return blogs
      .filter(blog => {
        // Search Query
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch = query === "" || 
          blog.title.toLowerCase().includes(query) || 
          (blog.subtitle && blog.subtitle.toLowerCase().includes(query)) || 
          blog.slug.toLowerCase().includes(query);

        // Status Filter
        const isPub = blog.isPublished !== false;
        const matchesStatus = statusFilter === "all" || 
          (statusFilter === "published" && isPub) || 
          (statusFilter === "draft" && !isPub);

        // Tag Filter
        const matchesTag = selectedTag === "all" || 
          (Array.isArray(blog.tags) && blog.tags.includes(selectedTag));

        return matchesSearch && matchesStatus && matchesTag;
      })
      .sort((a, b) => {
        if (sortBy === "views") return (Number(b.meta?.views) || 0) - (Number(a.meta?.views) || 0);
        if (sortBy === "conversions") return (Number(b.meta?.conversions) || 0) - (Number(a.meta?.conversions) || 0);
        
        // Date sorting
        return new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime();
      });
  }, [blogs, searchQuery, statusFilter, selectedTag, sortBy]);

  // Copy public link to clipboard
  const copyBlogPublicLink = (blog: BlogPost) => {
    const domain = typeof window !== 'undefined' ? window.location.origin : 'https://papertube.com';
    const mockUrl = `${domain}/blog/${blog.slug}`;
    navigator.clipboard.writeText(mockUrl);
    toast.success("Public blog post link saved to clipboard!");
  };

  const triggerMarketingBooster = () => {
    setIsBoosterLoading(true);
    setTimeout(() => {
      setIsBoosterLoading(false);
      toast.success("Marketing boost sequence completed for: " + selectedBlog?.title);
    }, 1500);
  };

  // --- VIEW: LIST ---
  if (view === "list") {
    return (
      <div className="space-y-6 md:space-y-8 pb-32 md:pb-20 font-mono">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 border-b border-neutral-900 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-blue-400 bg-blue-500/5 border border-blue-500/15 px-2 py-0.5 rounded uppercase tracking-wider font-bold">
                Editorial Hub
              </span>
              <span className="text-[9px] font-mono text-neutral-500 flex items-center gap-1">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
                STATUS: SYNCED
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black italic uppercase tracking-wider text-white">
              Blog <span className="text-red-500 underline decoration-red-500/30 underline-offset-8">Console</span>
            </h1>
            <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider mt-1">
              Command station for configuring technical articles, tag indexing, and tracking editorial conversions.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button
              onClick={() => { setFormData({ ...DEFAULT_POST, content: [] }); setView("edit"); }}
              className="bg-white text-black hover:bg-red-600 hover:text-white rounded-xl font-black uppercase italic text-[10px] h-12 px-6 flex-1 md:flex-none"
            >
              <Plus size={16} className="mr-2" /> Initialize New
            </Button>
            <button 
              onClick={() => fetchBlogs(true)} 
              disabled={isRefreshing || loading}
              className="p-3 rounded-xl bg-neutral-900 border border-neutral-850 text-neutral-400 hover:text-white hover:border-neutral-700 transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={cn(isRefreshing && "animate-spin text-red-500")} />
            </button>
          </div>
        </div>

        {/* --- TELEMETRY KPI HUD GRID --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Articles */}
          <div className="bg-neutral-950/40 border border-neutral-900 p-5 rounded-[2rem] relative overflow-hidden group shadow-xl backdrop-blur-md flex flex-col justify-between min-h-[120px] hover:border-blue-500/35 transition-all">
            <div className="absolute -top-12 -left-12 w-20 h-20 rounded-full bg-blue-500/5 filter blur-2xl pointer-events-none" />
            <p className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">Total Articles</p>
            <h4 className="text-2xl md:text-3xl font-mono font-black italic text-white mt-2 leading-none">
              {hudStats.total}
            </h4>
            <span className="text-[8px] font-mono text-neutral-500 mt-4 block">Configured digital assets</span>
          </div>

          {/* Active Published vs Drafts */}
          <div className="bg-neutral-950/40 border border-neutral-900 p-5 rounded-[2rem] relative overflow-hidden group shadow-xl backdrop-blur-md flex flex-col justify-between min-h-[120px] hover:border-emerald-500/35 transition-all">
            <div className="absolute -top-12 -left-12 w-20 h-20 rounded-full bg-emerald-500/5 filter blur-2xl pointer-events-none" />
            <p className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">Published Assets</p>
            <h4 className="text-2xl md:text-3xl font-mono font-black italic text-emerald-400 mt-2 leading-none">
              {hudStats.published} / {hudStats.total}
            </h4>
            <span className="text-[8px] font-mono text-neutral-500 mt-4 block">Active nodes on frontend</span>
          </div>

          {/* Total Views */}
          <div className="bg-neutral-950/40 border border-neutral-900 p-5 rounded-[2rem] relative overflow-hidden group shadow-xl backdrop-blur-md flex flex-col justify-between min-h-[120px] hover:border-purple-500/35 transition-all">
            <div className="absolute -top-12 -left-12 w-20 h-20 rounded-full bg-purple-500/5 filter blur-2xl pointer-events-none" />
            <p className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">Total Impressions</p>
            <h4 className="text-2xl md:text-3xl font-mono font-black italic text-white mt-2 leading-none">
              {hudStats.views.toLocaleString()}
            </h4>
            <span className="text-[8px] font-mono text-purple-400 mt-4 block font-bold flex items-center gap-0.5">
              <TrendingUp size={10} /> +8.4% read time
            </span>
          </div>

          {/* Conversion rate efficiency */}
          <div className="bg-neutral-950/40 border border-neutral-900 p-5 rounded-[2rem] relative overflow-hidden group shadow-xl backdrop-blur-md flex flex-col justify-between min-h-[120px] hover:border-orange-500/35 transition-all">
            <div className="absolute -top-12 -left-12 w-20 h-20 rounded-full bg-orange-500/5 filter blur-2xl pointer-events-none" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">Conv. Efficiency</p>
                <h4 className="text-2xl md:text-3xl font-mono font-black italic text-white mt-2 leading-none">
                  {hudStats.conversionEfficiency}%
                </h4>
              </div>
              <div className="relative h-9 w-9 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" className="text-neutral-900" strokeWidth="3.5" stroke="currentColor" fill="none" />
                  <circle cx="18" cy="18" r="16" className="text-orange-500" strokeDasharray={`${parseFloat(hudStats.conversionEfficiency)}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" />
                </svg>
                <span className="absolute text-[7px] font-mono font-black text-white">{Math.round(parseFloat(hudStats.conversionEfficiency))}%</span>
              </div>
            </div>
            <span className="text-[8px] font-mono text-neutral-500 mt-2 block">Visitor sign-up quotient</span>
          </div>

        </div>

        {/* --- ADVANCED SEARCH & FILTER BAR --- */}
        <div className="bg-neutral-950/60 border border-neutral-900 p-4 rounded-2xl space-y-4 backdrop-blur-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600" />
              <input 
                type="text"
                placeholder="Search post title, subtitle, slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-neutral-900 border border-neutral-850 focus:border-red-500/40 rounded-xl text-[10px] font-mono text-white placeholder-neutral-500 focus:outline-none transition-all"
              />
            </div>

            {/* Tag Selection filter */}
            <div className="relative">
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full pl-3 pr-8 py-2 bg-neutral-900 border border-neutral-850 focus:border-red-500/40 rounded-xl text-[10px] font-mono text-neutral-400 focus:text-white focus:outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="all">TAG SELECTION: ALL</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag.toUpperCase()}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
            </div>

            {/* Publication Status filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full pl-3 pr-8 py-2 bg-neutral-900 border border-neutral-850 focus:border-red-500/40 rounded-xl text-[10px] font-mono text-neutral-400 focus:text-white focus:outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="all">PUBLISH STATUS: ALL</option>
                <option value="published">PUBLISH STATUS: PUBLISHED</option>
                <option value="draft">PUBLISH STATUS: DRAFT</option>
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
            </div>

            {/* Sort Order */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full pl-3 pr-8 py-2 bg-neutral-900 border border-neutral-850 focus:border-red-500/40 rounded-xl text-[10px] font-mono text-neutral-400 focus:text-white focus:outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="date">SORT BY: DEPLOY DATE</option>
                <option value="views">SORT BY: TOTAL VIEWS</option>
                <option value="conversions">SORT BY: CONVERSIONS</option>
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
            </div>
          </div>

          <div className="flex justify-between items-center text-[8px] font-mono text-neutral-600 uppercase border-t border-neutral-900/60 pt-3">
            <span>Query hits: {filteredBlogs.length} asset(s)</span>
            <span className="flex items-center gap-1">
              <SlidersHorizontal size={9} /> Operational filters active
            </span>
          </div>
        </div>

        {/* --- DESKTOP TABLE VIEW --- */}
        <div className="hidden md:block">
          <Card className="bg-neutral-950/40 border border-neutral-900 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono">
                <thead>
                  <tr className="border-b border-neutral-900 bg-neutral-950/60">
                    <th className="p-5 text-[8px] font-black uppercase tracking-widest text-neutral-500">Resource Details</th>
                    <th className="p-5 text-[8px] font-black uppercase tracking-widest text-neutral-500">Active Tags</th>
                    <th className="p-5 text-[8px] font-black uppercase tracking-widest text-neutral-500 text-center">Status</th>
                    <th className="p-5 text-[8px] font-black uppercase tracking-widest text-neutral-500 text-right">Traffic metrics</th>
                    <th className="p-5 text-[8px] font-black uppercase tracking-widest text-neutral-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900/40">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-20 text-center">
                        <Loader2 className="animate-spin mx-auto text-red-500" />
                      </td>
                    </tr>
                  ) : filteredBlogs.map((blog) => {
                    const views = Number(blog.meta?.views) || 0;
                    const conversions = Number(blog.meta?.conversions) || 0;
                    const cRate = views > 0 ? ((conversions / views) * 100).toFixed(1) : "0.0";
                    const isPub = blog.isPublished !== false;

                    return (
                      <tr 
                        key={blog._id} 
                        onClick={() => setSelectedBlog(blog)}
                        className="hover:bg-neutral-950/60 transition-colors group cursor-pointer"
                        id={`blog-row-${blog._id}`}
                      >
                        <td className="p-5 max-w-xs">
                          <div className="flex items-center gap-3">
                            {blog.coverImage ? (
                              <div className="h-8 w-12 rounded border border-neutral-800 overflow-hidden shrink-0">
                                <img src={blog.coverImage} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="h-8 w-12 rounded border border-neutral-850 bg-neutral-900 flex items-center justify-center shrink-0 text-neutral-500">
                                <ImageIcon size={14} />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold text-white group-hover:text-red-400 transition-colors truncate">{blog.title}</p>
                              <p className="text-[8px] text-neutral-600 mt-0.5 truncate">/{blog.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-5">
                          <div className="flex flex-wrap gap-1">
                            {blog.tags?.slice(0, 3).map(tag => (
                              <span key={tag} className="text-[7px] px-1.5 py-0.5 rounded bg-red-600/10 text-red-500 border border-red-500/15 font-bold uppercase">{tag}</span>
                            ))}
                          </div>
                        </td>
                        <td className="p-5 text-center">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[8px] font-black uppercase border",
                            isPub 
                              ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-500" 
                              : "bg-neutral-900 border-neutral-850 text-neutral-500"
                          )}>
                            {isPub ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="p-5 text-right">
                          <div>
                            <span className="text-[10px] text-white font-bold block">{views.toLocaleString()} views</span>
                            <span className="text-[8px] text-neutral-500 block mt-0.5">{conversions} conversions ({cRate}%)</span>
                          </div>
                        </td>
                        <td className="p-5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-1.5">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => { setFormData(blog); setView("edit"); }}
                              className="h-8 w-8 hover:bg-white/5 text-neutral-400 hover:text-white"
                            >
                              <Edit3 size={14} />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleDelete(blog._id!)} 
                              className="h-8 w-8 hover:bg-red-500/10 text-red-500"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredBlogs.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="p-16 text-center text-[10px] text-neutral-500 uppercase">
                        No articles matched query bounds
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* --- MOBILE CARDS LIST --- */}
        <div className="md:hidden space-y-4">
          {loading ? (
            <div className="p-10 text-center bg-neutral-950 border border-neutral-900 rounded-3xl">
              <Loader2 className="animate-spin mx-auto text-red-500" />
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="p-10 text-center text-xs text-neutral-500 bg-neutral-950 border border-neutral-900 rounded-3xl">
              No Articles Logged
            </div>
          ) : (
            filteredBlogs.map((blog) => {
              const views = Number(blog.meta?.views) || 0;
              const conversions = Number(blog.meta?.conversions) || 0;
              const cRate = views > 0 ? ((conversions / views) * 100).toFixed(1) : "0.0";
              const isPub = blog.isPublished !== false;

              return (
                <div 
                  key={blog._id} 
                  onClick={() => setSelectedBlog(blog)}
                  className="bg-neutral-950 border border-neutral-900 rounded-3xl p-5 space-y-4 relative overflow-hidden cursor-pointer"
                  id={`blog-card-${blog._id}`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-white leading-tight line-clamp-2">{blog.title}</p>
                      <p className="text-[8px] text-neutral-600 mt-1 truncate">/{blog.slug}</p>
                    </div>

                    <span className={cn(
                      "px-2 py-0.5 rounded text-[8px] font-bold uppercase border shrink-0",
                      isPub 
                        ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-500" 
                        : "bg-neutral-900 border-neutral-850 text-neutral-500"
                    )}>
                      {isPub ? "Pub" : "Draft"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {blog.tags?.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[7px] px-1.5 py-0.5 rounded bg-red-600/10 text-red-500 border border-red-500/15 font-bold uppercase">{tag}</span>
                    ))}
                  </div>

                  <div className="bg-neutral-900/40 p-3 rounded-xl border border-neutral-900/60 flex justify-between items-center text-[9px]">
                    <div className="text-neutral-500">Impressions: <strong className="text-white font-bold">{views.toLocaleString()}</strong></div>
                    <div className="text-neutral-500">Conversion Rate: <strong className="text-emerald-400 font-bold">{cRate}%</strong></div>
                  </div>

                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button 
                      size="sm" 
                      onClick={() => { setFormData(blog); setView("edit"); }} 
                      className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white rounded-xl text-[8px] font-black uppercase border border-neutral-850 h-auto"
                    >
                      <Edit3 size={12} className="mr-1" /> Edit
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleDelete(blog._id!)} 
                      className="flex-1 py-2.5 bg-red-600/5 hover:bg-red-600/10 text-red-500 rounded-xl text-[8px] font-black uppercase border border-red-500/10 h-auto"
                    >
                      <Trash2 size={12} className="mr-1" /> Purge
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* --- ARTICLE TELEMETRY DRAWER --- */}
        <AnimatePresence>
          {selectedBlog && (
            <div className="fixed inset-0 z-[200] flex" onClick={() => setSelectedBlog(null)}>
              {/* Backdrop */}
              <div className="flex-1 bg-black/60 backdrop-blur-sm" />

              {/* Panel */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 350 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-xl bg-neutral-950 border-l border-neutral-900 flex flex-col h-full overflow-hidden shadow-2xl relative"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-900 bg-neutral-950 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_#ef4444]" />
                    <span className="text-[10px] font-mono tracking-wider uppercase text-neutral-400 font-bold">
                      Editorial_Asset_Analysis
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedBlog(null)}
                    className="p-1.5 hover:bg-neutral-900 border border-transparent hover:border-neutral-850 rounded-lg text-neutral-500 hover:text-red-400 transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-36 font-mono text-[10px]">
                  
                  {/* Identification Card */}
                  <div className="p-4 bg-neutral-900/40 border border-neutral-900 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={cn(
                        "text-[8px] font-black border px-2 py-0.5 rounded uppercase tracking-wider",
                        selectedBlog.isPublished !== false ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-neutral-900 border-neutral-850 text-neutral-500"
                      )}>
                        {selectedBlog.isPublished !== false ? "PUBLISHED" : "DRAFT"}
                      </span>
                      <span className="text-[8px] text-neutral-600 font-bold uppercase">
                        TAGS: {selectedBlog.tags?.join(", ") || "NONE"}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-white leading-tight">{selectedBlog.title}</h3>
                    <p className="text-[8px] text-neutral-500">Public Slug: /{selectedBlog.slug}</p>
                  </div>

                  {/* Core Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-neutral-900/20 border border-neutral-900 p-4 rounded-xl">
                      <span className="text-[7px] text-neutral-500 uppercase block">Total Readers</span>
                      <span className="text-xl font-bold text-white mt-1 block">
                        {(Number(selectedBlog.meta?.views) || 0).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="bg-neutral-900/20 border border-neutral-900 p-4 rounded-xl">
                      <span className="text-[7px] text-neutral-500 uppercase block">Conversion Signups</span>
                      <span className="text-xl font-bold text-neutral-400 mt-1 block">
                        {(Number(selectedBlog.meta?.conversions) || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="bg-neutral-900/20 border border-neutral-900 p-4 rounded-xl col-span-2">
                      <span className="text-[7px] text-neutral-500 uppercase block">Reader conversion speed</span>
                      <span className="text-xl font-bold text-emerald-400 mt-1 block">
                        {(() => {
                          const v = Number(selectedBlog.meta?.views) || 0;
                          const c = Number(selectedBlog.meta?.conversions) || 0;
                          return v > 0 ? ((c / v) * 100).toFixed(1) : "0.0";
                        })()}% conversion efficiency
                      </span>
                    </div>
                  </div>

                  {/* Cohort Behavior Tracker */}
                  <div className="bg-neutral-900/20 border border-neutral-900 p-5 rounded-2xl space-y-4">
                    <h4 className="text-[9px] font-bold text-white uppercase flex items-center gap-1.5 border-b border-neutral-900 pb-2">
                      <BarChart2 size={12} className="text-purple-400" />
                      Content Acquisition & Scroll Depth
                    </h4>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] text-neutral-400 uppercase">
                          <span>Average Reading Retention</span>
                          <span className="font-bold text-white">76% scroll depth</span>
                        </div>
                        <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-900">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: "76%" }} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1 text-[8px] text-neutral-400 uppercase">
                        <div className="bg-neutral-950/40 p-2.5 rounded-lg border border-neutral-900/60">
                          <span>Attention Index</span>
                          <p className="text-[9px] font-bold text-white mt-1">{selectedBlog.meta?.readTime || "5 min"}</p>
                        </div>
                        <div className="bg-neutral-950/40 p-2.5 rounded-lg border border-neutral-900/60">
                          <span>Estimated Volatility</span>
                          <p className="text-[9px] font-bold text-emerald-400 mt-1">Low bounce</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI insights recommendations */}
                  <div className="bg-neutral-900/20 border border-neutral-900 p-5 rounded-2xl space-y-3">
                    <h4 className="text-[9px] font-bold text-white uppercase flex items-center gap-1.5 border-b border-neutral-900 pb-2">
                      <Zap size={12} className="text-yellow-500" />
                      AI Marketing Diagnostics
                    </h4>
                    
                    <div className="p-3.5 bg-neutral-950 border border-neutral-900 rounded-xl flex gap-2">
                      <Terminal size={14} className="text-red-500 shrink-0 mt-0.5" />
                      <p className="text-[8px] text-neutral-400 leading-relaxed">
                        This article (/{selectedBlog.slug}) drives baseline reader traffic. Since the tag <strong className="text-white">"{selectedBlog.tags?.[0] || 'study'}"</strong> exhibits high subscriber conversion ratios, we recommend pinning this post on the community search landing dashboard to boost impressions by an estimated 20%.
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2 border-t border-neutral-900/60">
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyBlogPublicLink(selectedBlog)}
                        className="flex-1 py-3 bg-neutral-900 border border-neutral-850 hover:bg-neutral-850 text-white rounded-xl text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                      >
                        <Copy size={12} />
                        Copy Link
                      </button>
                      
                      <button
                        onClick={() => togglePublishStatus(selectedBlog)}
                        className="flex-1 py-3 bg-neutral-900 border border-neutral-850 hover:bg-neutral-850 text-neutral-300 hover:text-white rounded-xl text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                      >
                        <PenTool size={12} />
                        {selectedBlog.isPublished !== false ? "Draft Article" : "Publish Article"}
                      </button>
                    </div>

                    <button
                      onClick={triggerMarketingBooster}
                      disabled={isBoosterLoading}
                      className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-red-600/10 active:scale-98 transition-all"
                    >
                      <Zap size={12} className={cn(isBoosterLoading && "animate-bounce text-yellow-300")} />
                      {isBoosterLoading ? "BOOST SEQUENCE ENGAGED..." : "TRIGGER MARKETING BOOSTER"}
                    </button>
                  </div>

                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    );
  }

  // --- VIEW: EDITOR (EDITING CONTENT) ---
  return (
    <div className="h-screen flex flex-col bg-[#000000] overflow-hidden font-mono">
      {/* Navbar */}
      <div className="h-16 border-b border-neutral-900 flex items-center justify-between px-4 md:px-6 bg-neutral-950/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="sm" onClick={() => setView("list")} className="text-neutral-500 hover:text-white hover:bg-neutral-900 border border-transparent hover:border-neutral-850 rounded-xl px-2 md:px-4">
            <ArrowLeft size={16} className="md:mr-2" /> <span className="hidden md:inline">Back</span>
          </Button>
          <div className="h-6 w-[1px] bg-neutral-900" />
          <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white truncate max-w-[120px] md:max-w-none flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
            {formData._id ? "Editing_Asset_Node" : "Deploy_Asset_Node"}
          </span>
        </div>
        
        {/* Mobile Tab Switcher */}
        <div className="flex lg:hidden bg-neutral-900/60 border border-neutral-850 p-1 rounded-xl">
          <button 
            onClick={() => setMobileTab("editor")} 
            className={cn(
              "px-3 py-1.5 rounded-lg text-[9px] uppercase font-black tracking-wider transition-all", 
              mobileTab === "editor" ? "bg-red-600 text-white" : "text-neutral-500"
            )}
          >
            Editor
          </button>
          <button 
            onClick={() => setMobileTab("preview")} 
            className={cn(
              "px-3 py-1.5 rounded-lg text-[9px] uppercase font-black tracking-wider transition-all", 
              mobileTab === "preview" ? "bg-red-600 text-white" : "text-neutral-500"
            )}
          >
            Preview
          </button>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsAiOpen(!isAiOpen)} 
            className={cn(
              "hidden md:flex border-red-600/30 hover:bg-red-600/10 font-bold uppercase text-[10px] rounded-xl h-10 px-4", 
              isAiOpen ? "bg-red-600/10 text-red-500" : "text-red-500"
            )}
          >
            <Sparkles size={14} className="mr-2" /> AI Inject
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-white text-black hover:bg-red-600 hover:text-white font-bold uppercase text-[10px] h-10 px-4 rounded-xl"
          >
            <Save size={14} className="md:mr-2" /> <span className="hidden md:inline">Deploy Node</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT: EDITOR CONTAINER */}
        <div className={cn(
          "w-full lg:w-1/2 overflow-y-auto border-r border-neutral-900 p-4 md:p-8 space-y-8 bg-[#050505] pb-32",
          mobileTab === "preview" ? "hidden lg:block" : "block"
        )}>
          
          {/* AI TOOLKIT TERMINAL */}
          <AnimatePresence>
            {isAiOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-4 md:p-5 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase text-red-500 flex items-center gap-2"><Bot size={14} /> AI Payload Injector</h3>
                    <Button size="sm" onClick={handleCopyPrompt} className="bg-red-600 hover:bg-red-700 text-white text-[10px] h-7 rounded-lg"><Copy size={12} className="mr-1"/>Copy System Prompt</Button>
                  </div>
                  <p className="text-[9px] text-neutral-500 uppercase tracking-tight leading-relaxed">
                    Uplink process: Copy prompt above → run inside LLM sandbox → paste outputs below → execute inject.
                  </p>
                  <Textarea
                    value={aiRawText}
                    onChange={e => setAiRawText(e.target.value)}
                    placeholder='Paste AI JSON payload here... {"title":"...","content":[...]}'
                    className="bg-black/50 border-neutral-900 text-xs font-mono min-h-[120px] rounded-xl focus:border-red-500/30 focus:outline-none"
                  />
                  <Button onClick={handleAiInject} disabled={!aiRawText.trim()} className="w-full bg-white text-black hover:bg-red-600 hover:text-white font-bold uppercase text-[10px] h-11 rounded-xl">
                    <Sparkles size={12} className="mr-2" /> Execute Injection
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* META SCHEMA PROTOCOL FORM */}
          <section className="space-y-5 bg-neutral-950/40 border border-neutral-900 p-5 rounded-2xl backdrop-blur-md">
            <h3 className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-2 border-b border-neutral-900 pb-2.5">
              <CheckCircle2 size={13} /> Meta Schema Protocol
            </h3>
            
            <div className="space-y-1.5">
              <span className="text-[8px] text-neutral-500 uppercase">Article Title *</span>
              <Input
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Write article headline..."
                className="bg-neutral-900 border-neutral-850 h-12 text-sm font-bold focus:border-red-500/40 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-[8px] text-neutral-500 uppercase">Subtitle / Editorial Hook</span>
              <Textarea
                value={formData.subtitle}
                onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Article tagline..."
                className="bg-neutral-900 border-neutral-850 focus:border-red-500/40 text-[11px] rounded-xl min-h-[70px]"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-[8px] text-neutral-500 uppercase">Public URL Slug *</span>
                <Input
                  value={formData.slug}
                  onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })}
                  placeholder="url-friendly-slug..."
                  className="bg-neutral-900 border-neutral-850 font-mono text-xs h-11 focus:border-red-500/40 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[8px] text-neutral-500 uppercase">Est. Attention Span</span>
                <Input
                  value={formData.meta.readTime}
                  onChange={e => setFormData({ ...formData, meta: { ...formData.meta, readTime: e.target.value } })}
                  placeholder="e.g. 5 min read"
                  className="bg-neutral-900 border-neutral-850 text-xs h-11 focus:border-red-500/40 rounded-xl"
                />
              </div>
            </div>

            {/* Tags Input */}
            <div className="space-y-2">
              <span className="text-[8px] text-neutral-500 uppercase block">Index Tags (comma separated)</span>
              <Input
                value={formData.tags.join(", ")}
                onChange={e => setFormData({ ...formData, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                placeholder="AI, Study, Prep, MCAT"
                className="bg-neutral-900 border-neutral-850 text-xs h-11 focus:border-red-500/40 rounded-xl"
              />
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {formData.tags.map(tag => (
                    <span key={tag} className="text-[8px] px-2 py-0.5 rounded bg-red-650/10 text-red-400 border border-red-500/20 font-bold uppercase">{tag}</span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Cover Image */}
            <div className="space-y-2">
              <span className="text-[8px] text-neutral-500 uppercase block">Cover Image visual</span>
              <div className="flex gap-2">
                <Input
                  value={formData.coverImage}
                  onChange={e => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="Paste URL or upload →"
                  className="bg-neutral-900 border-neutral-850 text-xs h-11 focus:border-red-500/40 rounded-xl"
                />
                <label className={cn(
                  "cursor-pointer flex items-center justify-center gap-1.5 px-4 rounded-xl border text-[9px] font-bold uppercase transition-all shrink-0 h-11",
                  coverUploading ? "bg-blue-600/20 text-blue-400 border-blue-600/30 cursor-wait" : "bg-neutral-900 hover:bg-neutral-850 border-neutral-850 text-neutral-400 hover:text-white"
                )}>
                  <UploadCloud size={14} className={coverUploading ? "animate-pulse" : ""} />
                  <span>{coverUploading ? "Uploading…" : "Upload"}</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    disabled={coverUploading}
                    onChange={async (e) => {
                      if (e.target.files?.[0]) {
                        await handleCoverUpload(e.target.files[0]);
                        e.target.value = "";
                      }
                    }}
                  />
                </label>
              </div>
              {formData.coverImage && (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-neutral-900 bg-neutral-950">
                  <img src={formData.coverImage} className="w-full h-full object-cover" alt="Cover preview" />
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, coverImage: "" }))}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 text-white hover:text-red-500 border border-neutral-800 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* CONTENT BLOCKS BUILDER */}
          <section className="space-y-5 bg-neutral-950/40 border border-neutral-900 p-5 rounded-2xl backdrop-blur-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sticky top-0 bg-neutral-950/90 z-10 py-3 border-b border-neutral-900 gap-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500">Content Telemetry Blocks ({formData.content.length})</h3>
              <div className="flex gap-0.5 bg-neutral-900 border border-neutral-850 p-1 rounded-xl overflow-x-auto w-full sm:w-auto scrollbar-hide">
                <IconButton icon={Type} label="Para" onClick={() => addBlock("paragraph")} />
                <IconButton icon={Hash} label="Head" onClick={() => addBlock("heading")} />
                <IconButton icon={Quote} label="Quote" onClick={() => addBlock("quote")} />
                <IconButton icon={ImageIcon} label="Img" onClick={() => addBlock("image")} />
                <IconButton icon={Code} label="Code" onClick={() => addBlock("code")} />
                <IconButton icon={Video} label="YT" onClick={() => addBlock("youtube")} />
                <IconButton icon={List} label="List" onClick={() => addBlock("list")} />
                <IconButton icon={Table} label="Table" onClick={() => addBlock("table")} />
              </div>
            </div>

            {formData.content.length === 0 && (
              <div className="text-center py-10 text-neutral-600 text-xs border border-dashed border-neutral-900 rounded-xl">
                No blocks logged. Choose a block type above to begin deployment.
              </div>
            )}

            <Reorder.Group axis="y" values={formData.content} onReorder={(newContent) => setFormData({ ...formData, content: newContent })} className="space-y-4">
              {formData.content.map((block) => (
                <Reorder.Item key={block.id} value={block}>
                  <div className="group relative bg-neutral-950 border border-neutral-900 rounded-xl p-4 hover:border-neutral-800 transition-all">
                    
                    {/* Block Action Controls */}
                    <div className="absolute right-3 top-3 flex gap-1 z-10">
                      <div className="cursor-grab p-1 text-neutral-500 hover:text-white active:cursor-grabbing"><GripVertical size={13} /></div>
                      <button
                        onClick={() => setFormData(p => ({ ...p, content: p.content.filter(b => b.id !== block.id) }))}
                        className="p-1 text-neutral-500 hover:text-red-500"
                      >
                        <X size={13} />
                      </button>
                    </div>

                    <div className="pr-12">
                      <span className="text-[8px] font-black uppercase text-neutral-500 mb-3 block tracking-widest flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                        {block.type.toUpperCase()}
                      </span>
                      
                      {block.type === "paragraph" && (
                        <Textarea 
                          value={block.text} 
                          onChange={(e) => updateBlock(block.id, "text", e.target.value)} 
                          className="bg-transparent border-none p-0 text-xs min-h-[80px] focus-visible:ring-0 resize-none text-neutral-300" 
                          placeholder="Write paragraph content here..." 
                        />
                      )}
                      
                      {block.type === "heading" && (
                        <div className="flex gap-2">
                          <select 
                            value={block.level || 2} 
                            onChange={(e) => updateBlock(block.id, "level", parseInt(e.target.value))} 
                            className="bg-neutral-900 border border-neutral-850 rounded-lg px-2 text-[10px] h-9 text-neutral-300 shrink-0 cursor-pointer"
                          >
                            <option value={2}>H2</option>
                            <option value={3}>H3</option>
                          </select>
                          <Input 
                            value={block.text} 
                            onChange={(e) => updateBlock(block.id, "text", e.target.value)} 
                            className="bg-transparent border-neutral-850 h-9 font-bold text-xs" 
                            placeholder="Heading title..." 
                          />
                        </div>
                      )}

                      {block.type === "quote" && (
                        <div className="space-y-2">
                          <Textarea 
                            value={block.text} 
                            onChange={(e) => updateBlock(block.id, "text", e.target.value)} 
                            className="bg-transparent border-l-2 border-red-500 pl-4 italic min-h-[60px] focus-visible:ring-0 resize-none text-xs" 
                            placeholder="Quote body..." 
                          />
                          <Input 
                            value={block.author} 
                            onChange={(e) => updateBlock(block.id, "author", e.target.value)} 
                            className="bg-transparent border-none text-[9px] text-neutral-500 h-6 pl-4" 
                            placeholder="— Author name..." 
                          />
                        </div>
                      )}

                      {block.type === "image" && (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input 
                              value={block.src} 
                              onChange={(e) => updateBlock(block.id, "src", e.target.value)} 
                              className="bg-neutral-900 border-neutral-850 text-xs h-9" 
                              placeholder="Image public URL..." 
                            />
                            <label className="cursor-pointer bg-neutral-900 hover:bg-neutral-850 border border-neutral-850 rounded-lg px-3 flex items-center justify-center shrink-0 gap-1.5 text-[9px] text-neutral-400">
                              <UploadCloud size={14} />
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleImageUploadForBlock(block.id, e.target.files[0]); e.currentTarget.value = ""; }} />
                            </label>
                          </div>
                          {block.src && <img src={block.src} className="w-full rounded-lg border border-neutral-900 max-h-36 object-cover" alt="Preview" />}
                          <Input 
                            value={block.caption} 
                            onChange={(e) => updateBlock(block.id, "caption", e.target.value)} 
                            className="bg-transparent border-none text-[9px] text-neutral-500 h-6" 
                            placeholder="Image caption (optional)..." 
                          />
                        </div>
                      )}

                      {block.type === "code" && (
                        <div className="space-y-2">
                          <Input 
                            value={block.language} 
                            onChange={(e) => updateBlock(block.id, "language", e.target.value)} 
                            className="bg-neutral-900 border-neutral-850 text-xs w-32 h-9" 
                            placeholder="Language (e.g. javascript)" 
                          />
                          <Textarea 
                            value={block.code} 
                            onChange={(e) => updateBlock(block.id, "code", e.target.value)} 
                            className="bg-[#0c0c0c] border border-neutral-900 font-mono text-[10px] min-h-[120px] resize-none p-3 rounded-lg text-emerald-400 focus:outline-none" 
                            placeholder="// write code block..." 
                          />
                        </div>
                      )}

                      {block.type === "youtube" && (
                        <div className="space-y-2">
                          <Input
                            value={block.text}
                            onChange={(e) => updateBlock(block.id, "text", e.target.value)}
                            className="bg-neutral-900 border-neutral-850 text-xs h-9"
                            placeholder="YouTube share link..."
                          />
                          {block.text && (
                            <div className="text-[8px] text-neutral-600 font-mono">
                              RESOLVED_VIDEO_ID: {extractYoutubeId(block.text)}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {block.type === "list" && (
                        <div className="space-y-1">
                          <p className="text-[8px] text-neutral-600 mb-1">One line per list item</p>
                          <Textarea
                            value={block.items?.join("\n")}
                            onChange={(e) => updateBlock(block.id, "items", e.target.value.split("\n"))}
                            className="bg-transparent border-neutral-850 text-xs min-h-[80px] resize-none"
                            placeholder={"First list item\nSecond list item"}
                          />
                        </div>
                      )}

                      {block.type === "table" && (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <p className="text-[8px] text-neutral-500 uppercase">Headers (comma split)</p>
                            <Input
                              value={block.headers?.join(", ") || ""}
                              onChange={(e) => updateBlock(block.id, "headers", e.target.value.split(",").map(h => h.trim()))}
                              className="bg-neutral-900 border-neutral-850 text-xs font-mono h-9"
                              placeholder="Header 1, Header 2, Header 3"
                            />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[8px] text-neutral-500 uppercase">Rows (separate cells by | )</p>
                            <Textarea
                              value={block.rows?.map(r => r.join(" | ")).join("\n") || ""}
                              onChange={(e) => {
                                const rows = e.target.value.split("\n").map(line => line.split("|").map(cell => cell.trim()));
                                updateBlock(block.id, "rows", rows);
                              }}
                              className="bg-neutral-900 border-neutral-850 text-xs font-mono min-h-[80px] resize-none"
                              placeholder={"Cell A1 | Cell A2\nCell B1 | Cell B2"}
                            />
                          </div>
                          
                          {block.headers && block.headers.length > 0 && (
                            <div className="overflow-x-auto rounded-lg border border-neutral-900 text-[9px] bg-neutral-950">
                              <table className="w-full">
                                <thead className="bg-[#0b0b0b]">
                                  <tr>{block.headers.map((h, i) => <th key={i} className="px-2 py-1 text-left text-neutral-500 font-bold border-b border-neutral-900">{h}</th>)}</tr>
                                </thead>
                                <tbody>
                                  {block.rows?.slice(0, 3).map((row, rI) => (
                                    <tr key={rI} className="border-t border-neutral-900">
                                      {row.map((cell, cI) => <td key={cI} className="px-2 py-1 text-neutral-400">{cell}</td>)}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
            
            <Button onClick={() => addBlock("paragraph")} variant="ghost" className="w-full border-dashed border border-neutral-900 text-neutral-500 hover:text-white hover:bg-neutral-900/40 h-12 rounded-xl">
              <Plus size={16} className="mr-2" /> Add Content Block
            </Button>
          </section>
        </div>

        {/* RIGHT: LIVE PREVIEW CONTAINER */}
        <div className={cn(
          "w-full lg:w-1/2 bg-[#000000] p-4 md:p-8 border-l border-neutral-900 relative overflow-hidden",
          mobileTab === "editor" ? "hidden lg:block" : "block"
        )}>
          <div className="absolute top-4 right-4 z-10 bg-black/90 px-3 py-1 rounded-full text-[8px] font-black uppercase text-neutral-500 border border-neutral-850 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Preview
          </div>
          <div className="h-full overflow-y-auto">
            <PreviewRenderer data={formData} />
          </div>
        </div>

      </div>
    </div>
  );
}

const IconButton = ({ icon: Icon, label, onClick }: any) => (
  <button
    onClick={onClick}
    title={label}
    className="p-2 min-w-[34px] hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors flex flex-col items-center gap-0.5 group shrink-0"
  >
    <Icon size={14} />
    <span className="text-[6px] uppercase font-black tracking-wider text-neutral-600 group-hover:text-neutral-400 hidden sm:block mt-0.5">{label}</span>
  </button>
);