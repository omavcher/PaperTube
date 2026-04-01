"use client";

import React, { useState, useEffect } from "react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { 
  Save, Trash2, Edit3, Plus, X, 
  Image as ImageIcon, Type, Code, Video, 
  List, MoreVertical, GripVertical,
  CheckCircle2, ArrowLeft, Clock,
  Bot, Copy, Sparkles, UploadCloud,
  Eye, PenTool, Hash, Table, Quote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  meta: { readTime: string; views?: string | number };
  tags: string[];
  coverImage: string;
  toc: { id: string; label: string }[];
  content: ContentBlock[];
  createdAt?: string;
}

const DEFAULT_POST: BlogPost = {
  title: "",
  subtitle: "",
  slug: "",
  author: { name: "Admin", role: "Chief Editor", avatar: "https://github.com/shadcn.png" },
  meta: { readTime: "5 min", views: "0" },
  tags: [],
  coverImage: "",
  toc: [],
  content: []
};

// --- PREVIEW RENDERER ---
const PreviewRenderer = ({ data }: { data: BlogPost }) => {
  return (
    <div className="bg-[#050505] text-white font-sans p-4 md:p-10 rounded-[2rem] border border-white/10 h-full overflow-y-auto shadow-2xl">
      <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">
        {/* Cover */}
        {data.coverImage ? (
          <div className="aspect-video rounded-xl md:rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl">
            <img src={data.coverImage} className="w-full h-full object-cover" alt="Cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6">
               <div className="flex flex-wrap gap-2 mb-3">
                 {data.tags.map(tag => (
                   <Badge key={tag} className="bg-red-600/20 text-red-500 border-red-600/30 backdrop-blur-md text-[9px] uppercase tracking-wider">{tag}</Badge>
                 ))}
               </div>
               <h1 className="text-2xl md:text-5xl font-black text-white leading-tight drop-shadow-xl">{data.title || "Untitled Post"}</h1>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-2">
                 {data.tags.map(tag => (
                   <Badge key={tag} className="bg-red-600/20 text-red-500 border-red-600/30 text-[9px] uppercase tracking-wider">{tag}</Badge>
                 ))}
            </div>
            <h1 className="text-3xl md:text-6xl font-black text-white leading-tight">{data.title || "Untitled Post"}</h1>
          </>
        )}

        <div className="flex items-center gap-3 md:gap-4 py-3 md:py-4 border-b border-white/10">
          <Avatar className="h-8 w-8 md:h-10 md:w-10 border border-white/10"><AvatarImage src={data.author.avatar} /></Avatar>
          <div className="flex-1">
            <p className="text-xs md:text-sm font-bold text-white">{data.author.name}</p>
            <p className="text-[9px] md:text-[10px] text-neutral-500 uppercase tracking-widest">{data.meta.readTime}</p>
          </div>
        </div>

        <p className="text-base md:text-xl text-neutral-300 italic font-medium leading-relaxed">{data.subtitle}</p>

        <div className="space-y-6 md:space-y-8 text-neutral-300 font-light leading-relaxed text-sm md:text-base">
          {data.content.map((block) => (
            <div key={block.id}>
              {block.type === "paragraph" && <p className="leading-7 whitespace-pre-line">{block.text}</p>}
              
              {block.type === "heading" && (
                <h2 className={cn("font-black text-white mt-8 mb-3 flex items-center gap-2", block.level === 3 ? "text-lg md:text-xl" : "text-2xl md:text-3xl")}>
                  <span className="text-red-600">#</span> {block.text}
                </h2>
              )}

              {block.type === "quote" && (
                <div className="bg-[#111] border-l-4 border-red-600 p-4 md:p-6 rounded-r-xl my-6">
                  <p className="text-lg md:text-xl font-black italic text-white mb-2">"{block.text}"</p>
                  <p className="text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-widest">— {block.author}</p>
                </div>
              )}

              {block.type === "image" && (
                <figure className="my-6">
                  <img src={block.src} className="w-full rounded-xl border border-white/10 shadow-lg" alt="Block" />
                  {block.caption && <figcaption className="text-center text-[10px] md:text-xs text-neutral-500 mt-2 italic">{block.caption}</figcaption>}
                </figure>
              )}

              {block.type === "code" && (
                <div className="bg-[#151515] border border-white/10 rounded-xl overflow-hidden my-6 shadow-2xl">
                  <div className="bg-[#1a1a1a] px-3 py-2 border-b border-white/5 text-[9px] md:text-[10px] font-mono text-neutral-500 uppercase flex justify-between">
                    <span>{block.language}</span>
                    <div className="flex gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"/><div className="w-2 h-2 rounded-full bg-yellow-500"/><div className="w-2 h-2 rounded-full bg-green-500"/></div>
                  </div>
                  <pre className="p-3 md:p-4 overflow-x-auto text-[10px] md:text-sm font-mono text-green-400"><code>{block.code}</code></pre>
                </div>
              )}

              {block.type === "list" && (
                <ul className="space-y-2 md:space-y-3 my-4 md:my-6 pl-4 border-l border-white/10">
                  {block.items?.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-red-600 mt-1.5 text-[10px]">●</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {block.type === "table" && (
                <div className="my-6 overflow-x-auto rounded-xl border border-white/10 bg-[#0f0f0f]">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#1a1a1a] text-xs uppercase font-black tracking-wider text-neutral-400">
                      <tr>
                        {block.headers?.map((h, i) => (
                          <th key={i} className="px-4 py-3 border-b border-white/5">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {block.rows?.map((row, rI) => (
                        <tr key={rI} className="hover:bg-white/[0.02]">
                          {row.map((cell, cI) => (
                            <td key={cI} className="px-4 py-3 font-medium text-neutral-300">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {block.type === "youtube" && (
                 <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black my-6 relative">
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
  const authToken = typeof window !== 'undefined' ? localStorage.getItem("authToken") || "" : "";

  useEffect(() => { fetchBlogs(); }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/blog/all", { headers: { Authorization: `Bearer ${authToken}` } });
      setBlogs(res.data.data);
    } catch (err) { toast.error("Database connection failed"); }
    setLoading(false);
  };

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
      const cleanJson = aiRawText.replace(/```json/g, "").replace(/```/g, "").trim();
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
          // Ensure arrays are parsed properly
          items: Array.isArray(block.items) ? block.items : block.items ? [block.items] : undefined,
          headers: Array.isArray(block.headers) ? block.headers : block.headers ? [block.headers] : undefined,
          rows: Array.isArray(block.rows) ? block.rows : undefined,
        }))
      }));

      toast.success("Neural data injected successfully ✓");
      setIsAiOpen(false);
      setAiRawText("");
    } catch (err) {
      toast.error("Failed to parse AI JSON. Check format.");
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

  // --- VIEW: LIST ---
  if (view === "list") {
    return (
      <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-6 md:space-y-8 min-h-screen bg-[#000000]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black italic uppercase text-white">Blog <span className="text-red-600">Console</span></h1>
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1">Status: Online</p>
          </div>
          <Button
            onClick={() => { setFormData({ ...DEFAULT_POST, content: [] }); setView("edit"); }}
            className="bg-white text-black hover:bg-red-600 hover:text-white rounded-xl font-black uppercase text-[10px] h-12 px-6 w-full md:w-auto"
          >
            <Plus size={16} className="mr-2" /> Initialize New
          </Button>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="p-20 text-center"><Bot className="animate-bounce mx-auto text-red-600" /></div>
          ) : blogs.length === 0 ? (
            <div className="p-20 text-center text-neutral-600 text-sm">No posts found. Create one to get started.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-white/[0.02] border-b border-white/5">
                  <tr>
                    <th className="p-4 md:p-6 text-[10px] font-black uppercase text-neutral-500">Title</th>
                    <th className="p-4 md:p-6 text-[10px] font-black uppercase text-neutral-500">Tags</th>
                    <th className="p-4 md:p-6 text-[10px] font-black uppercase text-neutral-500">Date</th>
                    <th className="p-4 md:p-6 text-right text-[10px] font-black uppercase text-neutral-500">Ops</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {blogs.map(blog => (
                    <tr key={blog._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 md:p-6 font-bold text-white text-sm max-w-xs">
                        <div className="line-clamp-1">{blog.title}</div>
                        <div className="text-[10px] text-neutral-600 font-mono mt-0.5">{blog.slug}</div>
                      </td>
                      <td className="p-4 md:p-6">
                        <div className="flex flex-wrap gap-1">
                          {blog.tags?.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-red-600/10 text-red-500 font-bold uppercase">{tag}</span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 md:p-6 text-xs text-neutral-500 font-mono whitespace-nowrap">
                        {formatDate(blog.createdAt || "")}
                      </td>
                      <td className="p-4 md:p-6 flex justify-end gap-2">
                        <Button size="icon" variant="ghost" onClick={() => { setFormData(blog); setView("edit"); }}><Edit3 size={16} /></Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(blog._id!)} className="text-red-500"><Trash2 size={16} /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- VIEW: EDITOR ---
  return (
    <div className="h-screen flex flex-col bg-[#000000] overflow-hidden">
      {/* Navbar */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-4 md:px-6 bg-[#0a0a0a] shrink-0">
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="sm" onClick={() => setView("list")} className="text-neutral-500 hover:text-white px-2 md:px-4">
            <ArrowLeft size={16} className="md:mr-2" /> <span className="hidden md:inline">Back</span>
          </Button>
          <div className="h-6 w-[1px] bg-white/10" />
          <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white truncate max-w-[120px] md:max-w-none">
            {formData._id ? "Editing Post" : "New Post"}
          </span>
        </div>
        
        {/* Mobile Tab Switcher */}
        <div className="flex lg:hidden bg-white/5 p-1 rounded-lg">
          <button onClick={() => setMobileTab("editor")} className={cn("p-2 rounded-md transition-all", mobileTab === "editor" ? "bg-white text-black" : "text-neutral-500")}>
            <PenTool size={14} />
          </button>
          <button onClick={() => setMobileTab("preview")} className={cn("p-2 rounded-md transition-all", mobileTab === "preview" ? "bg-white text-black" : "text-neutral-500")}>
            <Eye size={14} />
          </button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsAiOpen(!isAiOpen)} className={cn("hidden md:flex border-red-600/30 hover:bg-red-600/10 font-bold uppercase text-[10px]", isAiOpen ? "bg-red-600/10 text-red-500" : "text-red-500")}>
            <Sparkles size={14} className="mr-2" /> AI Inject
          </Button>
          <Button onClick={handleSave} className="bg-white text-black hover:bg-red-600 hover:text-white font-bold uppercase text-[10px] h-8 md:h-10 px-3 md:px-4">
            <Save size={14} className="md:mr-2" /> <span className="hidden md:inline">Deploy</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT: EDITOR */}
        <div className={cn(
          "w-full lg:w-1/2 overflow-y-auto border-r border-white/10 p-4 md:p-8 space-y-8 bg-[#050505]",
          mobileTab === "preview" ? "hidden lg:block" : "block"
        )}>
          
          {/* AI TOOLKIT */}
          <AnimatePresence>
            {isAiOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="bg-gradient-to-b from-red-900/10 to-transparent border border-red-600/20 rounded-2xl p-4 md:p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase text-red-500 flex items-center gap-2"><Bot size={14} /> AI Auto-Inject</h3>
                    <Button size="sm" onClick={handleCopyPrompt} className="bg-red-600 hover:bg-red-700 text-white text-[10px] h-7"><Copy size={12} className="mr-1"/>Copy Prompt</Button>
                  </div>
                  <p className="text-[10px] text-neutral-600">1. Copy the prompt above → paste in ChatGPT/Gemini with your topic → copy the JSON response → paste below → click Inject.</p>
                  <Textarea
                    value={aiRawText}
                    onChange={e => setAiRawText(e.target.value)}
                    placeholder='Paste AI JSON response here... {"title":"...","content":[...]}'
                    className="bg-black/50 border-red-600/20 text-xs font-mono min-h-[120px]"
                  />
                  <Button onClick={handleAiInject} disabled={!aiRawText.trim()} className="w-full bg-white text-black hover:bg-red-600 hover:text-white font-bold uppercase text-[10px]">
                    <Sparkles size={12} className="mr-2" /> Auto-Inject Data
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* META FORM */}
          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-red-600 mb-4 flex items-center gap-2"><CheckCircle2 size={12} /> Meta Protocol</h3>
            <Input
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="Article Title *"
              className="bg-white/5 border-white/10 h-12 md:h-14 text-lg font-bold"
            />
            <Textarea
              value={formData.subtitle}
              onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="Subtitle / Hook — shown below title"
              className="bg-white/5 border-white/10"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })}
                placeholder="url-friendly-slug *"
                className="bg-white/5 border-white/10 font-mono text-sm"
              />
              <Input
                value={formData.meta.readTime}
                onChange={e => setFormData({ ...formData, meta: { ...formData.meta, readTime: e.target.value } })}
                placeholder="Read Time (e.g. 6 min read)"
                className="bg-white/5 border-white/10"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Tags (comma separated)</label>
              <Input
                value={formData.tags.join(", ")}
                onChange={e => setFormData({ ...formData, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                placeholder="AI, Technology, Guide"
                className="bg-white/5 border-white/10"
              />
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {formData.tags.map(tag => (
                    <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full bg-red-600/10 text-red-500 border border-red-600/20 font-bold uppercase">{tag}</span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Cover Image Upload */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Cover Image</label>
              <div className="flex gap-2">
                <Input
                  value={formData.coverImage}
                  onChange={e => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="Paste image URL or upload →"
                  className="bg-white/5 border-white/10 text-sm"
                />
                <label className={cn(
                  "cursor-pointer flex items-center gap-2 px-4 rounded-lg border border-white/10 text-xs font-bold uppercase transition-all shrink-0",
                  coverUploading ? "bg-blue-600/20 text-blue-400 border-blue-600/30 cursor-wait" : "bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white"
                )}>
                  <UploadCloud size={14} className={coverUploading ? "animate-pulse" : ""} />
                  <span className="hidden sm:inline">{coverUploading ? "Uploading…" : "Upload"}</span>
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
                <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-neutral-900">
                  <img src={formData.coverImage} className="w-full h-full object-cover" alt="Cover preview" />
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, coverImage: "" }))}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/70 text-white hover:text-red-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </section>

          <div className="h-[1px] bg-white/10" />

          {/* BLOCKS EDITOR */}
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between sticky top-0 bg-[#050505] z-10 py-4 border-b border-white/5 gap-4 md:gap-0">
              <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500">Content Blocks ({formData.content.length})</h3>
              <div className="flex gap-1 bg-white/5 p-1 rounded-lg overflow-x-auto w-full md:w-auto scrollbar-hide">
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
              <div className="text-center py-12 text-neutral-700 text-sm border border-dashed border-white/10 rounded-xl">
                No blocks yet. Click a block type above to add content.
              </div>
            )}

            <Reorder.Group axis="y" values={formData.content} onReorder={(newContent) => setFormData({ ...formData, content: newContent })} className="space-y-4">
              {formData.content.map((block) => (
                <Reorder.Item key={block.id} value={block}>
                  <div className="group relative bg-[#0f0f0f] border border-white/5 rounded-xl p-4 hover:border-white/20 transition-all">
                    <div className="absolute right-2 top-2 flex gap-1 z-10">
                      <div className="cursor-grab p-1 hover:text-white text-neutral-500 active:cursor-grabbing"><GripVertical size={14} /></div>
                      <button
                        onClick={() => setFormData(p => ({ ...p, content: p.content.filter(b => b.id !== block.id) }))}
                        className="p-1 hover:text-red-500 text-neutral-500"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="pr-12">
                      <span className="text-[9px] font-black uppercase text-neutral-600 mb-3 block tracking-widest flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600/60" />
                        {block.type}
                      </span>
                      
                      {block.type === "paragraph" && (
                        <Textarea value={block.text} onChange={(e) => updateBlock(block.id, "text", e.target.value)} className="bg-transparent border-none p-0 text-sm min-h-[80px] focus-visible:ring-0 resize-none" placeholder="Write your paragraph content here..." />
                      )}
                      
                      {block.type === "heading" && (
                        <div className="flex gap-2">
                          <select value={block.level || 2} onChange={(e) => updateBlock(block.id, "level", parseInt(e.target.value))} className="bg-black border border-white/10 rounded px-2 text-xs h-10 text-neutral-300 shrink-0">
                            <option value={2}>H2</option>
                            <option value={3}>H3</option>
                          </select>
                          <Input value={block.text} onChange={(e) => updateBlock(block.id, "text", e.target.value)} className="bg-transparent border-white/10 h-10 font-bold" placeholder="Section heading..." />
                        </div>
                      )}

                      {block.type === "quote" && (
                        <div className="space-y-2">
                          <Textarea value={block.text} onChange={(e) => updateBlock(block.id, "text", e.target.value)} className="bg-transparent border-l-2 border-red-600 pl-4 italic min-h-[60px] focus-visible:ring-0 resize-none" placeholder="Quote text..." />
                          <Input value={block.author} onChange={(e) => updateBlock(block.id, "author", e.target.value)} className="bg-transparent border-none text-xs text-neutral-500" placeholder="— Author Name, Title" />
                        </div>
                      )}

                      {block.type === "image" && (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input value={block.src} onChange={(e) => updateBlock(block.id, "src", e.target.value)} className="bg-black/50 border-white/10 text-xs" placeholder="Image URL" />
                            <label className="cursor-pointer bg-white/10 hover:bg-white/20 rounded-md px-3 flex items-center justify-center shrink-0 gap-1.5 text-xs text-neutral-400">
                              <UploadCloud size={14} />
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleImageUploadForBlock(block.id, e.target.files[0]); e.currentTarget.value = ""; }} />
                            </label>
                          </div>
                          {block.src && <img src={block.src} className="w-full rounded-lg border border-white/10 max-h-40 object-cover" alt="Preview" />}
                          <Input value={block.caption} onChange={(e) => updateBlock(block.id, "caption", e.target.value)} className="bg-transparent border-none text-xs text-neutral-500" placeholder="Caption (optional)" />
                        </div>
                      )}

                      {block.type === "code" && (
                        <div className="space-y-2">
                          <Input value={block.language} onChange={(e) => updateBlock(block.id, "language", e.target.value)} className="bg-black/50 border-white/10 text-xs w-32" placeholder="Language (e.g. python)" />
                          <Textarea value={block.code} onChange={(e) => updateBlock(block.id, "code", e.target.value)} className="bg-[#151515] border-white/5 font-mono text-xs min-h-[120px] resize-none" placeholder="// code here..." />
                        </div>
                      )}

                      {block.type === "youtube" && (
                        <div className="space-y-2">
                          <Input
                            value={block.text}
                            onChange={(e) => updateBlock(block.id, "text", e.target.value)}
                            className="bg-black/50 border-white/10 text-xs"
                            placeholder="YouTube URL (e.g. https://youtu.be/dQw4w9WgXcQ)"
                          />
                          {block.text && (
                            <div className="text-[10px] text-neutral-600 font-mono">
                              ID: {extractYoutubeId(block.text)}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {block.type === "list" && (
                        <div className="space-y-1">
                          <p className="text-[10px] text-neutral-600 mb-2">One item per line</p>
                          <Textarea
                            value={block.items?.join("\n")}
                            onChange={(e) => updateBlock(block.id, "items", e.target.value.split("\n"))}
                            className="bg-transparent border-white/10 text-sm min-h-[80px] resize-none"
                            placeholder={"Item one\nItem two\nItem three"}
                          />
                        </div>
                      )}

                      {block.type === "table" && (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <p className="text-[10px] text-neutral-600">Headers (comma separated)</p>
                            <Input
                              value={block.headers?.join(", ") || ""}
                              onChange={(e) => updateBlock(block.id, "headers", e.target.value.split(",").map(h => h.trim()))}
                              className="bg-black/50 border-white/10 text-xs font-mono"
                              placeholder="Column 1, Column 2, Column 3"
                            />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-neutral-600">Rows (one row per line, cells separated by |)</p>
                            <Textarea
                              value={block.rows?.map(r => r.join(" | ")).join("\n") || ""}
                              onChange={(e) => {
                                const rows = e.target.value.split("\n").map(line => line.split("|").map(cell => cell.trim()));
                                updateBlock(block.id, "rows", rows);
                              }}
                              className="bg-black/50 border-white/10 text-xs font-mono min-h-[80px] resize-none"
                              placeholder={"Cell 1 | Cell 2 | Cell 3\nCell A | Cell B | Cell C"}
                            />
                          </div>
                          {/* Preview mini table */}
                          {block.headers && block.headers.length > 0 && (
                            <div className="overflow-x-auto rounded-lg border border-white/5 text-[10px]">
                              <table className="w-full">
                                <thead className="bg-white/5">
                                  <tr>{block.headers.map((h, i) => <th key={i} className="px-2 py-1 text-left text-neutral-400 font-bold">{h}</th>)}</tr>
                                </thead>
                                <tbody>
                                  {block.rows?.slice(0, 3).map((row, rI) => (
                                    <tr key={rI} className="border-t border-white/5">
                                      {row.map((cell, cI) => <td key={cI} className="px-2 py-1 text-neutral-500">{cell}</td>)}
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
            
            <Button onClick={() => addBlock("paragraph")} variant="ghost" className="w-full border-dashed border border-white/10 text-neutral-500 hover:text-white h-12">
              <Plus size={16} className="mr-2" /> Add Block
            </Button>
          </section>
        </div>

        {/* RIGHT: PREVIEW */}
        <div className={cn(
          "w-full lg:w-1/2 bg-[#000000] p-4 md:p-8 border-l border-white/5 relative overflow-hidden",
          mobileTab === "editor" ? "hidden lg:block" : "block"
        )}>
          <div className="absolute top-4 right-4 z-10 bg-black/80 px-3 py-1 rounded-full text-[10px] font-black uppercase text-neutral-500 border border-white/10 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live Preview
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
    className="p-2 min-w-[36px] hover:bg-white/10 rounded-md text-neutral-400 hover:text-white transition-colors flex flex-col items-center gap-0.5 group"
  >
    <Icon size={15} />
    <span className="text-[7px] uppercase font-black tracking-wider text-neutral-700 group-hover:text-neutral-400 hidden sm:block">{label}</span>
  </button>
);