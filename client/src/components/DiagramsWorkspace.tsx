"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Grid,
  List,
  Lock,
  User,
  Trash2,
  MoreVertical,
  Activity,
  Workflow,
  Layers,
  RefreshCw,
  Database,
  LayoutGrid,
  Calendar,
  Compass,
  PieChart,
  ChevronRight,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import api from "@/config/api";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  type: string;
  details?: string;
  value?: number;
}

interface Edge {
  from: string;
  to: string;
  label?: string;
}

interface Diagram {
  _id: string;
  slug: string;
  prompt: string;
  format: string;
  model: string;
  language: string;
  theme: string;
  nodes: Node[];
  edges: Edge[];
  createdAt: string;
  updatedAt: string;
}

const FORMAT_ICONS: Record<string, any> = {
  flowchart: Workflow,
  sequence: Activity,
  class: Layers,
  state: RefreshCw,
  er: Database,
  journey: Compass,
  pie: PieChart,
  quadrant: LayoutGrid,
  timeline: Calendar,
  sankey: Compass,
  xy: Activity,
  block: Layers,
};

// Mini SVG Diagram Preview generator
function DiagramMiniPreview({ nodes, edges, theme, format }: { nodes: Node[], edges: Edge[], theme: string, format: string }) {
  const getStrokeColor = () => {
    switch (theme) {
      case "cyber": return "#06b6d4";
      case "amber": return "#f59e0b";
      case "emerald": return "#10b981";
      default: return "#525252";
    }
  };

  const getNodeColor = (type: string) => {
    if (theme === "cyber") {
      switch (type) {
        case "start": return "#0891b2";
        case "decision": return "#7c3aed";
        case "success": return "#059669";
        case "fail": return "#e11d48";
        default: return "#2563eb";
      }
    } else if (theme === "amber") {
      switch (type) {
        case "start": return "#d97706";
        default: return "#ea580c";
      }
    } else if (theme === "emerald") {
      switch (type) {
        case "start": return "#059669";
        default: return "#0d9488";
      }
    } else {
      switch (type) {
        case "start": return "#737373";
        default: return "#404040";
      }
    }
  };

  return (
    <svg viewBox="0 0 800 600" className="w-full h-full bg-[#050505] rounded-t-xl overflow-hidden p-3 select-none pointer-events-none border-b border-white/[0.04]">
      {/* Background Grid Pattern */}
      <rect width="100%" height="100%" fill="#050505" />
      <defs>
        <pattern id="miniGrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.015)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#miniGrid)" />

      {/* Render Connections */}
      {format !== "pie" && format !== "quadrant" && format !== "sankey" && format !== "xy" && edges?.map((edge, i) => {
        const fromNode = nodes?.find((n) => n.id === edge.from);
        const toNode = nodes?.find((n) => n.id === edge.to);
        if (!fromNode || !toNode) return null;
        return (
          <line
            key={i}
            x1={fromNode.x + 80}
            y1={fromNode.y + 25}
            x2={toNode.x + 80}
            y2={toNode.y + 25}
            stroke={getStrokeColor()}
            strokeWidth={5}
            opacity={0.35}
          />
        );
      })}

      {/* Render Nodes */}
      {format !== "pie" && nodes?.map((node, i) => {
        let shape = "rect";
        let width = 160;
        let height = 50;
        let rx = 10;
        let ry = 10;
        
        if (format === "flowchart") {
          if (node.type === "decision") {
            shape = "diamond";
          } else if (node.type === "start") {
            rx = 25;
            ry = 25;
          }
        } else if (format === "state") {
          width = 100;
          height = 100;
          rx = 50;
          ry = 50;
        } else if (format === "xy") {
          width = 40;
          height = 40;
          rx = 20;
          ry = 20;
        }

        if (shape === "diamond") {
          const cx = node.x + 60;
          const cy = node.y + 60;
          const path = `M ${cx} ${cy - 50} L ${cx + 50} ${cy} L ${cx} ${cy + 50} L ${cx - 50} ${cy} Z`;
          return (
            <path
              key={i}
              d={path}
              fill={getNodeColor(node.type)}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={3}
              opacity={0.85}
            />
          );
        }

        return (
          <rect
            key={i}
            x={node.x}
            y={node.y}
            width={width}
            height={height}
            rx={rx}
            ry={ry}
            fill={getNodeColor(node.type)}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={3}
            opacity={0.85}
          />
        );
      })}

      {/* Render Pie Chart slices */}
      {format === "pie" && (
        <g transform="translate(100, 50)">
          <circle cx="300" cy="250" r="180" fill="none" stroke="#22d3ee" strokeWidth={5} opacity={0.1} />
          <path d="M300,250 L300,70 A180,180 0 0,1 471,192 Z" fill="rgba(6, 182, 212, 0.6)" stroke="#06b6d4" strokeWidth={3} />
          <path d="M300,250 L471,192 A180,180 0 0,1 354,421 Z" fill="rgba(147, 51, 234, 0.6)" stroke="#9333ea" strokeWidth={3} />
          <path d="M300,250 L354,421 A180,180 0 0,1 152,322 Z" fill="rgba(16, 185, 129, 0.6)" stroke="#10b981" strokeWidth={3} />
          <path d="M300,250 L152,322 A180,180 0 0,1 300,70 Z" fill="rgba(244, 63, 94, 0.6)" stroke="#f43f5e" strokeWidth={3} />
        </g>
      )}
    </svg>
  );
}

