"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Edit, Eye, Copy, Trash2, Download, 
  FileText, Columns, Maximize2, ArrowLeft, 
  Terminal, Check, Bold, Italic, List, 
  Link as LinkIcon, Code, Heading1, Sparkles,
  Image, Table, Quote, EyeOff, Zap,
  Type, Hash, Minus, ListOrdered, FileCode,
  Save, Upload, Play, Terminal as TerminalIcon,
  Mail, Github, Twitter, Youtube, Link2,
  Maximize, Minimize, Undo, Redo,
  FolderOpen, FolderClosed, File,
  ChevronRight, ChevronDown, Plus, Home, Grid, Settings
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeRaw from 'rehype-raw';
import { useToolAnalytics } from "@/hooks/useToolAnalytics";
import CorePromo from "@/components/CorePromo";

interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  category: 'readme' | 'documentation' | 'blog' | 'notes' | 'github';
}

export default function MarkdownEditorClient() {
  const [content, setContent] = useState<string>(`# 🚀 Project Title

A brief description of your amazing project. This editor supports **real-time preview** with syntax highlighting!

## ✨ Features
- **Real-time** preview with live updates
- 📱 **Responsive** design for all devices
- 💾 **Auto-save** functionality
- 🌈 **Syntax highlighting** for code blocks
- 📊 **Live statistics** (word count, reading time)
- 📋 **Multiple templates** for quick starts

## 🛠 Installation

\`\`\`bash
npm install my-awesome-project
# or
yarn add my-awesome-project
\`\`\`

## 📖 Usage

\`\`\`javascript
import { amazingFunction } from 'my-awesome-project';

const result = amazingFunction({
  feature: 'markdown-editing',
  quality: 'excellent'
});

console.log(result);
// Output: "Everything works perfectly!"
\`\`\`

## 🧪 Example Code

\`\`\`python
def calculate_fibonacci(n):
    """Calculate Fibonacci sequence."""
    if n <= 1:
        return n
    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

print(calculate_fibonacci(10))  # Output: 55
\`\`\`

## 📊 Table Example

| Feature | Status | Version |
|---------|--------|---------|
| Preview | ✅ Live | 1.0 |
| Export | ✅ Ready | 1.2 |
| Templates | 🚧 Coming | 0.9 |

## 💡 Tips

> "Good documentation is as important as good code."
> – Anonymous Developer

## 🔗 Links

- [GitHub Repository](https://github.com/yourusername/project)
- [Documentation](https://docs.example.com)
- [Live Demo](https://demo.example.com)

## 📄 License

MIT © 2024 Your Name
`);
  
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [autoSave, setAutoSave] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [lineCount, setLineCount] = useState(0);
  const [readTime, setReadTime] = useState(0);
  const [history, setHistory] = useState<string[]>([content]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useToolAnalytics("markdown-editor", "MD EDITOR", "Engineering Tools");

  // Templates
  const templates: Template[] = [
    {
      id: 'readme-basic',
      name: 'Basic README',
      description: 'Simple project README template',
      category: 'readme',
      content: `# Project Name

## Description
Brief description of your project.

## Features
- Feature 1
- Feature 2
- Feature 3

## Installation
\`\`\`bash
npm install project-name
\`\`\`

## Usage
\`\`\`javascript
import { something } from 'project-name';
\`\`\`

## License
MIT`
    },
    {
      id: 'tech-docs',
      name: 'Technical Documentation',
      description: 'Comprehensive technical docs',
      category: 'documentation',
      content: `# API Documentation

## Overview
Complete API reference for the service.

## Authentication
All API requests require an API key.

\`\`\`http
Authorization: Bearer your-api-key
\`\`\`

## Endpoints

### GET /api/v1/users
Returns a list of users.

**Response:**
\`\`\`json
{
  "users": [
    {
      "id": "123",
      "name": "John Doe",
      "email": "john@example.com"
    }
  ],
  "total": 1
}
\`\`\`

## Error Codes
| Code | Meaning |
|------|---------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Internal Server Error |`
    },
    {
      id: 'blog-post',
      name: 'Blog Post',
      description: 'Markdown blog post template',
      category: 'blog',
      content: `# Blog Post Title

*Published on: ${new Date().toLocaleDateString()}*

## Introduction
Start with an engaging introduction that hooks the reader.

## Main Content

This is where you write your main content. Use **bold text** for emphasis and *italics* for subtle emphasis.

### Subheading
More detailed content here.

\`\`\`javascript
// Code example if needed
const example = "This is a code block";
console.log(example);
\`\`\`

## Conclusion
Wrap up your post with a strong conclusion.

## References
- [Link 1](https://example.com)
- [Link 2](https://example.com)

---
*Tags: technology, programming, webdev*`
    },
    {
      id: 'meeting-notes',
      name: 'Meeting Notes',
      description: 'Structured meeting notes',
      category: 'notes',
      content: `# Meeting Notes

## 📅 Date: ${new Date().toLocaleDateString()}
## ⏰ Time: 2:00 PM - 3:00 PM
## 👥 Attendees: Alice, Bob, Charlie

## 📝 Agenda
1. Project updates
2. Technical decisions
3. Action items

## 🗣 Discussion Points

### Project Updates
- Alice: Frontend is 80% complete
- Bob: Backend API ready for integration
- Charlie: Testing suite in progress

### Technical Decisions
✅ Use TypeScript for new components  
✅ Implement React Query for data fetching  
🚧 Discuss database migration strategy  

## ✅ Action Items
- [ ] Alice: Fix mobile responsive issues
- [ ] Bob: Add authentication endpoints
- [ ] Charlie: Write integration tests

## 🎯 Next Meeting
**Date:** Next Monday  
**Time:** 10:00 AM  
**Topics:** Sprint planning`
    },
    {
      id: 'github-profile',
      name: 'GitHub Profile',
      description: 'README for GitHub profile',
      category: 'github',
      content: `# 👋 Hi, I'm [Your Name]

💻 **Full Stack Developer** | 🚀 **Open Source Enthusiast** | 🌱 **Always Learning**

## 🛠️ Tech Stack
**Languages:** JavaScript, TypeScript, Python, Java  
**Frontend:** React, Next.js, Vue, Tailwind CSS  
**Backend:** Node.js, Express, Django, Spring Boot  
**Database:** PostgreSQL, MongoDB, Redis  
**DevOps:** Docker, AWS, GitHub Actions, Kubernetes  

## 📈 GitHub Stats
![GitHub Stats](https://github-readme-stats.vercel.app/api?username=yourusername&show_icons=true&theme=dark)

## 🔥 Current Projects
- **[Project 1](https://github.com/yourusername/project1)** - Amazing project description
- **[Project 2](https://github.com/yourusername/project2)** - Another cool project
- **[Project 3](https://github.com/yourusername/project3)** - Open source contribution

## 📫 Connect With Me
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/yourusername)
[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/yourusername)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:you@example.com)

⭐ **Star** my repositories if you find them interesting!`
    }
  ];

  // Calculate statistics
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(x => x);
    const chars = content.length;
    const lines = content.split('\n').length;
    const readTimeMinutes = Math.ceil(words.length / 200);
    
    setWordCount(words.length);
    setCharCount(chars);
    setLineCount(lines);
    setReadTime(readTimeMinutes);
  }, [content]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || historyIndex !== history.length - 1) return;
    
    const timer = setTimeout(() => {
      const newHistory = [...history];
      if (historyIndex < newHistory.length - 1) {
        newHistory.splice(historyIndex + 1);
      }
      newHistory.push(content);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      
      localStorage.setItem('markdown-editor-content', content);
      localStorage.setItem('markdown-editor-history', JSON.stringify(newHistory));
    }, 2000);

    return () => clearTimeout(timer);
  }, [content, autoSave, history, historyIndex]);

  // Load saved content
  useEffect(() => {
    const savedContent = localStorage.getItem('markdown-editor-content');
    const savedHistory = localStorage.getItem('markdown-editor-history');
    
    if (savedContent) {
      setContent(savedContent);
      if (savedHistory) {
        try {
          const parsedHistory = JSON.parse(savedHistory);
          setHistory(parsedHistory);
          setHistoryIndex(parsedHistory.length - 1);
        } catch (e) {
          console.error('Failed to parse history:', e);
        }
      }
    }
  }, []);

  // Sync scroll
  useEffect(() => {
    const editor = editorRef.current;
    const preview = previewRef.current;
    
    if (!editor || !preview || viewMode !== 'split') return;
    
    const handleScroll = () => {
      const editorScrollPercent = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
      preview.scrollTop = editorScrollPercent * (preview.scrollHeight - preview.clientHeight);
    };
    
    editor.addEventListener('scroll', handleScroll);
    return () => editor.removeEventListener('scroll', handleScroll);
  }, [viewMode]);

  const handleClear = () => {
    setContent("");
    toast.info("WORKSPACE CLEARED");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
      .then(() => toast.success("MARKDOWN COPIED"))
      .catch(() => toast.error("COPY FAILED"));
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `markdown-${new Date().getTime()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("FILE DOWNLOADED");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setContent(content);
      toast.success("FILE LOADED");
    };
    reader.onerror = () => {
      toast.error("READ ERROR");
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const insertText = (prefix: string, suffix: string = "", cursorOffset: number = 0) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    
    const newContent = before + prefix + selected + suffix + after;
    setContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selected.length + cursorOffset;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertTable = () => {
    const table = `| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |`;
    insertText(table + '\n\n');
  };

  const insertImage = () => {
    const image = '![Alt Text](https://via.placeholder.com/400x200)';
    insertText(image);
  };

  const applyTemplate = (templateContent: string) => {
    setContent(templateContent);
    setShowTemplates(false);
    toast.success("TEMPLATE APPLIED");
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  };

  const handleFullscreen = () => {
    const element = document.documentElement;
    if (!document.fullscreenElement) {
      element.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleViewMode = (mode: 'split' | 'editor' | 'preview') => {
    setViewMode(mode);
    toast.info(`MODE: ${mode.toUpperCase()}`);
  };

  const formatCode = () => {
    const lines = content.split('\n');
    const formatted = lines.map(line => {
      if (line.startsWith('```') && line.length > 3) {
        return '```' + line.substring(3).toLowerCase();
      }
      return line;
    }).join('\n');
    setContent(formatted);
    toast.success("CODE FORMATTED");
  };

  const calculateIndentation = () => {
    const textarea = editorRef.current;
    if (!textarea) return '  ';
    
    const start = textarea.selectionStart;
    const text = textarea.value;
    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    const line = text.substring(lineStart, start);
    const indentation = line.match(/^\s*/)?.[0] || '';
    return indentation + '  ';
  };

  const insertList = (ordered: boolean = false) => {
    const indentation = calculateIndentation();
    const prefix = ordered ? `${indentation}1. ` : `${indentation}- `;
    insertText(prefix);
  };

  const insertCheckbox = () => {
    const indentation = calculateIndentation();
    insertText(`${indentation}- [ ] `);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      insertText('  ');
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleDownload();
      toast.info("SAVED");
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
      e.preventDefault();
      formatCode();
    }
  };

  const formatHeading = (level: number) => {
    const textarea = editorRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = text.indexOf('\n', end);
    const line = text.substring(lineStart, lineEnd === -1 ? text.length : lineEnd);
    
    const hash = '#'.repeat(level);
    const newLine = line.trim().startsWith('#') ? line.replace(/^#+\s*/, hash + ' ') : hash + ' ' + line;
    
    const before = text.substring(0, lineStart);
    const after = text.substring(lineEnd === -1 ? text.length : lineEnd);
    
    setContent(before + newLine + after);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-emerald-500/30 font-sans flex flex-col overflow-x-hidden">
      
      
      {/* Desktop Header */}
      <header className="hidden md:flex border-b border-white/5 bg-black/40 backdrop-blur-md top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/tools">
              <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            </Link>
            <div className="flex items-center gap-3 border-l border-white/10 pl-4">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <Edit className="h-5 w-5" />
              </div>
              <h1 className="text-xl font-black italic tracking-tighter uppercase">MD <span className="text-emerald-400">Writer</span></h1>
              <Badge variant="outline" className="ml-2 border-emerald-500/20 text-emerald-400 bg-emerald-500/5 uppercase tracking-widest text-[9px]">Live</Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Auto-save</Label>
              <Switch checked={autoSave} onCheckedChange={setAutoSave} className="data-[state=checked]:bg-emerald-500" />
            </div>
            
            <div className="flex items-center gap-2 bg-neutral-900 rounded-full p-1 border border-white/5">
              <Button variant="ghost" size="sm" onClick={() => toggleViewMode('editor')} className={cn("rounded-full h-8 px-3 text-[10px] font-black uppercase tracking-widest", viewMode === 'editor' && "bg-emerald-500 text-black hover:bg-emerald-400")}>
                <FileCode className="h-3 w-3 mr-1" /> Write
              </Button>
              <Button variant="ghost" size="sm" onClick={() => toggleViewMode('split')} className={cn("rounded-full h-8 px-3 text-[10px] font-black uppercase tracking-widest", viewMode === 'split' && "bg-emerald-500 text-black hover:bg-emerald-400")}>
                <Columns className="h-3 w-3 mr-1" /> Split
              </Button>
              <Button variant="ghost" size="sm" onClick={() => toggleViewMode('preview')} className={cn("rounded-full h-8 px-3 text-[10px] font-black uppercase tracking-widest", viewMode === 'preview' && "bg-emerald-500 text-black hover:bg-emerald-400")}>
                <Eye className="h-3 w-3 mr-1" /> View
              </Button>
            </div>
            
            <Button variant="ghost" size="sm" onClick={handleFullscreen} className="text-neutral-400 hover:text-emerald-400">
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <div className="md:hidden flex flex-col gap-3 px-4 py-3 border-b border-white/5 bg-black sticky top-0 z-40 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit className="text-emerald-500 h-5 w-5" />
            <span className="font-black italic tracking-tighter text-white uppercase">MD EDITOR</span>
          </div>
          <Link href="/tools">
             <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
        </div>
        <div className="flex items-center w-full bg-neutral-900 rounded-xl p-1 border border-white/5">
            <Button variant="ghost" size="sm" onClick={() => toggleViewMode('editor')} className={cn("flex-1 h-8 text-[10px] font-black uppercase tracking-widest", viewMode === 'editor' ? "bg-emerald-500 text-black shadow-lg" : "text-neutral-500")}>
              Write
            </Button>
            <Button variant="ghost" size="sm" onClick={() => toggleViewMode('split')} className={cn("flex-1 h-8 text-[10px] font-black uppercase tracking-widest", viewMode === 'split' ? "bg-emerald-500 text-black shadow-lg" : "text-neutral-500")}>
              Split
            </Button>
            <Button variant="ghost" size="sm" onClick={() => toggleViewMode('preview')} className={cn("flex-1 h-8 text-[10px] font-black uppercase tracking-widest", viewMode === 'preview' ? "bg-emerald-500 text-black shadow-lg" : "text-neutral-500")}>
              View
            </Button>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-2 md:px-4 py-4 md:py-6 w-full relative z-10">
        {/* Toolbar */}
        <div className="flex flex-nowrap md:flex-wrap items-center gap-1 md:gap-2 mb-4 bg-neutral-900/50 p-2 md:p-3 rounded-xl md:rounded-2xl border border-white/5 overflow-x-auto backdrop-blur-md sticky top-[108px] md:static z-30 custom-scrollbar -mx-2 px-3 md:mx-0">
          <div className="flex items-center gap-0.5 md:gap-1 shrink-0">
            <Button variant="ghost" size="sm" onClick={handleUndo} disabled={historyIndex === 0} className="h-8 w-8 p-0 text-neutral-400 hover:text-emerald-400 disabled:opacity-50"><Undo className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="sm" onClick={handleRedo} disabled={historyIndex === history.length - 1} className="h-8 w-8 p-0 text-neutral-400 hover:text-emerald-400 disabled:opacity-50"><Redo className="h-3.5 w-3.5" /></Button>
          </div>
          <div className="w-px h-6 bg-white/10 mx-1" />
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map(level => (
              <Button key={level} variant="ghost" size="sm" onClick={() => formatHeading(level)} className="h-8 w-8 p-0 text-neutral-400 hover:text-emerald-400 relative">
                <Type className="h-3.5 w-3.5" /><span className="text-[9px] absolute -bottom-1">{level}</span>
              </Button>
            ))}
          </div>
          <div className="w-px h-6 bg-white/10 mx-0.5 md:mx-1 shrink-0" />
          <div className="flex flex-nowrap items-center shrink-0 gap-0.5 md:gap-1">
             <ToolbarButton onClick={() => insertText("**", "**")} icon={<Bold size={16} />} title="Bold" />
             <ToolbarButton onClick={() => insertText("*", "*")} icon={<Italic size={16} />} title="Italic" />
             <ToolbarButton onClick={() => insertText("`", "`")} icon={<Code size={16} />} title="Inline Code" />
             <ToolbarButton onClick={insertImage} icon={<Image size={16} />} title="Image" />
          </div>
          <div className="w-px h-6 bg-white/10 mx-0.5 md:mx-1 shrink-0" />
          <div className="flex flex-nowrap items-center shrink-0 gap-0.5 md:gap-1">
             <ToolbarButton onClick={() => insertList()} icon={<List size={16} />} title="Unordered List" />
             <ToolbarButton onClick={insertCheckbox} icon={<Check size={16} />} title="Checkbox" />
             <ToolbarButton onClick={insertTable} icon={<Table size={16} />} title="Table" />
          </div>
          <div className="w-px h-6 bg-white/10 mx-0.5 md:mx-1 shrink-0" />
          <div className="flex flex-nowrap items-center shrink-0">
             <ToolbarButton onClick={() => insertText("```\n", "\n```")} icon={<TerminalIcon size={16} />} title="Code Block" />
          </div>
          
          <div className="flex-grow hidden md:block" />
          
          <div className="flex items-center shrink-0 gap-1 md:gap-2 pl-2 border-l border-white/10 md:border-none md:pl-0">
             <Button variant="ghost" size="sm" onClick={() => setShowTemplates(!showTemplates)} className={cn("text-neutral-400 hover:text-emerald-400 gap-1.5 md:gap-2 h-8 md:h-9 px-2 md:px-3", showTemplates && "text-emerald-400 bg-emerald-500/10")}>
               {showTemplates ? <FolderOpen size={14} /> : <FolderClosed size={14} />}
               <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest">Templates</span>
             </Button>

             <input type="file" id="md-upload" className="hidden" accept=".md,.txt,.markdown" onChange={handleFileUpload} />
             <label htmlFor="md-upload" className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2 md:px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold cursor-pointer flex items-center gap-1.5 md:gap-2 transition-colors border border-white/5 h-8 md:h-9 uppercase tracking-wider shrink-0 mb-0">
               <Upload size={14} /> <span className="hidden sm:inline">Upload</span>
             </label>
             <Button variant="ghost" size="sm" onClick={handleDownload} className="text-neutral-400 hover:text-emerald-400 gap-1.5 md:gap-2 h-8 md:h-9 px-2 md:px-3 border border-transparent hover:border-emerald-500/20 hover:bg-emerald-500/5 shrink-0">
               <Download size={14} /> <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest">Export</span>
             </Button>
          </div>
        </div>

        {/* Templates Panel */}
        <AnimatePresence>
          {showTemplates && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
              <Card className="bg-neutral-900 border-emerald-500/20 rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-black text-emerald-400 flex items-center gap-2 uppercase tracking-widest">
                    <Sparkles className="h-4 w-4" /> Quick Start Templates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="bg-black/50 border border-white/5 rounded-xl h-10 mb-4 p-1">
                      {['all', 'readme', 'documentation', 'blog', 'notes'].map(t => <TabsTrigger key={t} value={t} className="text-[10px] font-bold uppercase tracking-wider h-8 rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-black">{t}</TabsTrigger>)}
                    </TabsList>
                    {['all', 'readme', 'documentation', 'blog', 'notes'].map((category) => (
                      <TabsContent key={category} value={category} className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {templates.filter(t => category === 'all' || t.category === category).map(template => (
                            <Card key={template.id} className="bg-neutral-800/50 border-white/5 hover:border-emerald-500/30 cursor-pointer transition-all hover:scale-[1.02] rounded-xl" onClick={() => applyTemplate(template.content)}>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h4 className="font-bold text-sm text-white">{template.name}</h4>
                                    <Badge variant="outline" className="mt-1 text-[10px] border-emerald-500/20 text-emerald-400 bg-emerald-500/5">{template.category}</Badge>
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-emerald-400" />
                                </div>
                                <p className="text-xs text-neutral-400 line-clamp-2">{template.description}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Editor & Preview Area */}
        <div className={cn("grid gap-4 md:gap-6 min-h-[60vh] md:min-h-[70vh]", viewMode === 'split' ? "md:grid-cols-2" : "grid-cols-1")}>
          {(viewMode === 'split' || viewMode === 'editor') && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="relative group h-full">
              <div className="absolute top-3 md:top-4 left-4 md:left-6 text-[9px] md:text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] flex items-center gap-2 pointer-events-none z-10">
                <Terminal size={12} /> editor.md
              </div>
              <textarea
                ref={editorRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full h-full min-h-[400px] md:min-h-[600px] p-4 md:p-8 pt-10 md:pt-12 rounded-2xl md:rounded-[2rem] bg-neutral-900 border border-white/5 md:border-2 font-mono text-sm text-neutral-300 focus:outline-none focus:border-emerald-500/30 transition-all resize-none shadow-2xl custom-scrollbar"
                spellCheck={true}
              />
            </motion.div>
          )}

          {(viewMode === 'split' || viewMode === 'preview') && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="relative group h-full">
              <div className="absolute top-3 md:top-4 left-4 md:left-6 text-[9px] md:text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] flex items-center gap-2 pointer-events-none z-10">
                <Eye size={12} /> preview.html
              </div>
              <div ref={previewRef} className="w-full h-full min-h-[400px] md:min-h-[600px] p-4 md:p-8 pt-10 md:pt-12 rounded-2xl md:rounded-[2rem] bg-neutral-900/40 border border-white/5 md:border-2 font-sans overflow-y-auto shadow-inner scroll-smooth custom-scrollbar">
                {content ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        code({ node, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !match ? (
                            <code className={cn("px-1.5 py-0.5 bg-black/30 rounded text-emerald-300 font-mono text-xs", className)} {...props}>{children}</code>
                          ) : (
                            <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" className="rounded-xl border border-white/10 !bg-[#0a0a0a] !m-0" {...props}>{String(children).replace(/\n$/, '')}</SyntaxHighlighter>
                          );
                        },
                        h1: ({node, ...props}) => <h1 className="text-3xl font-black text-white mt-8 mb-4 border-b border-white/10 pb-2 uppercase italic tracking-tighter" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-white mt-6 mb-3 flex items-center gap-2" {...props} />,
                        p: ({node, ...props}) => <p className="text-neutral-300 mb-4 leading-relaxed" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-emerald-500 pl-4 italic my-4 text-neutral-400 bg-emerald-500/5 p-4 rounded-r-xl" {...props} />,
                        a: ({node, ...props}) => <a className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 decoration-emerald-500/30" target="_blank" rel="noopener noreferrer" {...props} />,
                        table: ({node, ...props}) => <div className="overflow-x-auto my-6"><table className="min-w-full border border-white/10 rounded-lg overflow-hidden text-sm" {...props} /></div>,
                        th: ({node, ...props}) => <th className="px-4 py-3 text-left border-b border-white/10 text-emerald-400 font-black uppercase tracking-wider bg-emerald-500/5" {...props} />,
                        td: ({node, ...props}) => <td className="px-4 py-3 border-b border-white/5 text-neutral-300" {...props} />,
                        img: ({node, ...props}) => <img className="rounded-xl border border-white/10 max-w-full h-auto my-4 shadow-lg" alt={props.alt || "Image"} {...props} />,
                      }}
                    >
                      {content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                    <FileText className="h-16 w-16 text-neutral-700 mb-4" />
                    <h3 className="text-xl font-bold text-neutral-500 mb-2">EMPTY BUFFER</h3>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Stats Section */}
        <section className="mt-8 mb-20 md:mb-0">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <StatCard label="Words" value={wordCount.toString()} icon={<Type className="h-4 w-4" />} color="text-blue-400" />
            <StatCard label="Characters" value={charCount.toString()} icon={<Hash className="h-4 w-4" />} color="text-emerald-400" />
            <StatCard label="Lines" value={lineCount.toString()} icon={<List className="h-4 w-4" />} color="text-purple-400" />
            <StatCard label="Read Time" value={`${readTime} min`} icon={<Eye className="h-4 w-4" />} color="text-amber-400" />
          </div>
        </section>

        {/* --- CORE PROMO --- */}
        <div className="mt-20 mb-10">
           <CorePromo />
        </div>

      </main>
<Footer />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #262626; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #10b981; }
      `}</style>
    </div>
  );
}

function ToolbarButton({ onClick, icon, title }: { onClick: () => void; icon: React.ReactNode; title: string }) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} className="h-9 w-9 p-0 text-neutral-400 hover:text-emerald-400 hover:bg-emerald-500/5 rounded-xl transition-all" title={title}>
      {icon}
    </Button>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-neutral-900 border border-white/5 p-4 rounded-2xl text-center hover:border-emerald-500/20 transition-colors">
      <div className={cn("mb-2 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/5", color)}>{icon}</div>
      <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xl font-black text-white">{value}</p>
    </div>
  );
}