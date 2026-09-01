"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Download,
  Check,
  Loader2,
  ExternalLink,
  Layers,
  Sparkles,
  Server,
  Cloud,
  Layout,
  GitBranch,
  Users,
  Database,
  BarChart2,
  Box,
  CheckCircle2,
  X,
} from "lucide-react";
import { toast } from "sonner";

export interface ExcalidrawLibraryItem {
  id: string;
  name: string;
  author: string;
  authorUrl?: string;
  downloads: string;
  description: string;
  tags: string[];
  category: string;
  downloadUrl: string;
  itemsCount?: string;
}

export const CURATED_EXCALIDRAW_LIBRARIES: ExcalidrawLibraryItem[] = [
  {
    id: "software-architecture",
    name: "Software Architecture",
    author: "Youri Tjang",
    authorUrl: "https://github.com/youritjang",
    downloads: "201k+",
    description: "Core components: microservices, database, cache, event bus, API gateway, browser, mobile client.",
    tags: ["Microservices", "Database", "Cache", "Event Bus", "Browser"],
    category: "Architecture",
    downloadUrl: "https://libraries.excalidraw.com/libraries/youritjang/software-architecture.excalidrawlib",
  },
  {
    id: "system-design",
    name: "System Design Components",
    author: "Rohan Pithadiya",
    authorUrl: "https://github.com/Rohanpithadiya",
    downloads: "86k+",
    description: "Essential components for interview preparation and high-level distributed systems architecture.",
    tags: ["Distributed Systems", "Interviews", "Scalability", "Queues"],
    category: "System Design",
    downloadUrl: "https://libraries.excalidraw.com/libraries/rohanp/system-design.excalidrawlib",
  },
  {
    id: "architecture-diagram-components",
    name: "Architecture Diagram Components",
    author: "Anna Pastushko",
    authorUrl: "https://www.linkedin.com/in/annpastushko",
    downloads: "86k+",
    description: "Common architecture blocks: Slack, Docker, GitHub, VPC, Subnets, Users, Servers, Email.",
    tags: ["VPC", "Docker", "Subnets", "Servers", "GitHub"],
    category: "Architecture",
    downloadUrl: "https://libraries.excalidraw.com/libraries/anna-pastushko/architecture-diagram-components.excalidrawlib",
  },
  {
    id: "software-logos",
    name: "Software & Tech Logos",
    author: "drwnio.polyrand.net",
    authorUrl: "https://drwnio.polyrand.net/",
    downloads: "61k+",
    description: "Logos for Kubernetes, Docker, Postgres, Redis, Nginx, RabbitMQ, Load Balancers, Kafka.",
    tags: ["Kubernetes", "Postgres", "Redis", "Docker", "Nginx"],
    category: "Logos & Icons",
    downloadUrl: "https://libraries.excalidraw.com/libraries/drwnio/drwnio.excalidrawlib",
  },
  {
    id: "stick-figures",
    name: "Stick Figures & Personas",
    author: "Youri Tjang",
    authorUrl: "https://github.com/youritjang",
    downloads: "58k+",
    description: "Hand-drawn character figures: Stick man, Girl, Guy, Grandma, Child, Happy, Sad expressions.",
    tags: ["Characters", "Collaboration", "User Personas", "Emotions"],
    category: "People",
    downloadUrl: "https://libraries.excalidraw.com/libraries/youritjang/stick-figures.excalidrawlib",
  },
  {
    id: "aws-architecture-icons",
    name: "AWS Architecture Icons",
    author: "Anna Pastushko",
    authorUrl: "https://www.linkedin.com/in/annpastushko",
    downloads: "53k+",
    description: "Full AWS icons: Lambda, S3, EC2, CloudSearch, EMR, Kinesis, DynamoDB, Redshift, Glue.",
    tags: ["AWS", "Lambda", "S3", "DynamoDB", "Cloud"],
    category: "Cloud",
    downloadUrl: "https://libraries.excalidraw.com/libraries/childishgirl/aws-architecture-icons.excalidrawlib",
  },
  {
    id: "uml-er-diagrams",
    name: "Shapes for UML & ER Diagrams",
    author: "BjoernKW",
    authorUrl: "https://github.com/BjoernKW",
    downloads: "53k+",
    description: "Comprehensive opinionated shapes and connectors for UML class diagrams and ER database models.",
    tags: ["UML", "ER Diagrams", "Entities", "Relationships"],
    category: "UML & Diagrams",
    downloadUrl: "https://libraries.excalidraw.com/libraries/BjoernKW/UML-ER-library.excalidrawlib",
  },
  {
    id: "basic-ux-wireframing",
    name: "Basic UX / Wireframing Kit",
    author: "Gabriela Macakova",
    authorUrl: "http://www.macakova.com/",
    downloads: "33k+",
    description: "Buttons, text fields, checkboxes, dropdowns, toggles, profile photos, mobile UI placeholders.",
    tags: ["Wireframing", "UI Kit", "Buttons", "Inputs", "Mobile"],
    category: "UI & Wireframes",
    downloadUrl: "https://libraries.excalidraw.com/libraries/gabrielamacakova/basic-ux-wireframing-elements.excalidrawlib",
  },
  {
    id: "data-viz",
    name: "Data Visualization & Charts",
    author: "dbs-sticky",
    authorUrl: "https://twitter.com/dbs_sticky",
    downloads: "40k+",
    description: "Collection of hand-drawn charts: bar charts, line plots, pie charts, scatter plots, and metrics.",
    tags: ["Charts", "Graphs", "Data Viz", "Analytics"],
    category: "Charts & Data",
    downloadUrl: "https://libraries.excalidraw.com/libraries/dbssticky/data-viz.excalidrawlib",
  },
  {
    id: "cloud-artifacts",
    name: "Cloud Design & Multi-Cloud",
    author: "Rafael Franzke",
    authorUrl: "https://twitter.com/rafaelfranzke",
    downloads: "33k+",
    description: "Multi-cloud icons: Kubernetes, Gardener, AWS, Azure, GCP, and architectural patterns.",
    tags: ["Kubernetes", "AWS", "Azure", "GCP", "Cloud"],
    category: "Cloud",
    downloadUrl: "https://libraries.excalidraw.com/libraries/cloud/cloud.excalidrawlib",
  },
  {
    id: "decision-flow-control",
    name: "Decision Flow & Flowcharts",
    author: "James Wiens",
    authorUrl: "https://github.com/aretecode",
    downloads: "31k+",
    description: "Yes/no decision diamonds, branching gates, and conditional workflow diagram components.",
    tags: ["Flowcharts", "Logic", "Decision", "Workflow"],
    category: "Flowcharts",
    downloadUrl: "https://libraries.excalidraw.com/libraries/aretecode/decision-flow-control.excalidrawlib",
  },
  {
    id: "google-cloud-icons",
    name: "Google Cloud & Workspace Icons",
    author: "Marcus Guidoti",
    authorUrl: "https://github.com/mguidoti",
    downloads: "29k+",
    description: "GCP architecture icons: Anthos, API Gateway, BigQuery, Compute Engine, GKE, Cloud Functions.",
    tags: ["GCP", "Google Cloud", "BigQuery", "GKE"],
    category: "Cloud",
    downloadUrl: "https://libraries.excalidraw.com/libraries/mguidoti/google-icons.excalidrawlib",
  },
  {
    id: "dev-ops-icons",
    name: "DevOps & CI/CD Tooling",
    author: "Mark Sharpley",
    authorUrl: "https://www.marksharpley.co.uk/",
    downloads: "23k+",
    description: "HashiCorp stack (Terraform, Vault, Nomad), Ansible, Jira, Prometheus, Grafana, GitHub Actions.",
    tags: ["Terraform", "Vault", "Ansible", "CI/CD", "DevOps"],
    category: "Cloud",
    downloadUrl: "https://libraries.excalidraw.com/libraries/markopolo123/dev_ops.excalidrawlib",
  },
  {
    id: "network-topology",
    name: "Network Topology Icons",
    author: "David Luzar",
    authorUrl: "https://twitter.com/dluzar",
    downloads: "22k+",
    description: "Network devices: Routers, Firewalls, Switches, VPNs, Hubs, Servers, Clients, 3D Computers.",
    tags: ["Networking", "Firewall", "Router", "Switch", "VPN"],
    category: "Architecture",
    downloadUrl: "https://libraries.excalidraw.com/libraries/dwelle/network-topology-icons.excalidrawlib",
  },
  {
    id: "database-infrastructure",
    name: "Database & Storage Systems",
    author: "Stefan Oehrli",
    authorUrl: "https://github.com/oehrlis",
    downloads: "21k+",
    description: "Database topologies: Relational DBs, Clusters, Replication, Backup & Recovery, Storage nodes.",
    tags: ["Database", "SQL", "Storage", "Replication", "Clusters"],
    category: "Architecture",
    downloadUrl: "https://libraries.excalidraw.com/libraries/oehrlis/db-eng.excalidrawlib",
  },
  {
    id: "c4-architecture",
    name: "C4 Architecture Model",
    author: "Dmitry Burnyshev",
    downloads: "3k+",
    description: "Simon Brown's C4 model concepts: Person, Web App, Mobile App, Component, System, Database.",
    tags: ["C4 Model", "Context", "Containers", "Components"],
    category: "Architecture",
    downloadUrl: "https://libraries.excalidraw.com/libraries/dmitry-burnyshev/c4-architecture.excalidrawlib",
  },
  {
    id: "kubernetes-icons-set",
    name: "Kubernetes Resource Icons",
    author: "Florian Dambrine",
    authorUrl: "https://floriandambrine.com/",
    downloads: "3k+",
    description: "Standardized K8s resources: Pod, Service, Ingress, Deployment, ConfigMap, Secret, PVC, HPA.",
    tags: ["Kubernetes", "Pods", "Deployments", "Ingress", "K8s"],
    category: "Cloud",
    downloadUrl: "https://libraries.excalidraw.com/libraries/lowess/kubernetes-icons-set.excalidrawlib",
  },
  {
    id: "atlassian-suite",
    name: "Atlassian Product Suite",
    author: "Jatin K Malik",
    authorUrl: "https://j47.in/",
    downloads: "1k+",
    description: "Logos for Jira, Confluence, Bitbucket, Trello, JSM, and Atlassian Rovo.",
    tags: ["Jira", "Confluence", "Trello", "Bitbucket", "Agile"],
    category: "Logos & Icons",
    downloadUrl: "https://libraries.excalidraw.com/libraries/jatinkrmalik/atlassian-product-suite.excalidrawlib",
  },
];

