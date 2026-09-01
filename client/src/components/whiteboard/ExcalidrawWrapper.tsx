"use client";

import React, { useEffect, useState, forwardRef, useImperativeHandle, useCallback } from "react";
import dynamic from "next/dynamic";
import { Loader2, Download, Save, Trash2, Share2, Sparkles } from "lucide-react";
import "@excalidraw/excalidraw/index.css";

// ─── Dynamic import with SSR disabled ────────────────────────────────────────
const ExcalidrawDynamic = dynamic(
  async () => {
    const mod = await import("@excalidraw/excalidraw");
    return mod.Excalidraw;
  },
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d0d0d] text-white gap-3">
        <Loader2 className="animate-spin text-violet-500" size={36} />
        <span className="text-xs font-semibold text-neutral-400 tracking-wider uppercase animate-pulse">
          Initializing Agentic Whiteboard Canvas...
        </span>
      </div>
    ),
  }
);

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ExcalidrawWrapperProps {
  initialData?: {
    elements?: readonly any[];
    appState?: any;
    files?: any;
  };
  onChange?: (elements: readonly any[], appState: any, files: any) => void;
  theme?: "dark" | "light";
  viewModeEnabled?: boolean;
  zenModeEnabled?: boolean;
  gridModeEnabled?: boolean;
  onPointerUpdate?: (payload: { pointer: { x: number; y: number } }) => void;
  onRequestAI?: () => void;
  onRequestExport?: () => void;
  onRequestShare?: () => void;
  onRequestClear?: () => void;
  onRequestSave?: () => void;
}