interface DiagramsWorkspaceProps {
  onLoadDiagram: (diagram: Diagram) => void;
}

export default function DiagramsWorkspace({ onLoadDiagram }: DiagramsWorkspaceProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);
  const [loading, setLoading] = useState(true);

  // Authenticate & Load
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
    if (!token) {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      setLoading(true);
      const res = await api.get("/diagram/history", { headers: { Auth: token } });
      if (res.data.success) {
        setDiagrams(res.data.data);
      }
    } catch (e) {
      console.error("Failed to load diagram history:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated, fetchHistory]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this diagram?")) return;
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const res = await api.delete(`/diagram/${id}`, { headers: { Auth: token } });
      if (res.data.success) {
        toast.success("Diagram deleted successfully.");
        setDiagrams(prev => prev.filter(d => d._id !== id));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete diagram.");
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return "";
    }
  };

  const filteredDiagrams = useMemo(() => {
    return diagrams.filter(d =>
      d.prompt.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [diagrams, searchQuery]);

  if (isAuthenticated === false && !loading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="text-center space-y-4 max-w-sm p-6 bg-neutral-900/40 border border-white/10 rounded-3xl backdrop-blur-md">
          <div className="w-12 h-12 bg-cyan-600/10 rounded-2xl mx-auto flex items-center justify-center border border-cyan-600/20 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <Lock className="w-6 h-6 text-cyan-500" />
          </div>
          <div className="space-y-1.5">
            <h4 className="text-md font-bold text-white">Access Locked</h4>
            <p className="text-xs text-neutral-500">Sign in to sync, save, and load your custom AI diagrams.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full bg-[#050505] text-white py-12 px-4 md:px-8 border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Options */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.04] pb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Workflow className="text-cyan-500" size={20} /> Your Diagram Canvas Library
            </h2>
            <p className="text-xs text-neutral-500 mt-1">Review, load, and manage your saved neural layout models.</p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Search Box */}
            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="Search diagrams..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.07] focus:border-white/20 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-neutral-500 outline-none transition-all"
              />
            </div>

            {/* View Mode */}
            <div className="flex bg-neutral-900 border border-white/5 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={cn("p-1.5 rounded-lg transition-all", viewMode === "grid" ? "bg-white/10 text-white" : "text-neutral-500 hover:text-neutral-300")}
              >
                <Grid size={14} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn("p-1.5 rounded-lg transition-all", viewMode === "list" ? "bg-white/10 text-white" : "text-neutral-500 hover:text-neutral-300")}
              >
                <List size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="w-full h-40 flex items-center justify-center">
            <Loader2 className="text-cyan-500 animate-spin" size={24} />
          </div>
        ) : filteredDiagrams.length === 0 ? (
          <div className="w-full text-center py-16 bg-neutral-900/20 border border-white/[0.04] rounded-3xl p-6">
            <Workflow className="mx-auto text-neutral-700 mb-4" size={32} />
            <h4 className="text-sm font-bold text-white">No diagrams found</h4>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto mt-1">
              {searchQuery ? "No matches for your search query." : "Generate your first layout map above and it will be stored here."}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View Layout */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredDiagrams.map(diagram => {
              const Icon = FORMAT_ICONS[diagram.format] || Workflow;
              const accentHex = diagram.theme === "cyber" ? "#06b6d4" : diagram.theme === "amber" ? "#f59e0b" : diagram.theme === "emerald" ? "#10b981" : "#525252";

              return (
                <motion.div
                  key={diagram._id}
                  onClick={() => onLoadDiagram(diagram)}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                  className="group cursor-pointer flex flex-col h-full bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden hover:border-white/10 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative"
                >
                  {/* Miniature SVG Preview Container */}
                  <div className="w-full aspect-video relative overflow-hidden bg-black">
                    <DiagramMiniPreview
                      nodes={diagram.nodes}
                      edges={diagram.edges}
                      theme={diagram.theme}
                      format={diagram.format}
                    />
                    
                    {/* Format Badge */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-black/60 border border-white/10 text-neutral-300">
                      <Icon size={10} style={{ color: accentHex }} /> {diagram.format}
                    </div>

                    {/* Delete Options Button */}
                    <button
                      onClick={e => handleDelete(diagram._id, e)}
                      className="absolute top-2.5 right-2.5 w-6 h-6 rounded-lg bg-black/60 border border-white/10 hover:border-red-500/30 hover:bg-red-500/10 flex items-center justify-center text-neutral-400 hover:text-red-400 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>

                  {/* Content details */}
                  <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold text-xs leading-snug text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                        {diagram.prompt}
                      </h4>
                      <p className="text-[9px] text-neutral-500 mt-1 font-mono uppercase">Model: {diagram.model}</p>
                    </div>

                    <div className="flex items-center justify-between mt-4 border-t border-white/[0.03] pt-2.5 text-[9px] text-neutral-500 font-bold uppercase">
                      <span className="flex items-center gap-1">
                        <User size={10} /> Mine
                      </span>
                      <span>{formatTimeAgo(diagram.createdAt)}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* List View Layout */
          <div className="flex flex-col gap-3">
            {filteredDiagrams.map(diagram => {
              const Icon = FORMAT_ICONS[diagram.format] || Workflow;
              const accentHex = diagram.theme === "cyber" ? "#06b6d4" : diagram.theme === "amber" ? "#f59e0b" : diagram.theme === "emerald" ? "#10b981" : "#525252";

              return (
                <motion.div
                  key={diagram._id}
                  onClick={() => onLoadDiagram(diagram)}
                  whileHover={{ x: 2 }}
                  className="group cursor-pointer flex items-center bg-white/[0.01] hover:bg-white/[0.02] border border-white/[0.04] hover:border-white/10 rounded-xl p-3 justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Small preview block */}
                    <div className="w-20 aspect-video rounded-lg overflow-hidden shrink-0 border border-white/5 bg-black">
                      <DiagramMiniPreview
                        nodes={diagram.nodes}
                        edges={diagram.edges}
                        theme={diagram.theme}
                        format={diagram.format}
                      />
                    </div>

                    {/* Metadata details */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <h4 className="font-semibold text-xs text-white group-hover:text-cyan-400 transition-colors truncate">
                        {diagram.prompt}
                      </h4>
                      <div className="flex items-center gap-2 text-[9px] text-neutral-500 uppercase font-bold">
                        <span className="flex items-center gap-1" style={{ color: accentHex }}>
                          <Icon size={10} /> {diagram.format}
                        </span>
                        <span className="w-0.5 h-0.5 rounded-full bg-neutral-800" />
                        <span>Model: {diagram.model}</span>
                        <span className="w-0.5 h-0.5 rounded-full bg-neutral-800" />
                        <span>{formatTimeAgo(diagram.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={e => handleDelete(diagram._id, e)}
                      className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/5 hover:border-red-500/30 hover:bg-red-500/10 flex items-center justify-center text-neutral-400 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={12} />
                    </button>
                    <div className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center text-neutral-500">
                      <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