const CATEGORY_META: Record<string, { icon: any; color: string }> = {
  All: { icon: Box, color: "text-violet-400" },
  Architecture: { icon: Server, color: "text-indigo-400" },
  "System Design": { icon: Layers, color: "text-emerald-400" },
  Cloud: { icon: Cloud, color: "text-sky-400" },
  "UML & Diagrams": { icon: GitBranch, color: "text-amber-400" },
  "UI & Wireframes": { icon: Layout, color: "text-rose-400" },
  "Charts & Data": { icon: BarChart2, color: "text-teal-400" },
  Flowcharts: { icon: GitBranch, color: "text-orange-400" },
  "Logos & Icons": { icon: Sparkles, color: "text-purple-400" },
  People: { icon: Users, color: "text-yellow-400" },
};

const CATEGORIES = [
  "All",
  "Architecture",
  "System Design",
  "Cloud",
  "UML & Diagrams",
  "UI & Wireframes",
  "Charts & Data",
  "Flowcharts",
  "Logos & Icons",
  "People",
];

export interface LibrariesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportLibrary: (url: string, name: string) => Promise<boolean>;
}

export function LibrariesModal({ isOpen, onClose, onImportLibrary }: LibrariesModalProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [installedMap, setInstalledMap] = useState<Record<string, boolean>>({});
  const [isInstallingBundle, setIsInstallingBundle] = useState(false);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: CURATED_EXCALIDRAW_LIBRARIES.length };
    CURATED_EXCALIDRAW_LIBRARIES.forEach((lib) => {
      counts[lib.category] = (counts[lib.category] || 0) + 1;
    });
    return counts;
  }, []);

  const filteredLibraries = useMemo(() => {
    return CURATED_EXCALIDRAW_LIBRARIES.filter((lib) => {
      const matchesCategory =
        selectedCategory === "All" || lib.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!search.trim()) return true;

      const q = search.toLowerCase();
      const nameMatch = lib.name.toLowerCase().includes(q);
      const descMatch = lib.description.toLowerCase().includes(q);
      const tagMatch = lib.tags.some((t) => t.toLowerCase().includes(q));
      const authorMatch = lib.author.toLowerCase().includes(q);

      return nameMatch || descMatch || tagMatch || authorMatch;
    });
  }, [search, selectedCategory]);

  const handleInstall = async (lib: ExcalidrawLibraryItem) => {
    try {
      setInstallingId(lib.id);
      const success = await onImportLibrary(lib.downloadUrl, lib.name);
      if (success) {
        setInstalledMap((prev) => ({ ...prev, [lib.id]: true }));
        toast.success(`Installed "${lib.name}" into your Whiteboard Library!`);
      } else {
        toast.error(`Failed to install "${lib.name}". Please try direct download.`);
      }
    } catch {
      toast.error(`Failed to install "${lib.name}"`);
    } finally {
      setInstallingId(null);
    }
  };

  const handleInstallEssentialsBundle = async () => {
    const bundleIds = ["software-architecture", "system-design", "software-logos", "aws-architecture-icons"];
    const bundleLibs = CURATED_EXCALIDRAW_LIBRARIES.filter(l => bundleIds.includes(l.id));
    
    setIsInstallingBundle(true);
    toast.info("Installing 4 Essential Component Packs into your Whiteboard...");

    let installedCount = 0;
    for (const lib of bundleLibs) {
      try {
        setInstallingId(lib.id);
        const success = await onImportLibrary(lib.downloadUrl, lib.name);
        if (success) {
          setInstalledMap(prev => ({ ...prev, [lib.id]: true }));
          installedCount++;
        }
      } catch (err) {
        console.error("Bundle item error:", err);
      }
    }

    setIsInstallingBundle(false);
    setInstallingId(null);
    if (installedCount > 0) {
      toast.success(`Successfully added ${installedCount} essential libraries to your workspace!`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[170] flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 font-sans">
      <div className="w-full max-w-5xl max-h-[92dvh] bg-[#0c0c0e] border border-white/[0.09] rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_50px_rgba(139,92,246,0.12)] flex flex-col overflow-hidden">
        {/* ─── Header ─────────────────────────────────────────────── */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-[#0e0e12]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/30">
              <Layers size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Excalidraw Libraries Hub
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  {CURATED_EXCALIDRAW_LIBRARIES.length} Curated Packs
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 hidden xs:block">
                1-click install official architectural, system design, cloud & UI vector kits
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* ─── Search & Category Filters Bar ──────────────────────── */}
        <div className="p-3.5 sm:p-4 border-b border-white/[0.06] space-y-3 bg-[#0a0a0c] shrink-0">
          {/* Top Row: Search & Quick Bundle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
              <input
                type="text"
                placeholder="Search by component, tech or tag (e.g. AWS, Microservices, Kubernetes, Redis, UML)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#131317] hover:bg-[#16161b] focus:bg-[#16161b] border border-white/[0.08] focus:border-violet-500/50 rounded-2xl pl-10 pr-9 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none transition-all shadow-inner"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick 1-Click Essentials Bundle Button */}
            <button
              onClick={handleInstallEssentialsBundle}
              disabled={isInstallingBundle}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-violet-600/25 transition-all active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
            >
              {isInstallingBundle ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Installing 4 Essentials...</span>
                </>
              ) : (
                <>
                  <Sparkles size={13} className="text-amber-300 animate-pulse" />
                  <span>Install 4 Top Essentials</span>
                </>
              )}
            </button>
          </div>

          {/* Category Tabs with Dynamic Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {CATEGORIES.map((cat) => {
              const count = categoryCounts[cat] || 0;
              const isSelected = selectedCategory === cat;
              const meta = CATEGORY_META[cat];
              const Icon = meta?.icon || Box;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer text-xs ${
                    isSelected
                      ? "bg-violet-600 text-white shadow-md shadow-violet-600/30 font-bold"
                      : "bg-white/[0.04] text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.08]"
                  }`}
                >
                  <Icon size={12} className={isSelected ? "text-white" : meta?.color || "text-neutral-400"} />
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-white/[0.05] text-neutral-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Libraries Grid ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3 bg-[#08080a]">
          {filteredLibraries.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <Box size={36} className="text-neutral-600 mb-2" />
              <p className="text-sm font-bold text-neutral-300">No component packs found</p>
              <p className="text-xs text-neutral-500 mt-1">Try another search keyword or switch category filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredLibraries.map((lib) => {
                const isInstalling = installingId === lib.id;
                const isInstalled = !!installedMap[lib.id];
                const meta = CATEGORY_META[lib.category];
                const CatIcon = meta?.icon || Box;

                return (
                  <div
                    key={lib.id}
                    className="p-4 sm:p-5 rounded-2xl bg-[#111115] hover:bg-[#141419] border border-white/[0.07] hover:border-violet-500/40 transition-all flex flex-col justify-between group shadow-sm hover:shadow-[0_8px_25px_rgba(139,92,246,0.12)] space-y-3.5"
                  >
                    <div className="space-y-2">
                      {/* Top Row: Category badge & Downloads */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/[0.05] text-neutral-300 border border-white/[0.06]">
                          <CatIcon size={10} className={meta?.color || "text-violet-400"} />
                          <span>{lib.category}</span>
                        </span>

                        <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.04] text-neutral-400 border border-white/[0.06] shrink-0 flex items-center gap-1">
                          <span>⬇️</span>
                          <span className="font-mono">{lib.downloads}</span>
                        </span>
                      </div>

                      {/* Title & Author */}
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors">
                          {lib.name}
                        </h3>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          by{" "}
                          {lib.authorUrl ? (
                            <a
                              href={lib.authorUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-violet-400 hover:underline inline-flex items-center gap-0.5 font-medium"
                            >
                              {lib.author}
                              <ExternalLink size={9} />
                            </a>
                          ) : (
                            <span className="text-neutral-300 font-medium">{lib.author}</span>
                          )}
                        </p>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
                        {lib.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {lib.tags.slice(0, 5).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/[0.03] text-neutral-400 border border-white/[0.05]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between gap-2">
                      <a
                        href={lib.downloadUrl}
                        download
                        className="text-[11px] font-medium text-neutral-400 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-white/[0.05]"
                        title="Download .excalidrawlib file"
                      >
                        <Download size={12} />
                        <span>.excalidrawlib</span>
                      </a>

                      <button
                        onClick={() => handleInstall(lib)}
                        disabled={isInstalling || isInstallingBundle}
                        className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                          isInstalled
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-violet-600/30 active:scale-95"
                        }`}
                      >
                        {isInstalling ? (
                          <>
                            <Loader2 size={12} className="animate-spin" />
                            <span>Adding to Canvas...</span>
                          </>
                        ) : isInstalled ? (
                          <>
                            <CheckCircle2 size={12} className="text-emerald-400" />
                            <span>In Whiteboard</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={12} />
                            <span>Add to Canvas</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── Footer ─────────────────────────────────────────────── */}
        <div className="p-3.5 px-5 bg-[#0e0e12] border-t border-white/[0.08] flex items-center justify-between text-xs text-neutral-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>All component libraries are open-source under the MIT License.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
