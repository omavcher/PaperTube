"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Download,
  Copy,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Eye,
  Edit3,
  Undo2,
  Redo2,
  Table2,
  Link2,
  Unlink,
  Eraser,
  Minus
} from "lucide-react";
import { toast } from "sonner";
import api from "@/config/api";
import Link from "next/link";
import Footer from "@/components/Footer";

// Tiptap WYSIWYG editor extensions
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { TextAlign } from "@tiptap/extension-text-align";
import { Link as LinkExtension } from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";

import { marked } from "marked";
// @ts-ignore
import TurndownService from "turndown";

interface EssayWorkspaceClientProps {
  slug: string;
}

interface EssayData {
  title: string;
  topic: string;
  academicLevel: string;
  essayType: string;
  citationStyle: string;
  wordCount: number;
  content: string;
}

export default function EssayWorkspaceClient({ slug }: EssayWorkspaceClientProps) {
  const [essay, setEssay] = useState<EssayData | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasLoadedRef = useRef(false);
  const hasInitializedContentRef = useRef(false);

  // Initialize Tiptap Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline cursor-pointer",
        },
      }),
    ],
    content: "",
    immediatelyRender: false,
    onUpdate: ({ editor: activeEditor }) => {
      const html = activeEditor.getHTML();
      // Convert HTML back to clean Markdown for database storage
      const turndownService = new TurndownService({
        headingStyle: "atx",
        hr: "---",
        bulletListMarker: "-"
      });
      // Keep table markup so it does not get destroyed when syncing to the database
      turndownService.keep(["table", "tbody", "thead", "tr", "th", "td"]);
      const markdown = turndownService.turndown(html);
      setContent(markdown);
    },
  });

  // Fetch Essay data on mount
  useEffect(() => {
    const fetchEssay = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          toast.error("You must be signed in to access the workspace.");
          window.location.href = "/ai-writer";
          return;
        }

        const res = await api.get(`/writer/essay/${slug}`, {
          headers: { Auth: authToken }
        });

        if (res.data.success && res.data.essay) {
          setEssay(res.data.essay);
          
          let parsedTitle = res.data.essay.title || "";
          let parsedContent = res.data.essay.content || "";
          
          const trimmedContent = parsedContent.trim();
          if (trimmedContent.startsWith("{") && trimmedContent.endsWith("}")) {
            try {
              const parsed = JSON.parse(trimmedContent);
              if (parsed.title || parsed.abstract || parsed.introduction || parsed.body_sections) {
                if (parsed.title) {
                  parsedTitle = parsed.title;
                }
                
                let md = "";
                if (parsed.abstract) {
                  md += `## Abstract\n\n${parsed.abstract}\n\n`;
                }
                if (parsed.introduction) {
                  md += `## Introduction\n\n${parsed.introduction}\n\n`;
                }
                if (Array.isArray(parsed.body_sections)) {
                  parsed.body_sections.forEach((sec: any) => {
                    if (sec.heading && sec.content) {
                      md += `## ${sec.heading}\n\n${sec.content}\n\n`;
                    }
                  });
                } else if (parsed.body_sections && typeof parsed.body_sections === "string") {
                  md += `## Body\n\n${parsed.body_sections}\n\n`;
                }
                if (parsed.conclusion) {
                  md += `## Conclusion\n\n${parsed.conclusion}\n\n`;
                }
                if (Array.isArray(parsed.references)) {
                  md += `## References\n\n`;
                  parsed.references.forEach((ref: string) => {
                    md += `- ${ref}\n`;
                  });
                } else if (parsed.references && typeof parsed.references === "string") {
                  md += `## References\n\n${parsed.references}\n`;
                }
                
                parsedContent = md.trim();
              }
            } catch (e) {
              // Not a valid JSON, fallback to standard markdown handling
            }
          }
          
          setTitle(parsedTitle);
          setContent(parsedContent);
        } else {
          toast.error("Essay not found.");
          window.location.href = "/ai-writer/essay-writer";
        }
      } catch (err: any) {
        console.error(err);
        toast.error(err.response?.data?.message || "Failed to load essay workspace.");
        window.location.href = "/ai-writer/essay-writer";
      } finally {
        setIsLoading(false);
        hasLoadedRef.current = true;
      }
    };

    fetchEssay();
  }, [slug]);

  // Load content into Tiptap editor once loaded
  useEffect(() => {
    if (editor && !isLoading && !hasInitializedContentRef.current && content) {
      try {
        const initialHtml = marked.parse(content);
        editor.commands.setContent(initialHtml);
        hasInitializedContentRef.current = true;
      } catch (err) {
        console.error("Marked parsing error:", err);
      }
    }
  }, [editor, isLoading, content]);

  // Sync editor read-only editable state with preview mode toggle
  useEffect(() => {
    if (editor) {
      editor.setEditable(!isPreviewMode);
    }
  }, [editor, isPreviewMode]);

  // Debounced Auto-save
  useEffect(() => {
    if (!hasLoadedRef.current || isLoading) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    setSaveStatus("saving");

    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) return;

        await api.put(
          `/writer/essay/${slug}`,
          { title, content },
          { headers: { Auth: authToken } }
        );

        setSaveStatus("saved");
      } catch (err) {
        console.error("Auto save failed:", err);
        setSaveStatus("error");
      }
    }, 1500);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [title, content, slug, isLoading]);

  // Dynamic Metrics
  const getWordCount = () => content.trim().split(/\s+/).filter(Boolean).length;
  const getCharCount = () => content.length;
  const getPageCount = () => Math.max(1, Math.ceil(getWordCount() / 350));

  // Link editor handler
  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  // 3x3 Table insert handler
  const addTable = () => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success("Essay content copied to clipboard!");
  };

  // Compile and Download clean PDF
  const handleExportPdf = async () => {
    if (!editor) return;
    setIsDownloadingPdf(true);
    const downloadToast = toast.loading("Generating academic PDF document...");

    try {
      const authToken = localStorage.getItem("authToken");
      const htmlContent = editor.getHTML();
      
      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&family=Syne:wght@400;600;700;800&display=swap" rel="stylesheet" />
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --ink: #0d0d0d;
    --paper: #faf9f6;
    --rule: #d4d0c4;
  }
  body {
    font-family: 'IBM Plex Serif', Georgia, serif;
    background: var(--paper);
    color: var(--ink);
    font-size: 15px;
    line-height: 1.8;
    padding: 50px 60px;
  }
  h1 {
    font-family: 'Syne', sans-serif;
    font-size: 32px;
    font-weight: 800;
    margin-bottom: 20px;
    line-height: 1.2;
    border-bottom: 2px solid var(--ink);
    padding-bottom: 10px;
    text-align: center;
  }
  h2 {
    font-family: 'Syne', sans-serif;
    font-size: 20px;
    font-weight: 700;
    margin-top: 30px;
    margin-bottom: 15px;
  }
  h3 {
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 600;
    margin-top: 20px;
    margin-bottom: 10px;
  }
  p {
    margin-bottom: 18px;
    text-align: justify;
  }
  blockquote {
    border-left: 3px solid var(--ink);
    padding-left: 15px;
    font-style: italic;
    color: #444;
    margin: 20px 0;
  }
  pre {
    background: #f4f3ef;
    padding: 15px;
    border-radius: 4px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    overflow-x: auto;
    margin: 20px 0;
  }
  ul, ol {
    margin-left: 25px;
    margin-bottom: 18px;
  }
  li {
    margin-bottom: 6px;
  }
  hr {
    border: none;
    border-top: 1px solid var(--rule);
    margin: 30px 0;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 20px 0;
  }
  th, td {
    border: 1px solid var(--rule);
    padding: 8px 12px;
    text-align: left;
  }
  th {
    background-color: #f2f0ea;
  }
  a {
    color: #2563eb;
    text-decoration: underline;
  }
  .meta {
    font-family: 'Syne', sans-serif;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #666;
    margin-bottom: 40px;
  }
  @page {
    size: A4;
    margin: 20mm;
  }
  @media print {
    body {
      background: var(--paper) !important;
      padding: 0;
    }
  }
</style>
</head>
<body>
  <div class="meta">Paperxify AI Essay &middot; Citation Style: ${essay?.citationStyle || 'APA'}</div>
  <h1>${title}</h1>
  <div class="content">
    ${htmlContent}
  </div>
</body>
</html>`;

      const res = await api.post(
        "/writer/plagiarism/pdf", 
        { 
          html: fullHtml, 
          title: title.replace(/\s+/g, "-") 
        }, 
        { headers: { Auth: authToken } }
      );

      if (res.data.success && res.data.pdf) {
        const binaryString = window.atob(res.data.pdf);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement("a");
        a.href = url;
        a.download = res.data.fileName || `${title.replace(/\s+/g, "-")}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success("Essay PDF downloaded successfully!", { id: downloadToast });
      } else {
        toast.error(res.data.message || "Failed to generate PDF.", { id: downloadToast });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Server error while compiling essay PDF.", { id: downloadToast });
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
        <p className="text-neutral-500 text-sm font-mono tracking-widest uppercase">Initializing Essay Workspace...</p>
      </div>
    );
  }

  // Detect active formatting states in editor
  const isBoldActive = editor?.isActive("bold");
  const isItalicActive = editor?.isActive("italic");
  const isUnderlineActive = editor?.isActive("underline");
  const isStrikeActive = editor?.isActive("strike");

  const isH1Active = editor?.isActive("heading", { level: 1 });
  const isH2Active = editor?.isActive("heading", { level: 2 });
  const isH3Active = editor?.isActive("heading", { level: 3 });
  const isParagraphActive = editor?.isActive("paragraph");

  const isLeftAlignActive = editor?.isActive({ textAlign: "left" });
  const isCenterAlignActive = editor?.isActive({ textAlign: "center" });
  const isRightAlignActive = editor?.isActive({ textAlign: "right" });
  const isJustifyAlignActive = editor?.isActive({ textAlign: "justify" });

  const isBulletListActive = editor?.isActive("bulletList");
  const isOrderedListActive = editor?.isActive("orderedList");
  const isTableActive = editor?.isActive("table");

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center font-sans selection:bg-amber-900/40">
      
      {/* CSS Rules specifically targeting Tiptap rendering classes */}
      <style dangerouslySetInnerHTML={{ __html: `
        .ProseMirror {
          outline: none;
          min-height: 100%;
          flex: 1 1 auto;
          font-family: 'Georgia', serif;
          font-size: 15px;
          line-height: 1.8;
          color: #1a1a1a;
          text-align: justify;
        }
        .ProseMirror p {
          margin-bottom: 1.5em;
        }
        .ProseMirror h1 {
          font-family: 'Syne', sans-serif;
          font-size: 26px;
          font-weight: 800;
          text-align: center;
          margin-top: 1.5em;
          margin-bottom: 1em;
          color: #0d0d0d;
          border-bottom: 2px solid #eae6df;
          padding-bottom: 6px;
        }
        .ProseMirror h2 {
          font-family: 'Syne', sans-serif;
          font-size: 19px;
          font-weight: 700;
          margin-top: 1.5em;
          margin-bottom: 0.8em;
          color: #2e2e2e;
        }
        .ProseMirror h3 {
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 600;
          margin-top: 1.2em;
          margin-bottom: 0.6em;
          color: #444;
        }
        .ProseMirror ul, .ProseMirror ol {
          margin-left: 2em;
          margin-bottom: 1.5em;
          list-style-position: outside;
        }
        .ProseMirror ul {
          list-style-type: disc;
        }
        .ProseMirror ol {
          list-style-type: decimal;
        }
        .ProseMirror li {
          margin-bottom: 0.5em;
        }
        .ProseMirror blockquote {
          border-left: 4px solid #d4d0c4;
          padding-left: 1.5em;
          margin: 1.5em 0;
          font-style: italic;
          color: #555;
        }
        .ProseMirror table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          margin: 2em 0;
          overflow: hidden;
        }
        .ProseMirror td, .ProseMirror th {
          min-width: 1em;
          border: 1px solid #d4d0c4;
          padding: 8px 12px;
          vertical-align: top;
          box-sizing: border-box;
          position: relative;
        }
        .ProseMirror th {
          font-weight: bold;
          text-align: left;
          background-color: #f2f0ea;
        }
        .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
          cursor: pointer;
        }
        .ProseMirror hr {
          border: none;
          border-top: 1px solid #d4d0c4;
          margin: 2em 0;
        }
      ` }} />

      {/* Dynamic Header & Formatting Toolbar */}
      <header className="sticky top-0 w-full bg-[#0c0c0c]/90 border-b border-white/[0.08] backdrop-blur-md z-50 py-3 px-4 sm:px-6 flex flex-col items-center justify-between gap-4 shadow-lg">
        
        {/* Left Side: Back & Editable Title */}
        <div className="flex items-center justify-between w-full lg:flex-row gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/ai-writer/essay-writer"
              className="shrink-0 p-2 rounded-xl bg-white/5 border border-white/[0.08] text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
              title="Back to Suite"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="min-w-0">
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                disabled={isPreviewMode}
                className="bg-transparent border-none text-[15px] sm:text-[16px] font-black text-white focus:outline-none focus:ring-0 truncate w-full p-0"
                placeholder="Untitled Essay"
              />
              <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono mt-0.5">
                <span>{essay?.essayType} &middot; {essay?.citationStyle} Style</span>
                <span>&middot;</span>
                <span>{essay?.academicLevel}</span>
              </div>
            </div>
          </div>

          {/* Right Side: Save Status & Actions */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Cloud Auto-save badge */}
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-medium tracking-wide">
              {saveStatus === "saved" && (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Cloud Synced
                </span>
              )}
              {saveStatus === "saving" && (
                <span className="text-amber-400 flex items-center gap-1">
                  <Loader2 size={12} className="animate-spin" /> Saving...
                </span>
              )}
              {saveStatus === "error" && (
                <span className="text-red-400 flex items-center gap-1">
                  <AlertTriangle size={12} /> Unsaved Changes
                </span>
              )}
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Copy size={12} /> Copy
            </button>
            <button
              onClick={handleExportPdf}
              disabled={isDownloadingPdf}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-amber-50 transition-colors shadow-[0_0_12px_rgba(255,255,255,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloadingPdf ? (
                <RefreshCw size={12} className="animate-spin" />
              ) : (
                <Download size={12} />
              )}
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Center: Formatting Menu Panel & Preview Toggle */}
        <div className="w-full flex flex-col md:flex-row items-center gap-3 justify-between border-t border-white/[0.06] pt-3">
          {/* Format bar toolbar */}
          <div className="flex items-center gap-1 flex-wrap">
            {/* Undo / Redo */}
            <button
              onClick={() => editor?.chain().focus().undo().run()}
              disabled={isPreviewMode || !editor?.can().undo()}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Undo"
            >
              <Undo2 size={13} />
            </button>
            <button
              onClick={() => editor?.chain().focus().redo().run()}
              disabled={isPreviewMode || !editor?.can().redo()}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Redo"
            >
              <Redo2 size={13} />
            </button>

            <div className="w-px h-4 bg-white/10 mx-1" />

            {/* Paragraph / Headings */}
            <button
              onClick={() => editor?.chain().focus().setParagraph().run()}
              disabled={isPreviewMode}
              className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase transition-colors ${
                isParagraphActive ? "bg-white text-black" : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
              title="Normal Text"
            >
              Body
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
              disabled={isPreviewMode}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                isH1Active ? "bg-white text-black" : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
              title="Heading 1"
            >
              <Heading1 size={13} />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              disabled={isPreviewMode}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                isH2Active ? "bg-white text-black" : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
              title="Heading 2"
            >
              <Heading2 size={13} />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
              disabled={isPreviewMode}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                isH3Active ? "bg-white text-black" : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
              title="Heading 3"
            >
              <Heading3 size={13} />
            </button>

            <div className="w-px h-4 bg-white/10 mx-1" />

            {/* Basic Text styles */}
            <button
              onClick={() => editor?.chain().focus().toggleBold().run()}
              disabled={isPreviewMode}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                isBoldActive ? "bg-white text-black" : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
              title="Bold"
            >
              <Bold size={13} />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              disabled={isPreviewMode}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                isItalicActive ? "bg-white text-black" : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
              title="Italic"
            >
              <Italic size={13} />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              disabled={isPreviewMode}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                isUnderlineActive ? "bg-white text-black" : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
              title="Underline"
            >
              <UnderlineIcon size={13} />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleStrike().run()}
              disabled={isPreviewMode}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                isStrikeActive ? "bg-white text-black" : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
              title="Strikethrough"
            >
              <span className="line-through text-xs font-bold font-mono">S</span>
            </button>

            <div className="w-px h-4 bg-white/10 mx-1" />

            {/* Alignments */}
            <button
              onClick={() => editor?.chain().focus().setTextAlign("left").run()}
              disabled={isPreviewMode}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                isLeftAlignActive ? "bg-white text-black" : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
              title="Align Left"
            >
              <AlignLeft size={13} />
            </button>
            <button
              onClick={() => editor?.chain().focus().setTextAlign("center").run()}
              disabled={isPreviewMode}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                isCenterAlignActive ? "bg-white text-black" : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
              title="Align Center"
            >
              <AlignCenter size={13} />
            </button>
            <button
              onClick={() => editor?.chain().focus().setTextAlign("right").run()}
              disabled={isPreviewMode}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                isRightAlignActive ? "bg-white text-black" : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
              title="Align Right"
            >
              <AlignRight size={13} />
            </button>
            <button
              onClick={() => editor?.chain().focus().setTextAlign("justify").run()}
              disabled={isPreviewMode}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                isJustifyAlignActive ? "bg-white text-black" : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
              title="Align Justify"
            >
              <AlignJustify size={13} />
            </button>

            <div className="w-px h-4 bg-white/10 mx-1" />

            {/* Lists */}
            <button
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              disabled={isPreviewMode}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                isBulletListActive ? "bg-white text-black" : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
              title="Bullet List"
            >
              <List size={13} />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              disabled={isPreviewMode}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                isOrderedListActive ? "bg-white text-black" : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
              title="Ordered List"
            >
              <ListOrdered size={13} />
            </button>

            <div className="w-px h-4 bg-white/10 mx-1" />

            {/* Links & Rules */}
            <button
              onClick={setLink}
              disabled={isPreviewMode}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Insert Link"
            >
              <Link2 size={13} />
            </button>
            <button
              onClick={() => editor?.chain().focus().unsetLink().run()}
              disabled={isPreviewMode || !editor?.isActive("link")}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Remove Link"
            >
              <Unlink size={13} />
            </button>
            <button
              onClick={() => editor?.chain().focus().setHorizontalRule().run()}
              disabled={isPreviewMode}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Horizontal Rule"
            >
              <Minus size={13} />
            </button>
            <button
              onClick={() => editor?.chain().focus().clearNodes().unsetAllMarks().run()}
              disabled={isPreviewMode}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Clear Formatting"
            >
              <Eraser size={13} />
            </button>

            <div className="w-px h-4 bg-white/10 mx-1" />

            {/* Table */}
            <button
              onClick={addTable}
              disabled={isPreviewMode}
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-colors ${
                isTableActive ? "bg-white text-black" : ""
              }`}
              title="Insert Table (3x3)"
            >
              <Table2 size={13} />
            </button>
          </div>

          {/* Mode toggle */}
          <div className="flex items-center bg-black border border-white/[0.08] p-0.5 rounded-xl self-end">
            <button
              onClick={() => setIsPreviewMode(false)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors ${
                !isPreviewMode ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-white"
              }`}
            >
              <Edit3 size={10} /> Editor
            </button>
            <button
              onClick={() => setIsPreviewMode(true)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors ${
                isPreviewMode ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-white"
              }`}
            >
              <Eye size={10} /> Preview
            </button>
          </div>
        </div>

        {/* Conditionally rendered Table management row */}
        {isTableActive && !isPreviewMode && (
          <div className="w-full flex items-center gap-1.5 flex-wrap bg-amber-900/10 border border-amber-900/30 p-1.5 rounded-xl animate-scale-in">
            <span className="text-[9px] font-black uppercase text-amber-500 tracking-wider px-1">Table Manager:</span>
            <button
              onClick={() => editor?.chain().focus().addRowBefore().run()}
              className="px-2.5 py-1 bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-bold rounded-lg transition-colors"
            >
              + Row Above
            </button>
            <button
              onClick={() => editor?.chain().focus().addRowAfter().run()}
              className="px-2.5 py-1 bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-bold rounded-lg transition-colors"
            >
              + Row Below
            </button>
            <button
              onClick={() => editor?.chain().focus().addColumnBefore().run()}
              className="px-2.5 py-1 bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-bold rounded-lg transition-colors"
            >
              + Col Left
            </button>
            <button
              onClick={() => editor?.chain().focus().addColumnAfter().run()}
              className="px-2.5 py-1 bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-bold rounded-lg transition-colors"
            >
              + Col Right
            </button>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <button
              onClick={() => editor?.chain().focus().deleteRow().run()}
              className="px-2.5 py-1 bg-red-950/20 border border-red-900/30 hover:bg-red-950/40 text-[10px] font-bold text-red-400 rounded-lg transition-colors"
            >
              Delete Row
            </button>
            <button
              onClick={() => editor?.chain().focus().deleteColumn().run()}
              className="px-2.5 py-1 bg-red-950/20 border border-red-900/30 hover:bg-red-950/40 text-[10px] font-bold text-red-400 rounded-lg transition-colors"
            >
              Delete Col
            </button>
            <button
              onClick={() => editor?.chain().focus().deleteTable().run()}
              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-[10px] font-black text-white rounded-lg transition-colors shadow-md"
            >
              Delete Table
            </button>
          </div>
        )}

      </header>

      {/* Main Workspace: centered MS Word paper page */}
      <main className="w-full flex-1 flex justify-center py-10 px-4 bg-[#050505] overflow-y-auto">
        <div className="w-full max-w-[816px] flex flex-col space-y-4">
          
          {/* MS Word Sheet container */}
          <div className="w-full bg-white text-black border border-neutral-200/50 shadow-2xl p-8 sm:p-14 md:p-[1in] font-serif leading-relaxed text-justify relative select-text transition-all duration-300 rounded-lg min-h-[1056px] flex flex-col">
            
            {/* APA header / running head format simulator */}
            <div className="w-full border-b border-neutral-200 pb-3 mb-6 flex justify-between items-center text-[10px] font-sans text-neutral-500 uppercase tracking-widest">
              <span>{title || "Untitled Paper"}</span>
              <span>Page {getPageCount()}</span>
            </div>

            {/* Document Content box (Tiptap Content Area) */}
            <div className="flex-1 flex flex-col">
              <EditorContent editor={editor} className="flex-1 focus:outline-none" />
            </div>

          </div>

          {/* Footer stats metadata */}
          <div className="w-full flex items-center justify-between text-[11px] text-neutral-500 font-mono py-2 px-3 border border-white/[0.06] bg-[#0c0c0c] rounded-xl">
            <div className="flex items-center gap-4">
              <span>Words: <strong className="text-neutral-300">{getWordCount()}</strong></span>
              <span>Chars: <strong className="text-neutral-300">{getCharCount()}</strong></span>
              <span>Pages: <strong className="text-neutral-300">{getPageCount()}</strong></span>
            </div>
            <span>Auto-save active</span>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
