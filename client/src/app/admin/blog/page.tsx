"use client";

import React, { useState, useEffect } from "react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { 
  Save, Trash2, Edit3, Plus, X, 
  Image as ImageIcon, Type, Code, Video, 
  List, MoreVertical, GripVertical,
  CheckCircle2, ArrowLeft, Clock,
  Bot, Copy, Sparkles, UploadCloud,
  Eye, PenTool, Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/config/api";
import { cn } from "@/lib/utils";

// --- CONFIGURATION ---
const CLOUDINARY_PRESET = "share-story";
const CLOUDINARY_CLOUD_NAME = "dieklmzt6";

// --- AI PROMPT TEMPLATE (Updated with Tags) ---
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
  meta: { date: string; readTime: string; views: string };
  tags: string[];
  coverImage: string;
  toc: { id: string; label: string }[];
  content: ContentBlock[];
}

const DEFAULT_POST: BlogPost = {
  title: "",
  subtitle: "",
  slug: "",
  author: { name: "Admin", role: "Chief Editor", avatar: "https://github.com/shadcn.png" },
  meta: { date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), readTime: "5 min", views: "0" },
  tags: [],
  coverImage: "",
  toc: [],
  content: []
};

// --- PREVIEW RENDERER ---
const PreviewRenderer = ({ data }: { data: BlogPost }) => {
  return (
    <div className="bg-[#050505] text-white font-sans p-4 md:p-10 rounded-[2rem] border border-white/10 h-full overflow-y-auto custom-scrollbar shadow-2xl">
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
            <p className="text-[9px] md:text-[10px] text-neutral-500 uppercase tracking-widest">{data.meta.date} • {data.meta.readTime}</p>
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
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor"); // For mobile switching
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [formData, setFormData] = useState<BlogPost>(DEFAULT_POST);
  const [aiRawText, setAiRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const authToken = localStorage.getItem("authToken") || ""; 

  useEffect(() => { fetchBlogs(); }, []);
  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/blog/all" , { headers: { Authorization: `Bearer ${authToken}` } });
      setBlogs(res.data.data);
    } catch (err) { toast.error("Database connection failed"); }
    setLoading(false);
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", CLOUDINARY_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: data });
    const json = await res.json();
    return json.secure_url;
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
        meta: { ...prev.meta, readTime: parsed.readTime || prev.meta.readTime },
        tags: parsed.tags || [],
        content: parsed.content.map((block: any) => ({ ...block, id: crypto.randomUUID() }))
      }));
      toast.success("Neural data injected successfully");
      setIsAiOpen(false);
      setAiRawText("");
    } catch (err) { toast.error("Failed to parse AI response."); }
  };

  // --- CRUD ---
  const handleSave = async () => {
    if (!formData.title) return toast.error("Title required");
    try {
      if (formData._id) {
        await api.patch(`/admin/blog/update/${formData._id}`, formData , { headers: { Authorization: `Bearer ${authToken}` } });
        toast.success("Protocol Updated");
      } else {
        await api.post("/admin/blog/create", formData , { headers: { Authorization: `Bearer ${authToken}` } });
        toast.success("Protocol Deployed");
      }
      setView("list");
      fetchBlogs();
    } catch (err) { toast.error("Transmission failed"); }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Purge data node?")) return;
    try { await api.delete(`/admin/blog/delete/${id}` , { headers: { Authorization: `Bearer ${authToken}` } }); fetchBlogs(); } catch(e) {}
  };

  // --- Block Logic ---
  const addBlock = (type: ContentBlock["type"]) => {
    setFormData(prev => ({ ...prev, content: [...prev.content, { id: crypto.randomUUID(), type, text: "", src: "" }] }));
  };

  const updateBlock = (id: string, field: string, value: any) => {
    setFormData(prev => ({ ...prev, content: prev.content.map(b => b.id === id ? { ...b, [field]: value } : b) }));
  };

  const handleImageUploadForBlock = async (id: string, file: File) => {
    try {
      toast.loading("Uploading asset...");
      const url = await uploadToCloudinary(file);
      updateBlock(id, "src", url);
      toast.dismiss();
      toast.success("Asset secure");
    } catch (e) { toast.error("Upload failed"); }
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
          <Button onClick={() => { setFormData({...DEFAULT_POST, content: []}); setView("edit"); }} className="bg-white text-black hover:bg-red-600 hover:text-white rounded-xl font-black uppercase text-[10px] h-12 px-6 w-full md:w-auto">
            <Plus size={16} className="mr-2" /> Initialize New
          </Button>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          {loading ? <div className="p-20 text-center"><Bot className="animate-bounce mx-auto text-red-600"/></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-white/[0.02] border-b border-white/5">
                  <tr>
                    <th className="p-4 md:p-6 text-[10px] font-black uppercase text-neutral-500">Title</th>
                    <th className="p-4 md:p-6 text-[10px] font-black uppercase text-neutral-500">Date</th>
                    <th className="p-4 md:p-6 text-right text-[10px] font-black uppercase text-neutral-500">Ops</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {blogs.map(blog => (
                    <tr key={blog._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 md:p-6 font-bold text-white text-sm md:text-base">{blog.title}</td>
                      <td className="p-4 md:p-6 text-xs text-neutral-500 font-mono">{blog.meta.date}</td>
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

  // --- VIEW: EDITOR (Responsive) ---
  return (
    <div className="h-screen flex flex-col bg-[#000000] overflow-hidden">
      {/* Navbar */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-4 md:px-6 bg-[#0a0a0a]">
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="sm" onClick={() => setView("list")} className="text-neutral-500 hover:text-white px-2 md:px-4"><ArrowLeft size={16} className="md:mr-2" /> <span className="hidden md:inline">Back</span></Button>
          <div className="h-6 w-[1px] bg-white/10" />
          <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white truncate max-w-[120px] md:max-w-none">Editing</span>
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
          <Button variant="outline" onClick={() => setIsAiOpen(!isAiOpen)} className="hidden md:flex border-red-600/30 text-red-500 hover:bg-red-600/10 font-bold uppercase text-[10px]">
            <Sparkles size={14} className="mr-2" /> AI
          </Button>
          <Button onClick={handleSave} className="bg-white text-black hover:bg-red-600 hover:text-white font-bold uppercase text-[10px] h-8 md:h-10 px-3 md:px-4">
            <Save size={14} className="md:mr-2" /> <span className="hidden md:inline">Deploy</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT: EDITOR (Visible if Desktop OR MobileTab is Editor) */}
        <div className={cn(
          "w-full lg:w-1/2 overflow-y-auto custom-scrollbar border-r border-white/10 p-4 md:p-8 space-y-8 bg-[#050505]",
          mobileTab === "preview" ? "hidden lg:block" : "block"
        )}>
          
          {/* AI TOOLKIT */}
          <AnimatePresence>
            {isAiOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="bg-gradient-to-b from-red-900/10 to-transparent border border-red-600/20 rounded-2xl p-4 md:p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase text-red-500 flex items-center gap-2"><Bot size={14} /> Neural Generator</h3>
                    <Button size="sm" onClick={handleCopyPrompt} className="bg-red-600 hover:bg-red-700 text-white text-[10px] h-7"><Copy size={12} className="mr-1"/> Copy Prompt</Button>
                  </div>
                  <Textarea value={aiRawText} onChange={e => setAiRawText(e.target.value)} placeholder="Paste AI JSON response here..." className="bg-black/50 border-red-600/20 text-xs font-mono min-h-[100px]" />
                  <Button onClick={handleAiInject} className="w-full bg-white text-black hover:bg-red-600 hover:text-white font-bold uppercase text-[10px]">
                    Auto-Inject Data
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* META FORM */}
          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-red-600 mb-4 flex items-center gap-2"><CheckCircle2 size={12} /> Meta Protocol</h3>
            <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Article Title" className="bg-white/5 border-white/10 h-12 md:h-14 text-lg font-bold" />
            <Textarea value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} placeholder="Subtitle / Hook" className="bg-white/5 border-white/10" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="Slug (url-friendly)" className="bg-white/5 border-white/10" />
              <Input value={formData.meta.readTime} onChange={e => setFormData({...formData, meta: {...formData.meta, readTime: e.target.value}})} placeholder="Read Time (e.g. 5 min)" className="bg-white/5 border-white/10" />
            </div>

            {/* Keyword/Tag Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Keywords (comma separated)</label>
              <Input 
                value={formData.tags.join(", ")} 
                onChange={e => setFormData({...formData, tags: e.target.value.split(",").map(t => t.trim())})} 
                placeholder="Tech, AI, Guide" 
                className="bg-white/5 border-white/10" 
              />
            </div>
            
            {/* Cover Image Upload */}
            <div className="relative group">
              <Input value={formData.coverImage} onChange={e => setFormData({...formData, coverImage: e.target.value})} placeholder="Cover Image URL (or upload)" className="bg-white/5 border-white/10 pr-12" />
              <div className="absolute right-2 top-2">
                <label className="cursor-pointer p-2 bg-white/10 hover:bg-white/20 rounded-md block">
                  <UploadCloud size={14} />
                  <input type="file" className="hidden" onChange={async (e) => {
                    if(e.target.files?.[0]) {
                      const url = await uploadToCloudinary(e.target.files[0]);
                      setFormData(prev => ({ ...prev, coverImage: url }));
                    }
                  }} />
                </label>
              </div>
            </div>
          </section>

          <div className="h-[1px] bg-white/10" />

          {/* BLOCKS EDITOR */}
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between sticky top-0 bg-[#050505] z-10 py-4 border-b border-white/5 gap-4 md:gap-0">
              <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500">Blocks</h3>
              {/* Scrollable Toolbar for Mobile */}
              <div className="flex gap-1 bg-white/5 p-1 rounded-lg overflow-x-auto w-full md:w-auto scrollbar-hide">
                <IconButton icon={Type} onClick={() => addBlock("paragraph")} />
                <IconButton icon={MoreVertical} onClick={() => addBlock("heading")} />
                <IconButton icon={ImageIcon} onClick={() => addBlock("image")} />
                <IconButton icon={Code} onClick={() => addBlock("code")} />
                <IconButton icon={Video} onClick={() => addBlock("youtube")} />
                <IconButton icon={List} onClick={() => addBlock("list")} />
              </div>
            </div>

            <Reorder.Group axis="y" values={formData.content} onReorder={(newContent) => setFormData({...formData, content: newContent})} className="space-y-4">
              {formData.content.map((block) => (
                <Reorder.Item key={block.id} value={block}>
                  <div className="group relative bg-[#0f0f0f] border border-white/5 rounded-xl p-4 hover:border-white/20 transition-all">
                    {/* Block Controls */}
                    <div className="absolute right-2 top-2 flex gap-1 z-10">
                      <div className="cursor-grab p-1 hover:text-white text-neutral-500"><GripVertical size={14} /></div>
                      <button onClick={() => setFormData(p => ({...p, content: p.content.filter(b => b.id !== block.id)}))} className="p-1 hover:text-red-500 text-neutral-500"><X size={14} /></button>
                    </div>

                    <div className="pr-8">
                      <span className="text-[9px] font-black uppercase text-neutral-600 mb-2 block tracking-widest">{block.type}</span>
                      
                      {block.type === "paragraph" && <Textarea value={block.text} onChange={(e) => updateBlock(block.id, "text", e.target.value)} className="bg-transparent border-none p-0 text-sm min-h-[60px] focus-visible:ring-0" placeholder="Content..." />}
                      
                      {block.type === "heading" && (
                        <div className="flex gap-2">
                          <select value={block.level || 2} onChange={(e) => updateBlock(block.id, "level", parseInt(e.target.value))} className="bg-black border border-white/10 rounded px-2 text-xs h-10"><option value={2}>H2</option><option value={3}>H3</option></select>
                          <Input value={block.text} onChange={(e) => updateBlock(block.id, "text", e.target.value)} className="bg-transparent border-white/10 h-10 font-bold" placeholder="Heading" />
                        </div>
                      )}

                      {block.type === "image" && (
                        <div className="flex gap-2">
                          <Input value={block.src} onChange={(e) => updateBlock(block.id, "src", e.target.value)} className="bg-black/50 border-white/10 text-xs" placeholder="Image URL" />
                          <label className="cursor-pointer bg-white/10 hover:bg-white/20 rounded-md px-3 flex items-center justify-center">
                            <UploadCloud size={14} />
                            <input type="file" className="hidden" onChange={(e) => { if(e.target.files?.[0]) handleImageUploadForBlock(block.id, e.target.files[0]) }} />
                          </label>
                        </div>
                      )}

                      {block.type === "code" && (
                        <div className="space-y-2">
                          <Input value={block.language} onChange={(e) => updateBlock(block.id, "language", e.target.value)} className="bg-black/50 border-white/10 text-xs w-24" placeholder="Lang" />
                          <Textarea value={block.code} onChange={(e) => updateBlock(block.id, "code", e.target.value)} className="bg-[#151515] border-white/5 font-mono text-xs min-h-[100px]" placeholder="Code..." />
                        </div>
                      )}

                      {block.type === "youtube" && (
                        <Input 
                          value={block.text} 
                          onChange={(e) => updateBlock(block.id, "text", e.target.value)} 
                          className="bg-black/50 border-white/10 text-xs" 
                          placeholder="YouTube Link (e.g. https://youtu.be/... or ID)" 
                        />
                      )}
                      
                      {block.type === "quote" && (
                        <div className="space-y-2">
                          <Textarea value={block.text} onChange={(e) => updateBlock(block.id, "text", e.target.value)} className="bg-transparent border-l-2 border-red-600 pl-4 italic" placeholder="Quote..." />
                          <Input value={block.author} onChange={(e) => updateBlock(block.id, "author", e.target.value)} className="bg-transparent border-none text-xs" placeholder="- Author" />
                        </div>
                      )}

                      {block.type === "list" && (
                        <Textarea 
                          value={block.items?.join("\n")} 
                          onChange={(e) => updateBlock(block.id, "items", e.target.value.split("\n"))} 
                          className="bg-transparent border-white/10 text-sm" 
                          placeholder="Item 1 (New line for next item)..." 
                        />
                      )}
                    </div>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
            
            <Button onClick={() => addBlock("paragraph")} variant="ghost" className="w-full border-dashed border border-white/10 text-neutral-500 hover:text-white h-12">
              <Plus size={16} /> Add Block
            </Button>
          </section>
        </div>

        {/* RIGHT: PREVIEW (Visible if Desktop OR MobileTab is Preview) */}
        <div className={cn(
          "w-full lg:w-1/2 bg-[#000000] p-4 md:p-8 border-l border-white/5 relative",
          mobileTab === "editor" ? "hidden lg:block" : "block"
        )}>
          <div className="absolute top-4 right-4 z-10 bg-black/80 px-3 py-1 rounded-full text-[10px] font-black uppercase text-neutral-500 border border-white/10 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/> Live View
          </div>
          <PreviewRenderer data={formData} />
        </div>

      </div>
    </div>
  );
}

const IconButton = ({ icon: Icon, onClick }: any) => (
  <button onClick={onClick} className="p-2 min-w-[36px] hover:bg-white/10 rounded-md text-neutral-400 hover:text-white transition-colors flex justify-center"><Icon size={16} /></button>
);