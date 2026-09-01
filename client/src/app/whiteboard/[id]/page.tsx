"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ExcalidrawWrapper,
  ExcalidrawWrapperRef,
} from "@/components/whiteboard/ExcalidrawWrapper";
import { AgenticAIPanel } from "@/components/whiteboard/AgenticAIPanel";
import { LibrariesModal } from "@/components/whiteboard/LibrariesModal";
import {
  PenTool,
  Sparkles,
  ChevronLeft,
  CloudCheck,
  Loader2,
  Share2,
  Download,
  Trash2,
  Moon,
  Sun,
  Grid,
  Check,
  Copy,
  Layers,
  FileCode,
  FileImage,
  ArrowUpRight,
  HelpCircle,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/config/api";

type SyncStatus = "saved" | "saving" | "unsaved";

export default function WhiteboardEditorPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.id as string) || "board";

  const excalidrawRef = useRef<ExcalidrawWrapperRef>(null);

  const [title, setTitle] = useState("Untitled Whiteboard");
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("saved");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [gridMode, setGridMode] = useState(false);
  const [initialData, setInitialData] = useState<{ elements: any[]; appState: any; files: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isLibrariesModalOpen, setIsLibrariesModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // In-Canvas AI Generation HUD states
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGenerationStage, setAiGenerationStage] = useState("");
  const [aiGenerationPrompt, setAiGenerationPrompt] = useState("");

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentElementsRef = useRef<readonly any[]>([]);
  const currentAppStateRef = useRef<any>({});
  const currentFilesRef = useRef<any>({});
  const lastSavedElementsSigRef = useRef<string>("");
  const titleRef = useRef(title);

  useEffect(() => {
    titleRef.current = title;
  }, [title]);

  const getElementsSignature = (elements: readonly any[]) => {
    if (!elements || elements.length === 0) return "0";
    let sum = 0;
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      if (!el.isDeleted) {
        sum += (el.version || 1) + Math.round(el.x || 0) + Math.round(el.y || 0);
      }
    }
    return `${elements.filter((e) => !e.isDeleted).length}_${sum}`;
  };

  // 1. Initial Load: Fetch from Backend or Local Storage
  useEffect(() => {
    let mounted = true;

    async function loadWhiteboard() {
      try {
        setLoading(true);

        // Check if there's preloaded template data in session storage
        const preloadedRaw = typeof window !== "undefined" ? sessionStorage.getItem(`paperxify_wb_init_${slug}`) : null;
        if (preloadedRaw) {
          try {
            const preloaded = JSON.parse(preloadedRaw);
            sessionStorage.removeItem(`paperxify_wb_init_${slug}`);

            const loadedTitle = preloaded.title || "Untitled Whiteboard";
            const loadedElements = preloaded.elements || [];
            const loadedAppState = preloaded.appState || { theme: "dark" };
            const loadedFiles = preloaded.files || {};

            if (mounted) {
              setTitle(loadedTitle);
              setInitialData({
                elements: loadedElements,
                appState: loadedAppState,
                files: loadedFiles,
              });
              currentElementsRef.current = loadedElements;
              currentAppStateRef.current = loadedAppState;
              currentFilesRef.current = loadedFiles;
              lastSavedElementsSigRef.current = getElementsSignature(loadedElements);
              setSyncStatus("saved");

              // Save to cloud in background
              setTimeout(() => {
                performSave(loadedTitle);
              }, 500);
            }
            setLoading(false);
            return;
          } catch (e) {
            // fallback to server
          }
        }

        // Fetch from server
        const token = localStorage.getItem("authToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        try {
          const res = await api.get(`/whiteboard/${slug}`, { headers });
          if (res.data.success && res.data.data) {
            const wb = res.data.data;
            if (mounted) {
              setTitle(wb.title || "Untitled Whiteboard");
              setInitialData({
                elements: wb.elements || [],
                appState: wb.appState || { theme: "dark" },
                files: wb.files || {},
              });
              currentElementsRef.current = wb.elements || [];
              lastSavedElementsSigRef.current = getElementsSignature(wb.elements || []);
              setSyncStatus("saved");
            }
            setLoading(false);
            return;
          }
        } catch (serverErr) {
          // If not on server, check local history storage
          const localList = localStorage.getItem("paperxify_local_whiteboards");
          if (localList) {
            const parsedList = JSON.parse(localList);
            const found = parsedList.find((w: any) => w.slug === slug);
            if (found && mounted) {
              setTitle(found.title || "Untitled Whiteboard");
              setInitialData({
                elements: found.elements || [],
                appState: found.appState || { theme: "dark" },
                files: found.files || {},
              });
              currentElementsRef.current = found.elements || [];
              lastSavedElementsSigRef.current = getElementsSignature(found.elements || []);
              setSyncStatus("saved");
              setLoading(false);
              return;
            }
          }
        }

        // New board initialization (empty canvas)
        if (mounted) {
          setTitle("Untitled Whiteboard");
          setInitialData({
            elements: [],
            appState: { theme: "dark", viewBackgroundColor: "#0d0d0d" },
            files: {},
          });
          lastSavedElementsSigRef.current = "0";
          setSyncStatus("saved");
        }
      } catch (err) {
        console.error("Failed to load whiteboard data:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadWhiteboard();

    return () => {
      mounted = false;
    };
  }, [slug]);

  // 2. Perform Save to Cloud & Local Storage
  const performSave = useCallback(
    async (currentTitle: string) => {
      try {
        setSyncStatus("saving");
        const elements = currentElementsRef.current || [];
        const appState = currentAppStateRef.current || {};
        const files = currentFilesRef.current || {};

        const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Send to backend
        await api.post(
          "/whiteboard/save",
          {
            slug,
            title: currentTitle,
            elements,
            appState,
            files,
            isPublic: true,
          },
          { headers }
        );

        // Update local storage backup
        try {
          const localList = localStorage.getItem("paperxify_local_whiteboards");
          let list = localList ? JSON.parse(localList) : [];
          const index = list.findIndex((w: any) => w.slug === slug);
          const item = {
            slug,
            title: currentTitle,
            elements,
            appState,
            elementCount: elements.filter((e: any) => !e.isDeleted).length,
            updatedAt: new Date().toISOString(),
            createdAt: index >= 0 ? list[index].createdAt : new Date().toISOString(),
          };
          if (index >= 0) {
            list[index] = item;
          } else {
            list.unshift(item);
          }
          localStorage.setItem("paperxify_local_whiteboards", JSON.stringify(list));
        } catch (e) {}

        lastSavedElementsSigRef.current = getElementsSignature(elements);
        setSyncStatus("saved");
      } catch (error) {
        console.error("Auto-save failed:", error);
        setSyncStatus("unsaved");
      }
    },
    [slug]
  );

  // 3. Canvas Change Handler with Debounced Auto-Save
  const handleCanvasChange = (elements: readonly any[], appState: any, files: any) => {
    currentElementsRef.current = elements;
    currentAppStateRef.current = appState;
    currentFilesRef.current = files;

    const currentSig = getElementsSignature(elements);
    if (currentSig === lastSavedElementsSigRef.current) {
      // Elements haven't changed (pointer hover / cursor movement only)
      return;
    }

    setSyncStatus("unsaved");

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      performSave(titleRef.current);
    }, 1200);
  };

  // 4. Handle Title Change & Instant Save
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    titleRef.current = newTitle;
    setSyncStatus("unsaved");

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      performSave(newTitle);
    }, 800);
  };

  // 5. Insert AI-generated elements onto the canvas
  const handleInsertAIElements = (newElements: any[], mode: "append" | "replace", aiTitle?: string) => {
    if (!excalidrawRef.current) return;

    if (aiTitle && title === "Untitled Whiteboard") {
      setTitle(aiTitle);
    }

    let updatedElements = [];

    if (mode === "replace") {
      updatedElements = newElements;
    } else {
      const existing = excalidrawRef.current.getSceneElements() || [];
      // Calculate offset so new diagram doesn't overlap completely
      let maxY = 0;
      existing.forEach((el) => {
        if (!el.isDeleted && el.y !== undefined && el.height !== undefined) {
          maxY = Math.max(maxY, el.y + el.height);
        }
      });

      const yOffset = maxY > 0 ? maxY + 80 : 0;
      const shifted = newElements.map((el) => ({
        ...el,
        y: el.y + yOffset,
      }));

      updatedElements = [...existing, ...shifted];
    }

    excalidrawRef.current.updateScene({
      elements: updatedElements,
      commitToHistory: true,
    });

    currentElementsRef.current = updatedElements;
    performSave(aiTitle || title);

    setTimeout(() => {
      excalidrawRef.current?.scrollToContent(undefined, { fitToViewport: true, animate: true });
    }, 150);
  };

  // 6. In-Canvas AI Agent Generator Handler (Non-blocking)
  const handleStartAIGenerate = async ({
    prompt: genPrompt,
    diagramType,
    insertMode,
  }: {
    prompt: string;
    diagramType: string;
    insertMode: "append" | "replace";
  }) => {
    setIsGeneratingAI(true);
    setAiGenerationPrompt(genPrompt);
    setAiGenerationStage(`Architecting ${diagramType} topology...`);

    const stageTimer1 = setTimeout(() => {
      setAiGenerationStage("Applying library vector stencils & connecting nodes...");
    }, 2400);

    const stageTimer2 = setTimeout(() => {
      setAiGenerationStage("Optimizing layout & rendering onto canvas...");
    }, 5200);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await api.post(
        "/whiteboard/ai-generate",
        {
          prompt: genPrompt,
          diagramType,
          theme,
        },
        { headers }
      );

      if (response.data.success && response.data.elements) {
        setAiGenerationStage("✨ Rendering diagram on whiteboard...");
        handleInsertAIElements(response.data.elements, insertMode, response.data.title);
        toast.success(`Generated "${response.data.title || diagramType}" diagram!`);
      } else {
        toast.error("Could not generate diagram layout. Please try again.");
      }
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      toast.error(error.response?.data?.message || "Failed to generate AI diagram.");
    } finally {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      setIsGeneratingAI(false);
      setAiGenerationStage("");
      setAiGenerationPrompt("");
    }
  };

  // 7. Clear Canvas
  const handleClearCanvas = () => {
    if (confirm("Are you sure you want to clear the entire whiteboard?")) {
      excalidrawRef.current?.resetScene();
      currentElementsRef.current = [];
      performSave(title);
      toast.success("Canvas cleared");
    }
  };

  // 7. Copy Share Link
  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      toast.success("Whiteboard link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // 8. Library Importer
  const handleImportLibrary = async (url: string): Promise<boolean> => {
    if (!excalidrawRef.current) return false;
    return excalidrawRef.current.importLibraryFromUrl(url);
  };

  // 9. Export Helpers
  const handleExportPNG = async () => {
    if (!excalidrawRef.current) return;
    try {
      const blob = await excalidrawRef.current.exportToPng?.();
      if (!blob) { toast.error("Nothing on canvas to export"); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported as PNG!");
      setIsExportModalOpen(false);
    } catch {
      toast.error("PNG export failed");
    }
  };

  const handleExportJSON = () => {
    const elements = excalidrawRef.current?.getSceneElements() || [];
    const appState = excalidrawRef.current?.getAppState() || {};
    const files = excalidrawRef.current?.getFiles() || {};

    const data = {
      type: "excalidraw",
      version: 2,
      source: "https://paperxify.com/whiteboard",
      elements: elements.filter((e: any) => !e.isDeleted),
      appState: {
        viewBackgroundColor: appState.viewBackgroundColor || "#0d0d0d",
        gridSize: appState.gridSize || null,
      },
      files,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.excalidraw`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported to .excalidraw JSON file");
    setIsExportModalOpen(false);
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#070707] text-white font-sans overflow-hidden select-none">
      {/* ──── TOP WORKSPACE HEADER BAR ──── */}
      <header className="h-14 bg-[#0a0a0a] border-b border-white/[0.08] px-2.5 sm:px-4 flex items-center justify-between shrink-0 z-20 gap-2">
        {/* Left: Back Link & Document Title */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
          <Link
            href="/whiteboard"
            title="Back to Whiteboard Hub"
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-300 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <ChevronLeft size={16} />
            <span className="font-black italic text-xs tracking-wider text-white select-none hidden xs:inline">
              PAPER<span className="text-[#ef4444]">XIFY</span>
            </span>
          </Link>

          {/* Editable Title */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1 sm:flex-initial">
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Untitled Whiteboard"
              className="w-full bg-transparent hover:bg-white/[0.04] focus:bg-[#141414] border border-transparent hover:border-white/10 focus:border-violet-500/40 rounded-lg px-1.5 sm:px-2 py-1 text-xs sm:text-sm font-bold text-white focus:outline-none transition-all truncate max-w-[130px] xs:max-w-[180px] sm:max-w-xs md:max-w-md"
            />

            {/* Sync Status Pill */}
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-neutral-400 shrink-0">
              {syncStatus === "saving" ? (
                <span className="flex items-center gap-1 text-amber-400">
                  <Loader2 size={11} className="animate-spin" />
                  <span className="hidden md:inline">Saving...</span>
                </span>
              ) : syncStatus === "saved" ? (
                <span className="flex items-center gap-1 text-emerald-400">
                  <Check size={11} strokeWidth={3} />
                  <span className="hidden md:inline">Saved</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-neutral-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="hidden md:inline">Unsaved</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Workspace Action Buttons (Responsive) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* AI Agent Generator Button */}
          <button
            onClick={() => setIsAIPanelOpen(true)}
            title="Generate Diagram with AI Agent"
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:shadow-[0_0_20px_rgba(139,92,246,0.6)] transition-all transform active:scale-95 cursor-pointer"
          >
            <Sparkles size={13} className="animate-pulse shrink-0" />
            <span className="hidden sm:inline">Agentic AI</span>
            <span className="sm:hidden text-[11px]">AI</span>
          </button>

          {/* Libraries Hub */}
          <button
            onClick={() => setIsLibrariesModalOpen(true)}
            title="Browse & Install Excalidraw Component Libraries"
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-semibold text-neutral-200 hover:text-white transition-colors cursor-pointer"
          >
            <Layers size={13} className="text-violet-400 shrink-0" />
            <span className="hidden md:inline">Libraries</span>
          </button>

          {/* Export Menu */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            title="Export whiteboard as PNG or Excalidraw JSON"
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-semibold text-neutral-200 hover:text-white transition-colors cursor-pointer"
          >
            <Download size={13} className="shrink-0" />
            <span className="hidden md:inline">Export</span>
          </button>

          {/* Share Modal */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            title="Share whiteboard link"
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-semibold text-neutral-200 hover:text-white transition-colors cursor-pointer"
          >
            <Share2 size={13} className="shrink-0" />
            <span className="hidden md:inline">Share</span>
          </button>

          {/* Clear Canvas */}
          <button
            onClick={handleClearCanvas}
            title="Clear whiteboard"
            className="p-1.5 sm:p-2 rounded-xl bg-white/[0.05] hover:bg-red-500/20 text-neutral-400 hover:text-red-400 border border-white/[0.08] transition-colors cursor-pointer shrink-0"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </header>

      {/* ──── FULL CANVAS VIEWPORT ──── */}
      <main className="flex-1 w-full h-full relative overflow-hidden bg-[#0d0d0d]">
        {loading ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d0d0d] text-white gap-3">
            <Loader2 className="animate-spin text-violet-500" size={36} />
            <p className="text-xs font-semibold text-neutral-400 tracking-wider uppercase">
              Loading Agentic Whiteboard Canvas...
            </p>
          </div>
        ) : (
          <ExcalidrawWrapper
            ref={excalidrawRef}
            initialData={initialData || undefined}
            onChange={handleCanvasChange}
            theme={theme}
            gridModeEnabled={gridMode}
            onRequestAI={() => setIsAIPanelOpen(true)}
            onRequestExport={() => setIsExportModalOpen(true)}
            onRequestShare={() => setIsShareModalOpen(true)}
            onRequestSave={() => performSave(title)}
            onRequestClear={handleClearCanvas}
          />
        )}
        {/* ──── IN-CANVAS FLOATING AGENT HUD ──── */}
        {isGeneratingAI && (
          <div className="absolute bottom-3 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-200 w-[94vw] sm:w-auto max-w-md">
            <div className="px-4 sm:px-5 py-3 rounded-2xl bg-[#0c0c0e]/95 border border-violet-500/40 shadow-[0_10px_40px_rgba(0,0,0,0.85),0_0_25px_rgba(139,92,246,0.3)] backdrop-blur-xl flex items-center gap-3 w-full">
              <div className="relative flex items-center justify-center shrink-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/40 animate-pulse">
                  <Sparkles size={15} />
                </div>
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-white truncate">
                    {aiGenerationPrompt || "AI Diagram Agent"}
                  </p>
                  <span className="text-[9.5px] font-mono font-bold text-violet-400 animate-pulse shrink-0">
                    GENERATING
                  </span>
                </div>
                <p className="text-[10.5px] text-neutral-300 flex items-center gap-1.5 mt-0.5 truncate">
                  <Loader2 size={10} className="animate-spin text-violet-400 shrink-0" />
                  <span className="truncate">{aiGenerationStage}</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ──── AGENTIC AI PANEL ──── */}
      <AgenticAIPanel
        isOpen={isAIPanelOpen}
        onClose={() => setIsAIPanelOpen(false)}
        onStartGenerate={handleStartAIGenerate}
        onInsertElements={handleInsertAIElements}
        theme={theme}
      />

      {/* ──── SHARE MODAL ──── */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0d0d0d] border border-white/[0.1] rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 size={16} className="text-violet-400" />
                <h3 className="text-sm font-bold text-white">Share Agentic Whiteboard</h3>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Anyone with this link can view and collaborate on this whiteboard.
            </p>

            <div className="flex items-center gap-2 bg-[#141414] border border-white/[0.08] rounded-xl p-2">
              <input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? window.location.href : ""}
                className="w-full bg-transparent text-xs text-neutral-300 focus:outline-none truncate font-mono"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shrink-0 transition-colors flex items-center gap-1"
              >
                {copiedLink ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedLink ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-white transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──── EXPORT MODAL ──── */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0d0d0d] border border-white/[0.1] rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download size={16} className="text-red-500" />
                <h3 className="text-sm font-bold text-white">Export Whiteboard</h3>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleExportPNG}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#141414] hover:bg-[#1a1a1a] border border-white/[0.06] hover:border-white/20 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
                    <FileImage size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Export as PNG</p>
                    <p className="text-[10px] text-neutral-400">High-quality image with transparent or dark background</p>
                  </div>
                </div>
                <ArrowUpRight size={13} className="text-neutral-500 group-hover:text-white" />
              </button>

              <button
                onClick={handleExportJSON}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#141414] hover:bg-[#1a1a1a] border border-white/[0.06] hover:border-white/20 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
                    <FileCode size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Excalidraw JSON (.excalidraw)</p>
                    <p className="text-[10px] text-neutral-400">Export raw diagram data to open anywhere</p>
                  </div>
                </div>
                <ArrowUpRight size={13} className="text-neutral-500 group-hover:text-white" />
              </button>

              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#141414] hover:bg-[#1a1a1a] border border-white/[0.06] hover:border-white/20 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                    <Share2 size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Copy Shareable Link</p>
                    <p className="text-[10px] text-neutral-400">Direct cloud workspace link</p>
                  </div>
                </div>
                <ArrowUpRight size={13} className="text-neutral-500 group-hover:text-white" />
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ──── EXCALIDRAW LIBRARIES HUB MODAL ──── */}
      <LibrariesModal
        isOpen={isLibrariesModalOpen}
        onClose={() => setIsLibrariesModalOpen(false)}
        onImportLibrary={handleImportLibrary}
      />
    </div>
  );
}
