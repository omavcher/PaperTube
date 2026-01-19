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
  ChevronRight, ChevronDown, Plus
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

interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  category: 'readme' | 'documentation' | 'blog' | 'notes' | 'github';
}

export default function MarkdownEditorPage() {
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
  const [syntaxTheme, setSyntaxTheme] = useState<'dark' | 'light'>('dark');
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

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
      
      // Save to localStorage
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

  // Sync scroll between editor and preview
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
    toast.info("Workspace cleared");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
      .then(() => toast.success("Markdown copied to clipboard"))
      .catch(() => toast.error("Failed to copy"));
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
    toast.success("Markdown file downloaded");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setContent(content);
      toast.success("File loaded successfully");
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
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
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const selected = text.substring(start, end);
    
    const newContent = before + prefix + selected + suffix + after;
    setContent(newContent);
    
    // Focus and set cursor position
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
    toast.success("Template applied");
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
    toast.info(`Switched to ${mode} view`);
  };

  const formatCode = () => {
    // Simple code formatting - in production, use a proper formatter
    const lines = content.split('\n');
    const formatted = lines.map(line => {
      if (line.startsWith('```') && line.length > 3) {
        return '```' + line.substring(3).toLowerCase();
      }
      return line;
    }).join('\n');
    setContent(formatted);
    toast.success("Code blocks formatted");
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
    
    // Save with Ctrl+S
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleDownload();
      toast.info("Document saved");
    }
    
    // Format with Ctrl+Shift+F
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
      e.preventDefault();
      formatCode();
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const duplicateLine = () => {
    const textarea = editorRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = text.indexOf('\n', end);
    const line = text.substring(lineStart, lineEnd === -1 ? text.length : lineEnd);
    
    const before = text.substring(0, lineEnd === -1 ? text.length : lineEnd);
    const after = text.substring(lineEnd === -1 ? text.length : lineEnd);
    
    setContent(before + '\n' + line + after);
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
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-emerald-500/30">
      {/* Header Section */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50">
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
              <h1 className="text-xl font-bold tracking-tight">Markdown <span className="text-emerald-400">Live</span></h1>
              <Badge variant="outline" className="ml-2 border-emerald-500/20 text-emerald-400">
                v1.2
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <Label className="text-xs text-neutral-400">Auto-save</Label>
              <Switch
                checked={autoSave}
                onCheckedChange={setAutoSave}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
            
            <div className="flex items-center gap-2 bg-neutral-900 rounded-full p-1 border border-white/5">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => toggleViewMode('editor')}
                className={cn("rounded-full h-8 px-3 text-[10px] font-black uppercase tracking-widest", viewMode === 'editor' && "bg-emerald-500 text-black hover:bg-emerald-400")}
                title="Editor Only"
              >
                <FileCode className="h-3 w-3 mr-1" /> Write
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => toggleViewMode('split')}
                className={cn("rounded-full h-8 px-3 text-[10px] font-black uppercase tracking-widest hidden md:flex", viewMode === 'split' && "bg-emerald-500 text-black hover:bg-emerald-400")}
                title="Split View"
              >
                <Columns className="h-3 w-3 mr-1" /> Split
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => toggleViewMode('preview')}
                className={cn("rounded-full h-8 px-3 text-[10px] font-black uppercase tracking-widest", viewMode === 'preview' && "bg-emerald-500 text-black hover:bg-emerald-400")}
                title="Preview Only"
              >
                <Eye className="h-3 w-3 mr-1" /> Preview
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFullscreen}
              className="text-neutral-400 hover:text-emerald-400"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Enhanced Toolbar */}
        <div className="flex flex-wrap items-center gap-2 mb-4 bg-neutral-900/50 p-3 rounded-2xl border border-white/5 overflow-x-auto">
          {/* History Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUndo}
              disabled={historyIndex === 0}
              className="h-8 w-8 p-0 text-neutral-400 hover:text-emerald-400 disabled:opacity-50"
              title="Undo"
            >
              <Undo className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRedo}
              disabled={historyIndex === history.length - 1}
              className="h-8 w-8 p-0 text-neutral-400 hover:text-emerald-400 disabled:opacity-50"
              title="Redo"
            >
              <Redo className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="w-px h-6 bg-white/10 mx-1" />

          {/* Headings */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map(level => (
              <Button
                key={level}
                variant="ghost"
                size="sm"
                onClick={() => formatHeading(level)}
                className="h-8 w-8 p-0 text-neutral-400 hover:text-emerald-400"
                title={`Heading ${level}`}
              >
                <Type className="h-3.5 w-3.5" />
                <span className="text-[9px] absolute -bottom-1">{level}</span>
              </Button>
            ))}
          </div>

          <div className="w-px h-6 bg-white/10 mx-1" />

          {/* Formatting */}
          <ToolbarButton onClick={() => insertText("**", "**")} icon={<Bold size={16} />} title="Bold" />
          <ToolbarButton onClick={() => insertText("*", "*")} icon={<Italic size={16} />} title="Italic" />
          <ToolbarButton onClick={() => insertText("~~", "~~")} icon={<Minus size={16} />} title="Strikethrough" />
          <ToolbarButton onClick={() => insertText("`", "`")} icon={<Code size={16} />} title="Inline Code" />
          <ToolbarButton onClick={() => insertText("[", "](url)")} icon={<Link2 size={16} />} title="Link" />
          <ToolbarButton onClick={insertImage} icon={<Image size={16} />} title="Image" />
          <ToolbarButton onClick={() => insertText("> ")} icon={<Quote size={16} />} title="Blockquote" />

          <div className="w-px h-6 bg-white/10 mx-1" />

          {/* Lists */}
          <ToolbarButton onClick={() => insertList()} icon={<List size={16} />} title="Unordered List" />
          <ToolbarButton onClick={() => insertList(true)} icon={<ListOrdered size={16} />} title="Ordered List" />
          <ToolbarButton onClick={insertCheckbox} icon={<Check size={16} />} title="Checkbox" />
          <ToolbarButton onClick={insertTable} icon={<Table size={16} />} title="Table" />

          <div className="w-px h-6 bg-white/10 mx-1" />

          {/* Code Blocks */}
          <ToolbarButton onClick={() => insertText("```\n", "\n```")} icon={<TerminalIcon size={16} />} title="Code Block" />
          <ToolbarButton onClick={formatCode} icon={<Sparkles size={16} />} title="Format Code" />

          <div className="flex-grow" />

          {/* Templates Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTemplates(!showTemplates)}
            className={cn("text-neutral-400 hover:text-emerald-400 gap-2 h-9", showTemplates && "text-emerald-400 bg-emerald-500/10")}
          >
            {showTemplates ? <FolderOpen size={14} /> : <FolderClosed size={14} />}
            <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest">Templates</span>
          </Button>

          {/* File Operations */}
          <input 
            type="file" 
            id="md-upload" 
            className="hidden" 
            accept=".md,.txt,.markdown" 
            onChange={handleFileUpload}
          />
          <label 
            htmlFor="md-upload" 
            className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-1.5 rounded-md text-xs font-bold cursor-pointer flex items-center gap-2 transition-colors border border-white/5 h-9"
          >
            <Upload size={14} /> <span className="hidden sm:inline">Upload</span>
          </label>

          <Button variant="ghost" size="sm" onClick={handleCopy} className="text-neutral-400 hover:text-emerald-400 gap-2 h-9">
            <Copy size={14} /> <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest">Copy</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownload} className="text-neutral-400 hover:text-emerald-400 gap-2 h-9">
            <Download size={14} /> <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest">Export</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClear} className="text-neutral-400 hover:text-red-400 gap-2 h-9">
            <Trash2 size={14} />
          </Button>
        </div>

        {/* Templates Panel */}
        <AnimatePresence>
          {showTemplates && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <Card className="bg-neutral-900 border-emerald-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> Quick Start Templates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid grid-cols-5 mb-4">
                      <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                      <TabsTrigger value="readme" className="text-xs">README</TabsTrigger>
                      <TabsTrigger value="documentation" className="text-xs">Docs</TabsTrigger>
                      <TabsTrigger value="blog" className="text-xs">Blog</TabsTrigger>
                      <TabsTrigger value="notes" className="text-xs">Notes</TabsTrigger>
                    </TabsList>
                    
                    {['all', 'readme', 'documentation', 'blog', 'notes', 'github'].map((category) => (
                      <TabsContent key={category} value={category} className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {templates
                            .filter(t => category === 'all' || t.category === category)
                            .map(template => (
                              <Card 
                                key={template.id} 
                                className="bg-neutral-800/50 border-white/5 hover:border-emerald-500/30 cursor-pointer transition-all hover:scale-[1.02]"
                                onClick={() => applyTemplate(template.content)}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <h4 className="font-bold text-sm text-white">{template.name}</h4>
                                      <Badge variant="outline" className="mt-1 text-[10px] border-emerald-500/20 text-emerald-400">
                                        {template.category}
                                      </Badge>
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
        <div className={cn(
          "grid gap-6 min-h-[70vh]",
          viewMode === 'split' ? "md:grid-cols-2" : "grid-cols-1"
        )}>
          {/* Editor Pane */}
          {(viewMode === 'split' || viewMode === 'editor') && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }}
              className="relative group"
            >
              <div className="absolute top-4 left-6 text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] flex items-center gap-2 pointer-events-none">
                <Terminal size={12} /> editor.md
              </div>
              
              <div className="absolute top-4 right-6 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={duplicateLine}
                  className="h-7 text-xs text-neutral-400 hover:text-emerald-400"
                  title="Duplicate Line"
                >
                  Duplicate
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={scrollToTop}
                  className="h-7 text-xs text-neutral-400 hover:text-emerald-400"
                  title="Scroll to Top"
                >
                  ↑ Top
                </Button>
              </div>
              
              <textarea
                ref={editorRef}
                id="md-editor"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`# Start writing your markdown...

## Quick Tips:
- Use # for headings
- **Bold** with **asterisks**
- *Italic* with *asterisks*
- \`code\` with backticks
- - Lists with dashes

Type your content here...`}
                className="w-full h-full min-h-[500px] p-12 pt-20 rounded-[2.5rem] bg-neutral-900 border-2 border-white/5 font-mono text-sm text-neutral-300 focus:outline-none focus:border-emerald-500/30 transition-all resize-none shadow-2xl"
                spellCheck={true}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
              />
            </motion.div>
          )}

          {/* Preview Pane */}
          {(viewMode === 'split' || viewMode === 'preview') && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }}
              className="relative group"
            >
              <div className="absolute top-4 left-6 text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] flex items-center gap-2 pointer-events-none">
                <Eye size={12} /> preview.html
              </div>
              
              <div className="absolute top-4 right-6 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={scrollToBottom}
                  className="h-7 text-xs text-neutral-400 hover:text-emerald-400"
                  title="Scroll to Bottom"
                >
                  ↓ Bottom
                </Button>
                <Badge variant="outline" className="border-emerald-500/20 text-emerald-400 text-[10px]">
                  Live Preview
                </Badge>
              </div>
              
              <div 
                ref={previewRef}
                className="w-full h-full min-h-[500px] p-12 pt-20 rounded-[2.5rem] bg-neutral-900/40 border-2 border-white/5 font-sans overflow-y-auto shadow-inner scroll-smooth"
              >
                {content ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      code({node, inline, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '');
                        const language = match ? match[1] : '';
                        
                        if (!inline && language) {
                          return (
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={language}
                              PreTag="div"
                              className="rounded-xl border border-white/10"
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          );
                        }
                        
                        return (
                          <code className={cn("px-1.5 py-0.5 bg-black/30 rounded text-emerald-300 font-mono text-sm", className)} {...props}>
                            {children}
                          </code>
                        );
                      },
                      h1: ({node, ...props}) => <h1 className="text-3xl font-black text-white mt-8 mb-4 border-b border-white/10 pb-2" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-white mt-6 mb-3" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-xl font-bold text-white mt-5 mb-2" {...props} />,
                      h4: ({node, ...props}) => <h4 className="text-lg font-semibold text-white mt-4 mb-2" {...props} />,
                      p: ({node, ...props}) => <p className="text-neutral-300 mb-4 leading-relaxed" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-1 text-neutral-300" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-1 text-neutral-300" {...props} />,
                      li: ({node, ...props}) => <li className="pl-2" {...props} />,
                      blockquote: ({node, ...props}) => (
                        <blockquote className="border-l-4 border-emerald-500 pl-4 italic my-4 text-neutral-400" {...props} />
                      ),
                      a: ({node, ...props}) => (
                        <a 
                          className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          {...props} 
                        />
                      ),
                      table: ({node, ...props}) => (
                        <div className="overflow-x-auto my-6">
                          <table className="min-w-full border border-white/10 rounded-lg overflow-hidden" {...props} />
                        </div>
                      ),
                      thead: ({node, ...props}) => <thead className="bg-emerald-500/10" {...props} />,
                      th: ({node, ...props}) => <th className="px-4 py-2 text-left border border-white/10 text-emerald-400 font-bold" {...props} />,
                      td: ({node, ...props}) => <td className="px-4 py-2 border border-white/10 text-neutral-300" {...props} />,
                      img: ({node, ...props}) => (
                        <img 
                          className="rounded-lg border border-white/10 max-w-full h-auto my-4" 
                          alt={props.alt || "Image"} 
                          {...props} 
                        />
                      ),
                      hr: ({node, ...props}) => <hr className="border-white/10 my-8" {...props} />,
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <FileText className="h-16 w-16 text-neutral-700 mb-4" />
                    <h3 className="text-xl font-bold text-neutral-500 mb-2">No content to preview</h3>
                    <p className="text-neutral-600 max-w-md">
                      Start typing in the editor or choose a template from above to see the live preview here.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Stats & Actions Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <StatCard 
            label="Words" 
            value={wordCount.toString()} 
            icon={<Type className="h-4 w-4" />}
            color="text-blue-400"
          />
          <StatCard 
            label="Characters" 
            value={charCount.toString()} 
            icon={<Hash className="h-4 w-4" />}
            color="text-emerald-400"
          />
          <StatCard 
            label="Lines" 
            value={lineCount.toString()} 
            icon={<List className="h-4 w-4" />}
            color="text-purple-400"
          />
          <StatCard 
            label="Read Time" 
            value={`${readTime} min`} 
            icon={<Eye className="h-4 w-4" />}
            color="text-amber-400"
          />
          <StatCard 
            label="History" 
            value={`${historyIndex + 1}/${history.length}`} 
            icon={<Undo className="h-4 w-4" />}
            color="text-cyan-400"
          />
          <StatCard 
            label="Auto-save" 
            value={autoSave ? "ON" : "OFF"} 
            icon={autoSave ? <Check className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            color={autoSave ? "text-green-400" : "text-red-400"}
          />
        </div>

        {/* Quick Actions */}
        <Card className="bg-neutral-900 border-white/5">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <Zap className="h-4 w-4" /> Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.print()}
                className="border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
              >
                <FileText className="h-4 w-4 mr-2" /> Print Preview
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const htmlContent = document.querySelector('.prose')?.outerHTML || '';
                  navigator.clipboard.writeText(htmlContent);
                  toast.success("HTML copied to clipboard");
                }}
                className="border-blue-500/20 text-blue-400 hover:bg-blue-500/10"
              >
                <Code className="h-4 w-4 mr-2" /> Copy HTML
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  localStorage.removeItem('markdown-editor-content');
                  localStorage.removeItem('markdown-editor-history');
                  toast.success("Cache cleared");
                }}
                className="border-red-500/20 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Clear Cache
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const emailBody = encodeURIComponent(content);
                  window.open(`mailto:?subject=Markdown Document&body=${emailBody}`);
                }}
                className="border-amber-500/20 text-amber-400 hover:bg-amber-500/10"
              >
                <Mail className="h-4 w-4 mr-2" /> Email
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const twitterText = encodeURIComponent("Check out this markdown I wrote!");
                  window.open(`https://twitter.com/intent/tweet?text=${twitterText}`);
                }}
                className="border-sky-500/20 text-sky-400 hover:bg-sky-500/10"
              >
                <Twitter className="h-4 w-4 mr-2" /> Share
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <Footer />
    </div>
  );
}

function ToolbarButton({ onClick, icon, title }: { onClick: () => void; icon: React.ReactNode; title: string }) {
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={onClick} 
      className="h-9 w-9 p-0 text-neutral-400 hover:text-emerald-400 hover:bg-emerald-500/5 rounded-xl transition-all group relative"
      title={title}
    >
      {icon}
      <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-white/10">
        {title}
      </span>
    </Button>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-neutral-900 border border-white/5 p-4 rounded-2xl text-center hover:border-emerald-500/20 transition-colors group">
      <div className={cn("mb-2 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10", color)}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xl font-black text-white">{value}</p>
    </div>
  );
}