export interface ExcalidrawWrapperRef {
  updateScene: (sceneData: { elements?: any[]; appState?: any; files?: any; commitToHistory?: boolean }) => void;
  getSceneElements: () => readonly any[];
  getAppState: () => any;
  getFiles: () => any;
  scrollToContent: (target?: any, opts?: any) => void;
  resetScene: () => void;
  exportToPng: () => Promise<Blob | null>;
  importLibraryFromUrl: (url: string) => Promise<boolean>;
  updateLibrary: (opts: { libraryItems: any[]; merge?: boolean; prompt?: boolean }) => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const ExcalidrawWrapper = forwardRef<ExcalidrawWrapperRef, ExcalidrawWrapperProps>(
  (
    {
      initialData,
      onChange,
      theme = "dark",
      viewModeEnabled = false,
      zenModeEnabled = false,
      gridModeEnabled = false,
      onPointerUpdate,
      onRequestAI,
      onRequestExport,
      onRequestShare,
      onRequestClear,
      onRequestSave,
    },
    ref
  ) => {
    const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [MainMenu, setMainMenu] = useState<any>(null);
    const [WelcomeScreen, setWelcomeScreen] = useState<any>(null);
    const [exportToBlob, setExportToBlob] = useState<any>(null);
    const lastElementsCountRef = React.useRef(0);

    useEffect(() => {
      setIsMounted(true);
      import("@excalidraw/excalidraw").then((mod) => {
        setMainMenu(() => mod.MainMenu);
        setWelcomeScreen(() => mod.WelcomeScreen);
        setExportToBlob(() => mod.exportToBlob);
      });
    }, []);

    // Import library from URL
    const importLibraryFromUrl = useCallback(
      async (url: string): Promise<boolean> => {
        if (!excalidrawAPI) return false;
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();
          const items = json.library || json.libraryItems || (Array.isArray(json) ? json : null);
          if (!items || !items.length) throw new Error("Invalid library format");
          excalidrawAPI.updateLibrary({
            libraryItems: items,
            merge: true,
            prompt: false,
          });
          return true;
        } catch (err) {
          console.error("Failed to import library:", err);
          return false;
        }
      },
      [excalidrawAPI]
    );

    // Auto-detect and install library from URL hash (#addLibrary=...)
    useEffect(() => {
      if (!excalidrawAPI || typeof window === "undefined") return;
      const hash = window.location.hash;
      if (hash.includes("addLibrary=")) {
        const match = hash.match(/addLibrary=([^&]+)/);
        if (match && match[1]) {
          const url = decodeURIComponent(match[1]);
          importLibraryFromUrl(url).then((success) => {
            if (success) {
              window.history.replaceState(null, "", window.location.pathname);
            }
          });
        }
      }
    }, [excalidrawAPI, importLibraryFromUrl]);

    // Sync async initialData (AI inserts, DB load)
    useEffect(() => {
      if (excalidrawAPI && initialData?.elements && initialData.elements.length > 0) {
        const count = initialData.elements.length;
        if (count !== lastElementsCountRef.current) {
          lastElementsCountRef.current = count;
          excalidrawAPI.updateScene({
            elements: initialData.elements,
            appState: {
              theme: theme === "light" ? "light" : "dark",
              viewBackgroundColor: theme === "light" ? "#ffffff" : "#121212",
              ...initialData.appState,
            },
            commitToHistory: false,
          });
          setTimeout(() => {
            excalidrawAPI.scrollToContent(undefined, { fitToViewport: true, animate: true });
          }, 150);
        }
      }
    }, [excalidrawAPI, initialData, theme]);

    // PNG export
    const exportToPng = useCallback(async (): Promise<Blob | null> => {
      if (!excalidrawAPI || !exportToBlob) return null;
      try {
        const blob = await exportToBlob({
          elements: excalidrawAPI.getSceneElements().filter((e: any) => !e.isDeleted),
          appState: {
            ...excalidrawAPI.getAppState(),
            exportBackground: true,
            exportWithDarkMode: theme === "dark",
          },
          files: excalidrawAPI.getFiles(),
          mimeType: "image/png",
          quality: 1,
          exportPadding: 24,
        });
        return blob;
      } catch {
        return null;
      }
    }, [excalidrawAPI, exportToBlob, theme]);

    useImperativeHandle(ref, () => ({
      updateScene: (sceneData) => {
        if (excalidrawAPI) {
          excalidrawAPI.updateScene(sceneData);
          if (sceneData.elements?.length) lastElementsCountRef.current = sceneData.elements.length;
        }
      },
      getSceneElements: () => excalidrawAPI?.getSceneElements() ?? [],
      getAppState: () => excalidrawAPI?.getAppState() ?? {},
      getFiles: () => excalidrawAPI?.getFiles() ?? {},
      scrollToContent: (target, opts) =>
        excalidrawAPI?.scrollToContent(target, { fitToViewport: true, animate: true, ...opts }),
      resetScene: () => {
        excalidrawAPI?.resetScene();
        lastElementsCountRef.current = 0;
      },
      exportToPng,
      importLibraryFromUrl,
      updateLibrary: (opts) => excalidrawAPI?.updateLibrary(opts),
    }));


    const isDark = theme === "dark";

    if (!isMounted) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d0d0d] text-white gap-3">
          <Loader2 className="animate-spin text-violet-500" size={36} />
          <span className="text-xs font-semibold text-neutral-400 tracking-wider uppercase">
            Loading Workspace...
          </span>
        </div>
      );
    }

    return (
      <div className="w-full h-full relative overflow-hidden bg-[#121212]">
        <ExcalidrawDynamic
          excalidrawAPI={(api: any) => setExcalidrawAPI(api)}
          initialData={{
            elements: initialData?.elements || [],
            appState: {
              theme: isDark ? "dark" : "light",
              viewBackgroundColor: isDark ? "#121212" : "#ffffff",
              gridSize: gridModeEnabled ? 20 : null,
              viewModeEnabled,
              zenModeEnabled,
              ...initialData?.appState,
            },
            files: initialData?.files || {},
          }}
          onChange={(elements, appState, files) => onChange?.(elements, appState, files)}
          onPointerUpdate={onPointerUpdate}
          UIOptions={{
            canvasActions: {
              export: false,
              saveToActiveFile: false,
              toggleTheme: true,
              clearCanvas: false,
              changeViewBackgroundColor: true,
              saveAsImage: false,
              loadScene: true,
            },
            tools: { image: true },
          }}
        >
          {/* ── Custom hamburger Main Menu ──────────────────────────── */}
          {MainMenu && (
            <MainMenu>
              <MainMenu.Item onSelect={() => onRequestSave?.()} icon={<Save size={14} />}>
                Save to Cloud
              </MainMenu.Item>
              <MainMenu.Item onSelect={() => onRequestAI?.()} icon={<Sparkles size={14} />}>
                Agentic AI Generate
              </MainMenu.Item>
              <MainMenu.Separator />
              <MainMenu.Item onSelect={() => onRequestExport?.()} icon={<Download size={14} />}>
                Export (PNG / JSON)
              </MainMenu.Item>
              <MainMenu.Item onSelect={() => onRequestShare?.()} icon={<Share2 size={14} />}>
                Share Link
              </MainMenu.Item>
              <MainMenu.Separator />
              <MainMenu.Item onSelect={() => onRequestClear?.()} icon={<Trash2 size={14} />}>
                Clear Canvas
              </MainMenu.Item>
              <MainMenu.DefaultItems.ToggleTheme />
              <MainMenu.DefaultItems.ChangeCanvasBackground />
            </MainMenu>
          )}

          {/* ── Welcome Screen (clean branding matching PAPERXIFY) ──── */}
          {WelcomeScreen && (
            <WelcomeScreen>
              <WelcomeScreen.Center>
                <WelcomeScreen.Center.Logo>
                  <div className="flex flex-col items-center gap-1 select-none py-2">
                    <span
                      style={{
                        fontFamily: "system-ui, -apple-system, sans-serif",
                        fontSize: "36px",
                        fontWeight: "900",
                        fontStyle: "italic",
                        letterSpacing: "1px",
                        color: isDark ? "#ffffff" : "#0f172a",
                        textTransform: "uppercase",
                        lineHeight: 1,
                      }}
                    >
                      PAPER<span style={{ color: "#ef4444" }}>XIFY</span>
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        letterSpacing: "3px",
                        textTransform: "uppercase",
                        color: isDark ? "#94a3b8" : "#64748b",
                        marginTop: "4px",
                      }}
                    >
                      Agentic Whiteboard
                    </span>
                  </div>
                </WelcomeScreen.Center.Logo>
                <WelcomeScreen.Center.Heading>
                  Draw, brainstorm, or generate diagrams with AI
                </WelcomeScreen.Center.Heading>
                <WelcomeScreen.Center.Menu>
                  <WelcomeScreen.Center.MenuItemLoadScene />
                  <WelcomeScreen.Center.MenuItemHelp />
                </WelcomeScreen.Center.Menu>
              </WelcomeScreen.Center>
            </WelcomeScreen>
          )}
        </ExcalidrawDynamic>
      </div>
    );
  }
);

ExcalidrawWrapper.displayName = "ExcalidrawWrapper";



