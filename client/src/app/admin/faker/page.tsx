"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Users, UserPlus, FileText, CheckCircle2, 
  PlayCircle, Crown, Copy, Trash2, Globe, 
  CreditCard, MapPin, RefreshCw, Sparkles, 
  DollarSign, Calendar, Layers, ShieldCheck,
  AlertTriangle, ArrowRight, Check, X, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/config/api";
import { cn } from "@/lib/utils";

// ── LOCATION PRESETS (40+ REAL WORLD CITIES) ─────────────────────────────────
const LOCATION_PRESETS = [
  { label: "New York, USA", city: "New York", country: "United States", lat: 40.7128, lng: -74.0060 },
  { label: "San Francisco, USA", city: "San Francisco", country: "United States", lat: 37.7749, lng: -122.4194 },
  { label: "Los Angeles, USA", city: "Los Angeles", country: "United States", lat: 34.0522, lng: -118.2437 },
  { label: "Austin, USA", city: "Austin", country: "United States", lat: 30.2672, lng: -97.7431 },
  { label: "Chicago, USA", city: "Chicago", country: "United States", lat: 41.8781, lng: -87.6298 },
  { label: "Seattle, USA", city: "Seattle", country: "United States", lat: 47.6062, lng: -122.3321 },
  { label: "Toronto, Canada", city: "Toronto", country: "Canada", lat: 43.6532, lng: -79.3832 },
  { label: "Vancouver, Canada", city: "Vancouver", country: "Canada", lat: 49.2827, lng: -123.1207 },
  { label: "London, UK", city: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278 },
  { label: "Paris, France", city: "Paris", country: "France", lat: 48.8566, lng: 2.3522 },
  { label: "Berlin, Germany", city: "Berlin", country: "Germany", lat: 52.5200, lng: 13.4050 },
  { label: "Amsterdam, Netherlands", city: "Amsterdam", country: "Netherlands", lat: 52.3676, lng: 4.9041 },
  { label: "Madrid, Spain", city: "Madrid", country: "Spain", lat: 40.4168, lng: -3.7038 },
  { label: "Zurich, Switzerland", city: "Zurich", country: "Switzerland", lat: 47.3769, lng: 8.5417 },
  { label: "Dublin, Ireland", city: "Dublin", country: "Ireland", lat: 53.3498, lng: -6.2603 },
  { label: "Stockholm, Sweden", city: "Stockholm", country: "Sweden", lat: 59.3293, lng: 18.0686 },
  { label: "Tokyo, Japan", city: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
  { label: "Singapore", city: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198 },
  { label: "Seoul, South Korea", city: "Seoul", country: "South Korea", lat: 37.5665, lng: 126.9780 },
  { label: "Mumbai, India", city: "Mumbai", country: "India", lat: 19.0760, lng: 72.8777 },
  { label: "Bengaluru, India", city: "Bengaluru", country: "India", lat: 12.9716, lng: 77.5946 },
  { label: "Delhi, India", city: "Delhi", country: "India", lat: 28.6139, lng: 77.2090 },
  { label: "Dubai, UAE", city: "Dubai", country: "United Arab Emirates", lat: 25.2048, lng: 55.2708 },
  { label: "Sydney, Australia", city: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093 },
  { label: "Melbourne, Australia", city: "Melbourne", country: "Australia", lat: -37.8136, lng: 144.9631 },
  { label: "São Paulo, Brazil", city: "São Paulo", country: "Brazil", lat: -23.5505, lng: -46.6333 },
  { label: "Buenos Aires, Argentina", city: "Buenos Aires", country: "Argentina", lat: -34.6037, lng: -58.3816 },
  { label: "Cape Town, South Africa", city: "Cape Town", country: "South Africa", lat: -33.9249, lng: 18.4241 }
];

const PLAN_RATES: Record<string, { name: string; monthly: number; yearly: number }> = {
  scholar: { name: "Scholar", monthly: 4.99, yearly: 49 },
  pro:     { name: "Pro Scholar", monthly: 9.99, yearly: 89 },
  power:   { name: "Power Scholar", monthly: 19.99, yearly: 179 },
};

const RANDOM_NAMES = [
  "Sophia Martinez", "Liam Chen", "Emma Dubois", "Noah Schmidt",
  "Olivia Rossi", "Alexander Kim", "Maya Patel", "Lucas Müller",
  "Isabella Tanaka", "Ethan Al-Mansoor", "Aria Takahashi", "Gabriel Santos",
  "Elena Rostova", "Daniel O'Connor", "Chloe Laurent", "Marcus Vance"
];

export default function FakerStudio() {
  const [activeTab, setActiveTab] = useState<"create" | "batch" | "manage" | "notes">("create");
  const [fakeUsers, setFakeUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  // ── 1. SINGLE USER CREATOR STATE ──────────────────────────────────────────
  const [singleForm, setSingleForm] = useState({
    name: "",
    email: "",
    username: "",
    locationPreset: "New York, USA",
    city: "New York",
    country: "United States",
    latitude: 40.7128,
    longitude: -74.0060,
    useCustomCoords: false,
    isPaid: true,
    planId: "pro",
    billingPeriod: "monthly",
    paymentMethod: "paypal",
    amount: 9.99,
    daysAgo: 0,
    tokens: 1500,
    xp: 250,
  });

  // ── 2. BATCH GENERATOR STATE ──────────────────────────────────────────────
  const [batchForm, setBatchForm] = useState({
    count: 10,
    paidRatio: 40,
    spreadDays: 7,
  });

  // ── 3. USER MANAGEMENT STATE (SUBSCRIPTION & TRANSACTION INJECTION) ───────
  const [manageSubForm, setManageSubForm] = useState({
    planId: "pro",
    billingPeriod: "monthly",
    isActive: true,
    createTransaction: true,
    paymentMethod: "paypal",
    amount: 9.99
  });

  const [injectTxForm, setInjectTxForm] = useState({
    amount: 19.99,
    packageName: "Power Scholar (Monthly)",
    packageId: "power",
    billingPeriod: "monthly",
    paymentMethod: "paypal",
    status: "success",
  });

  // ── 4. NOTE INJECTION STATE ───────────────────────────────────────────────
  const [noteForm, setNoteForm] = useState({
    videoUrl: "",
    title: "",
    type: "free",
    detailLevel: "Standard",
    content: "<h1>Start typing here...</h1>"
  });
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [promptLoading, setPromptLoading] = useState(false);

  // Fetch Users
  const fetchFakeUsers = useCallback(async () => {
    try {
      const res = await api.get("/admin/faker/users");
      if (res.data.success) {
        setFakeUsers(res.data.data);
        if (res.data.data.length > 0 && !selectedUser) {
          setSelectedUser(res.data.data[0]);
        }
      }
    } catch (e) {
      console.error("Fetch fake users error", e);
    }
  }, [selectedUser]);

  useEffect(() => {
    fetchFakeUsers();
  }, [fetchFakeUsers]);

  // Sync selected user into manage sub form
  useEffect(() => {
    if (selectedUser) {
      const currentPlan = selectedUser.membership?.planId || "pro";
      const currentBilling = selectedUser.membership?.billingPeriod || "monthly";
      const preset = PLAN_RATES[currentPlan] || PLAN_RATES.pro;
      setManageSubForm({
        planId: currentPlan,
        billingPeriod: currentBilling,
        isActive: Boolean(selectedUser.membership?.isActive),
        createTransaction: true,
        paymentMethod: "paypal",
        amount: currentBilling === "yearly" ? preset.yearly : preset.monthly
      });
    }
  }, [selectedUser]);

  // Filter fake users by search
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return fakeUsers;
    const q = userSearch.toLowerCase();
    return fakeUsers.filter(u => 
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.location?.city?.toLowerCase().includes(q) ||
      u.location?.country?.toLowerCase().includes(q)
    );
  }, [fakeUsers, userSearch]);

  const paidFakerCount = useMemo(() => {
    return fakeUsers.filter(u => u.membership?.isActive).length;
  }, [fakeUsers]);

  // Randomize single name
  const handleRandomizeName = () => {
    const pick = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    const username = pick.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 89 + 10);
    setSingleForm(prev => ({
      ...prev,
      name: pick,
      username,
      email: `${username}@gmail.com`
    }));
  };

  // Location preset change
  const handleLocationPresetChange = (label: string) => {
    const found = LOCATION_PRESETS.find(p => p.label === label);
    if (found) {
      setSingleForm(prev => ({
        ...prev,
        locationPreset: label,
        city: found.city,
        country: found.country,
        latitude: found.lat,
        longitude: found.lng,
      }));
    }
  };

  // Plan or billing change in single form updates amount automatically
  const handleSinglePlanChange = (planId: string, billingPeriod?: string) => {
    const billing = billingPeriod || singleForm.billingPeriod;
    const rate = PLAN_RATES[planId] || PLAN_RATES.pro;
    const amt = billing === "yearly" ? rate.yearly : rate.monthly;
    setSingleForm(prev => ({
      ...prev,
      planId,
      billingPeriod: billing,
      amount: amt
    }));
  };

  // ── SUBMIT: CREATE DETAILED USER ──────────────────────────────────────────
  const handleCreateDetailedUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleForm.name.trim()) return toast.error("Please enter a user name");

    setLoading(true);
    try {
      const createdAt = new Date(Date.now() - singleForm.daysAgo * 24 * 60 * 60 * 1000);
      const res = await api.post("/admin/faker/users/create-detailed", {
        name: singleForm.name.trim(),
        email: singleForm.email.trim() || undefined,
        username: singleForm.username.trim() || undefined,
        location: {
          city: singleForm.city,
          country: singleForm.country,
          latitude: Number(singleForm.latitude),
          longitude: Number(singleForm.longitude)
        },
        membership: {
          isActive: singleForm.isPaid,
          planId: singleForm.planId,
          planName: PLAN_RATES[singleForm.planId]?.name || "Pro",
          billingPeriod: singleForm.billingPeriod
        },
        payment: {
          createTransaction: singleForm.isPaid,
          amount: Number(singleForm.amount),
          paymentMethod: singleForm.paymentMethod,
          status: "success"
        },
        tokens: singleForm.tokens,
        xp: singleForm.xp,
        createdAt
      });

      toast.success(res.data.message || "User created successfully!");
      fetchFakeUsers();
      // Reset form with new random name
      handleRandomizeName();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  // ── SUBMIT: BATCH GENERATE ────────────────────────────────────────────────
  const handleBatchGenerate = async () => {
    setLoading(true);
    try {
      const res = await api.post("/admin/faker/users/batch-generate", {
        count: batchForm.count,
        paidRatio: batchForm.paidRatio / 100,
        spreadDays: batchForm.spreadDays
      });
      toast.success(res.data.message);
      fetchFakeUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Batch generation failed");
    } finally {
      setLoading(false);
    }
  };

  // ── SUBMIT: ALLOCATE SUBSCRIPTION ─────────────────────────────────────────
  const handleAllocateSubscription = async () => {
    if (!selectedUser) return toast.error("Select a user first");
    setLoading(true);
    try {
      const res = await api.post("/admin/faker/users/allocate-subscription", {
        userId: selectedUser._id,
        planId: manageSubForm.planId,
        billingPeriod: manageSubForm.billingPeriod,
        isActive: manageSubForm.isActive,
        createTransaction: manageSubForm.createTransaction,
        amount: Number(manageSubForm.amount),
        paymentMethod: manageSubForm.paymentMethod
      });
      toast.success(res.data.message);
      fetchFakeUsers();
      setSelectedUser(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Subscription allocation failed");
    } finally {
      setLoading(false);
    }
  };

  // ── SUBMIT: INJECT CUSTOM TRANSACTION ─────────────────────────────────────
  const handleInjectTransaction = async () => {
    if (!selectedUser) return toast.error("Select a user first");
    setLoading(true);
    try {
      const res = await api.post("/admin/faker/users/inject-transaction", {
        userId: selectedUser._id,
        amount: Number(injectTxForm.amount),
        packageName: injectTxForm.packageName,
        packageId: injectTxForm.packageId,
        billingPeriod: injectTxForm.billingPeriod,
        paymentMethod: injectTxForm.paymentMethod,
        status: injectTxForm.status,
      });
      toast.success(res.data.message);
      fetchFakeUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Transaction injection failed");
    } finally {
      setLoading(false);
    }
  };

  // ── DELETE SINGLE USER ────────────────────────────────────────────────────
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Delete fake user "${userName}" and remove their records?`)) return;
    setLoading(true);
    try {
      await api.delete(`/admin/faker/users/${userId}`);
      toast.success(`Deleted user "${userName}"`);
      if (selectedUser?._id === userId) setSelectedUser(null);
      fetchFakeUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  // ── PURGE ALL FAKE USERS ──────────────────────────────────────────────────
  const handlePurgeAll = async () => {
    if (!confirm(`⚠️ ARE YOU SURE? This will permanently delete ALL ${fakeUsers.length} faker accounts and their transactions.`)) return;
    setLoading(true);
    try {
      const res = await api.delete("/admin/faker/users/purge");
      toast.success(res.data.message);
      setSelectedUser(null);
      fetchFakeUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to purge fake users");
    } finally {
      setLoading(false);
    }
  };

  // ── NOTE EXTRACTION & INJECTION ───────────────────────────────────────────
  const handleExtractPrompt = async () => {
    if (!noteForm.videoUrl) return toast.error("Enter YouTube URL First");
    setPromptLoading(true);
    try {
      const res = await api.post("/admin/faker/prompt", { videoUrl: noteForm.videoUrl });
      setGeneratedPrompt(res.data.prompt);
      setNoteForm(prev => ({ ...prev, title: res.data.title }));
      toast.success("AI Prompt generated from video!");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Prompt retrieval failed");
    } finally {
      setPromptLoading(false);
    }
  };

  const handleDeployNote = async () => {
    if (!selectedUser) return toast.error("Select an author user from the left list");
    if (!noteForm.videoUrl || !noteForm.content) return toast.error("Fill required note fields");
    setLoading(true);
    try {
      await api.post("/admin/faker/inject", {
        userId: selectedUser._id,
        data: noteForm
      });
      toast.success("Note deployed under user's profile!");
      setNoteForm(prev => ({ ...prev, title: "", videoUrl: "", content: "" }));
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Note deployment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* ── TOP HEADER ──────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800/60 border border-zinc-700/60 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Entity Simulation Studio
            </span>
            <span className="text-[11px] font-mono text-zinc-500">
              {fakeUsers.length} Simulated Accounts ({paidFakerCount} Paid)
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-sans">
            Faker & Growth Simulator
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Create realistic user personas with real global coordinates, payments, subscriptions, and activity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchFakeUsers}
            disabled={loading}
            className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs gap-1.5"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Sync</span>
          </Button>

          {fakeUsers.length > 0 && (
            <Button
              size="sm"
              variant="destructive"
              onClick={handlePurgeAll}
              disabled={loading}
              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs gap-1.5"
            >
              <Trash2 size={13} />
              <span>Purge All Faker Data</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── MAIN 2-COLUMN STUDIO LAYOUT ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ── LEFT COLUMN (4 COLS): FAKER USERS DIRECTORY ───────────────── */}
        <div className="lg:col-span-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md p-4 flex flex-col h-[740px]">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-zinc-800">
            <div>
              <h3 className="text-xs font-semibold text-white tracking-tight flex items-center gap-2">
                <Users size={14} className="text-indigo-400" />
                Simulated Users ({filteredUsers.length})
              </h3>
              <p className="text-[10px] text-zinc-400 mt-0.5">Click to inspect or allocate payments</p>
            </div>
            <Button
              size="sm"
              onClick={() => setActiveTab("create")}
              className="h-7 px-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-medium gap-1"
            >
              <UserPlus size={12} />
              <span>New</span>
            </Button>
          </div>

          {/* Search Filter */}
          <div className="relative mb-3">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <Input
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              placeholder="Search by name, email, city..."
              className="h-8 pl-8 text-xs bg-zinc-950/60 border-zinc-800 text-zinc-200 placeholder:text-zinc-500"
            />
          </div>

          {/* User List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => {
                const isSelected = selectedUser?._id === user._id;
                const isPaid = user.membership?.isActive;
                const planId = user.membership?.planId || "pro";

                return (
                  <div
                    key={user._id}
                    onClick={() => {
                      setSelectedUser(user);
                      if (activeTab === "create") setActiveTab("manage");
                    }}
                    className={cn(
                      "p-2.5 rounded-xl border text-left cursor-pointer transition-all duration-200 flex items-center justify-between group",
                      isSelected
                        ? "bg-indigo-950/20 border-indigo-500/40 shadow-sm"
                        : "bg-zinc-950/40 border-zinc-800/70 hover:bg-zinc-800/40 hover:border-zinc-700"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar className="h-8 w-8 rounded-lg border border-zinc-700/60 flex-shrink-0">
                        <AvatarImage src={user.picture} />
                        <AvatarFallback className="bg-zinc-800 text-zinc-200 text-xs font-bold">
                          {user.name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                            {user.name}
                          </p>
                          {isPaid ? (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
                              {planId}
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-medium">
                              free
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                          {user.location?.city ? `${user.location.city}, ${user.location.country}` : user.email}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteUser(user._id, user.name);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 transition-all rounded hover:bg-zinc-800"
                      title="Delete fake user"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                No simulated users found
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN (8 COLS): TABBED WORKSPACES ───────────────────── */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Studio Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("create")}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap",
                activeTab === "create"
                  ? "bg-indigo-600 text-white shadow-sm font-semibold"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              )}
            >
              <UserPlus size={14} />
              <span>Single User Creator</span>
            </button>

            <button
              onClick={() => setActiveTab("batch")}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap",
                activeTab === "batch"
                  ? "bg-indigo-600 text-white shadow-sm font-semibold"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              )}
            >
              <Sparkles size={14} />
              <span>Batch Platform Seeder</span>
            </button>

            <button
              onClick={() => setActiveTab("manage")}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap",
                activeTab === "manage"
                  ? "bg-indigo-600 text-white shadow-sm font-semibold"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              )}
            >
              <CreditCard size={14} />
              <span>User & Subscriptions</span>
            </button>

            <button
              onClick={() => setActiveTab("notes")}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap",
                activeTab === "notes"
                  ? "bg-indigo-600 text-white shadow-sm font-semibold"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              )}
            >
              <FileText size={14} />
              <span>Content Deployer</span>
            </button>
          </div>

          {/* ── TAB 1: SINGLE USER & TRANSACTION CREATOR ────────────────── */}
          {activeTab === "create" && (
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                    <UserPlus size={16} className="text-indigo-400" />
                    Create Realistic User Entity
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Deploy an individual user with custom or preset coordinates, active subscription, and real payment logs.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRandomizeName}
                  className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white text-xs gap-1.5"
                >
                  <Sparkles size={12} className="text-indigo-400" />
                  <span>Randomize Name</span>
                </Button>
              </div>

              <form onSubmit={handleCreateDetailedUser} className="space-y-6">
                {/* 1. Personal Identity */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                    1. Account Identity
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-zinc-400">Full Name *</label>
                      <Input
                        value={singleForm.name}
                        onChange={e => setSingleForm({ ...singleForm, name: e.target.value })}
                        placeholder="e.g. Liam Chen"
                        className="bg-zinc-950/60 border-zinc-800 text-xs text-white"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-zinc-400">Email Address</label>
                      <Input
                        value={singleForm.email}
                        onChange={e => setSingleForm({ ...singleForm, email: e.target.value })}
                        placeholder="liam.chen@gmail.com"
                        className="bg-zinc-950/60 border-zinc-800 text-xs text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-zinc-400">Username</label>
                      <Input
                        value={singleForm.username}
                        onChange={e => setSingleForm({ ...singleForm, username: e.target.value })}
                        placeholder="liamchen42"
                        className="bg-zinc-950/60 border-zinc-800 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Geo-Location (For World Map) */}
                <div className="space-y-3 border-t border-zinc-800/80 pt-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                      <MapPin size={12} className="text-emerald-400" />
                      2. Global Location (Plots on World Map)
                    </h4>
                    <button
                      type="button"
                      onClick={() => setSingleForm(p => ({ ...p, useCustomCoords: !p.useCustomCoords }))}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      {singleForm.useCustomCoords ? "Use Preset Cities" : "Custom Coordinates"}
                    </button>
                  </div>

                  {!singleForm.useCustomCoords ? (
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-zinc-400">Select Global City</label>
                      <Select
                        value={singleForm.locationPreset}
                        onValueChange={handleLocationPresetChange}
                      >
                        <SelectTrigger className="bg-zinc-950/60 border-zinc-800 text-xs text-white">
                          <SelectValue placeholder="Select city..." />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white max-h-56">
                          {LOCATION_PRESETS.map(p => (
                            <SelectItem key={p.label} value={p.label} className="text-xs">
                              {p.label} ({p.lat.toFixed(2)}, {p.lng.toFixed(2)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-zinc-500 font-mono">
                        Coordinates: Lat {singleForm.latitude.toFixed(4)}, Lng {singleForm.longitude.toFixed(4)}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] text-zinc-400">City</label>
                        <Input
                          value={singleForm.city}
                          onChange={e => setSingleForm({ ...singleForm, city: e.target.value })}
                          className="bg-zinc-950/60 border-zinc-800 text-xs text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] text-zinc-400">Country</label>
                        <Input
                          value={singleForm.country}
                          onChange={e => setSingleForm({ ...singleForm, country: e.target.value })}
                          className="bg-zinc-950/60 border-zinc-800 text-xs text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] text-zinc-400">Latitude</label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={singleForm.latitude}
                          onChange={e => setSingleForm({ ...singleForm, latitude: Number(e.target.value) })}
                          className="bg-zinc-950/60 border-zinc-800 text-xs text-white font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] text-zinc-400">Longitude</label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={singleForm.longitude}
                          onChange={e => setSingleForm({ ...singleForm, longitude: Number(e.target.value) })}
                          className="bg-zinc-950/60 border-zinc-800 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Subscription & Payment Allocation */}
                <div className="space-y-3 border-t border-zinc-800/80 pt-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                      <CreditCard size={12} className="text-indigo-400" />
                      3. Membership & Real Payment Injection
                    </h4>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSingleForm(p => ({ ...p, isPaid: !p.isPaid }))}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all",
                          singleForm.isPaid
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                        )}
                      >
                        {singleForm.isPaid ? "Paid Subscription (Active)" : "Free Tier User"}
                      </button>
                    </div>
                  </div>

                  {singleForm.isPaid && (
                    <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[11px] text-zinc-400">Plan</label>
                          <Select
                            value={singleForm.planId}
                            onValueChange={v => handleSinglePlanChange(v)}
                          >
                            <SelectTrigger className="bg-zinc-900 border-zinc-800 text-xs text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                              <SelectItem value="scholar">Scholar ($4.99/mo)</SelectItem>
                              <SelectItem value="pro">Pro Scholar ($9.99/mo)</SelectItem>
                              <SelectItem value="power">Power Scholar ($19.99/mo)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] text-zinc-400">Billing Period</label>
                          <Select
                            value={singleForm.billingPeriod}
                            onValueChange={v => handleSinglePlanChange(singleForm.planId, v)}
                          >
                            <SelectTrigger className="bg-zinc-900 border-zinc-800 text-xs text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="yearly">Yearly (Save 20%)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] text-zinc-400">Gateway</label>
                          <Select
                            value={singleForm.paymentMethod}
                            onValueChange={v => setSingleForm({ ...singleForm, paymentMethod: v })}
                          >
                            <SelectTrigger className="bg-zinc-900 border-zinc-800 text-xs text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                              <SelectItem value="paypal">PayPal</SelectItem>
                              <SelectItem value="lemonsqueezy">LemonSqueezy</SelectItem>
                              <SelectItem value="stripe">Stripe</SelectItem>
                              <SelectItem value="razorpay">Razorpay</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] text-zinc-400">Transaction Amount ($)</label>
                          <Input
                            type="number"
                            step="0.01"
                            value={singleForm.amount}
                            onChange={e => setSingleForm({ ...singleForm, amount: Number(e.target.value) })}
                            className="bg-zinc-900 border-zinc-800 text-xs text-white font-mono font-bold"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-[11px] text-zinc-400 font-mono">
                        <span>Allocated Tokens: <strong className="text-white">{singleForm.tokens}</strong></span>
                        <span>•</span>
                        <span>Creation Date: 
                          <select 
                            value={singleForm.daysAgo}
                            onChange={e => setSingleForm({ ...singleForm, daysAgo: Number(e.target.value) })}
                            className="ml-1.5 bg-zinc-900 border border-zinc-800 rounded px-2 py-0.5 text-xs text-zinc-200"
                          >
                            <option value={0}>Today (Live)</option>
                            <option value={1}>1 Day Ago</option>
                            <option value={3}>3 Days Ago</option>
                            <option value={6}>6 Days Ago</option>
                          </select>
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-zinc-800 pt-4 flex justify-end">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-6 py-2.5 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-95 gap-2"
                  >
                    <CheckCircle2 size={15} />
                    <span>{loading ? "Deploying User..." : "Deploy Realistic User Entity"}</span>
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* ── TAB 2: BATCH PLATFORM SEEDER ────────────────────────────── */}
          {activeTab === "batch" && (
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md p-6 space-y-6">
              <div className="border-b border-zinc-800 pb-4">
                <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                  <Sparkles size={16} className="text-indigo-400" />
                  Batch Platform Seeder
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Generate multiple realistic users at once across 30+ countries with active subscriptions to populate the World Map, Revenue, and 7-day Growth Charts.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Count */}
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 space-y-2">
                  <label className="text-xs font-medium text-zinc-300">Total Users to Create</label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={batchForm.count}
                    onChange={e => setBatchForm({ ...batchForm, count: Number(e.target.value) })}
                    className="bg-zinc-900 border-zinc-800 text-white font-mono font-bold"
                  />
                  <div className="flex gap-1.5 pt-1">
                    {[5, 10, 25, 50].map(cnt => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setBatchForm(b => ({ ...b, count: cnt }))}
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-mono transition-all",
                          batchForm.count === cnt ? "bg-indigo-600 text-white font-bold" : "bg-zinc-800 text-zinc-400 hover:text-white"
                        )}
                      >
                        +{cnt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Paid Ratio */}
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-zinc-300">Paid Subscriber %</span>
                    <span className="font-mono text-emerald-400 font-bold">{batchForm.paidRatio}%</span>
                  </div>
                  <Input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={batchForm.paidRatio}
                    onChange={e => setBatchForm({ ...batchForm, paidRatio: Number(e.target.value) })}
                    className="cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                    <span>0% (All Free)</span>
                    <span>50%</span>
                    <span>100% (All Paid)</span>
                  </div>
                </div>

                {/* Spread Days */}
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 space-y-2">
                  <label className="text-xs font-medium text-zinc-300">Date Distribution</label>
                  <Select
                    value={batchForm.spreadDays.toString()}
                    onValueChange={v => setBatchForm({ ...batchForm, spreadDays: Number(v) })}
                  >
                    <SelectTrigger className="bg-zinc-900 border-zinc-800 text-xs text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                      <SelectItem value="1">Past 24 Hours</SelectItem>
                      <SelectItem value="7">Last 7 Days (Fills Chart)</SelectItem>
                      <SelectItem value="14">Last 14 Days</SelectItem>
                      <SelectItem value="30">Last 30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-zinc-500">
                    Spreads user creation and payments evenly across the timeline.
                  </p>
                </div>
              </div>

              {/* Simulation Summary Box */}
              <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/10 space-y-1.5 text-xs text-zinc-300">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <Globe size={14} className="text-indigo-400" />
                  Simulation Projection:
                </p>
                <p className="text-zinc-400 leading-relaxed">
                  Will generate <strong className="text-white">{batchForm.count} users</strong> across 30+ real global cities with coordinates. Approximately <strong className="text-emerald-400">{Math.round(batchForm.count * (batchForm.paidRatio / 100))} users</strong> will have active paid subscriptions (Scholar / Pro / Power) with real matching <strong className="text-white">Transaction records</strong> distributed over the <strong className="text-white">last {batchForm.spreadDays} days</strong>.
                </p>
              </div>

              <div className="border-t border-zinc-800 pt-4 flex justify-end">
                <Button
                  onClick={handleBatchGenerate}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-6 py-2.5 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-95 gap-2"
                >
                  <Sparkles size={15} />
                  <span>{loading ? "Generating Users..." : "Execute Batch Generation"}</span>
                </Button>
              </div>
            </div>
          )}

          {/* ── TAB 3: USER SUBSCRIPTIONS & TRANSACTION INJECTION ───────── */}
          {activeTab === "manage" && (
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md p-6 space-y-6">
              {selectedUser ? (
                <>
                  {/* Selected User Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-950/40">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 rounded-xl border border-zinc-700">
                        <AvatarImage src={selectedUser.picture} />
                        <AvatarFallback className="bg-zinc-800 text-white font-bold">
                          {selectedUser.name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{selectedUser.name}</h3>
                          {selectedUser.membership?.isActive ? (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
                              {selectedUser.membership.planId} active
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                              Free Tier
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">{selectedUser.email}</p>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          {selectedUser.location?.city || "Unknown City"}, {selectedUser.location?.country || "Unknown Country"} 
                          ({selectedUser.location?.latitude?.toFixed(2) || "0"}, {selectedUser.location?.longitude?.toFixed(2) || "0"})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteUser(selectedUser._id, selectedUser.name)}
                        className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs"
                      >
                        <Trash2 size={13} className="mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  {/* Allocate / Upgrade Subscription */}
                  <div className="space-y-4 border-t border-zinc-800 pt-4">
                    <h4 className="text-xs font-semibold text-white tracking-tight flex items-center gap-2">
                      <Crown size={14} className="text-amber-400" />
                      Manage Subscription Plan
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] text-zinc-400">Subscription Status</label>
                        <Select
                          value={manageSubForm.isActive ? "active" : "inactive"}
                          onValueChange={v => setManageSubForm({ ...manageSubForm, isActive: v === "active" })}
                        >
                          <SelectTrigger className="bg-zinc-950/60 border-zinc-800 text-xs text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                            <SelectItem value="active">Active Subscription</SelectItem>
                            <SelectItem value="inactive">Cancel / Free Tier</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] text-zinc-400">Tier Plan</label>
                        <Select
                          value={manageSubForm.planId}
                          onValueChange={v => {
                            const rate = PLAN_RATES[v] || PLAN_RATES.pro;
                            const amt = manageSubForm.billingPeriod === "yearly" ? rate.yearly : rate.monthly;
                            setManageSubForm({ ...manageSubForm, planId: v, amount: amt });
                          }}
                        >
                          <SelectTrigger className="bg-zinc-950/60 border-zinc-800 text-xs text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                            <SelectItem value="scholar">Scholar ($4.99/mo)</SelectItem>
                            <SelectItem value="pro">Pro Scholar ($9.99/mo)</SelectItem>
                            <SelectItem value="power">Power Scholar ($19.99/mo)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] text-zinc-400">Billing Period</label>
                        <Select
                          value={manageSubForm.billingPeriod}
                          onValueChange={v => {
                            const rate = PLAN_RATES[manageSubForm.planId] || PLAN_RATES.pro;
                            const amt = v === "yearly" ? rate.yearly : rate.monthly;
                            setManageSubForm({ ...manageSubForm, billingPeriod: v, amount: amt });
                          }}
                        >
                          <SelectTrigger className="bg-zinc-950/60 border-zinc-800 text-xs text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={manageSubForm.createTransaction}
                          onChange={e => setManageSubForm({ ...manageSubForm, createTransaction: e.target.checked })}
                          className="rounded bg-zinc-900 border-zinc-700"
                        />
                        <span>Also generate matching Transaction ($ {manageSubForm.amount})</span>
                      </label>

                      <Button
                        size="sm"
                        onClick={handleAllocateSubscription}
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                      >
                        Save Subscription Changes
                      </Button>
                    </div>
                  </div>

                  {/* Inject Extra Transaction */}
                  <div className="space-y-4 border-t border-zinc-800 pt-4">
                    <h4 className="text-xs font-semibold text-white tracking-tight flex items-center gap-2">
                      <DollarSign size={14} className="text-emerald-400" />
                      Inject Standalone Payment Transaction
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] text-zinc-400">Amount ($ USD)</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={injectTxForm.amount}
                          onChange={e => setInjectTxForm({ ...injectTxForm, amount: Number(e.target.value) })}
                          className="bg-zinc-950/60 border-zinc-800 text-xs text-white font-mono font-bold"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] text-zinc-400">Payment Gateway</label>
                        <Select
                          value={injectTxForm.paymentMethod}
                          onValueChange={v => setInjectTxForm({ ...injectTxForm, paymentMethod: v })}
                        >
                          <SelectTrigger className="bg-zinc-950/60 border-zinc-800 text-xs text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                            <SelectItem value="paypal">PayPal</SelectItem>
                            <SelectItem value="lemonsqueezy">LemonSqueezy</SelectItem>
                            <SelectItem value="stripe">Stripe</SelectItem>
                            <SelectItem value="razorpay">Razorpay</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] text-zinc-400">Status</label>
                        <Select
                          value={injectTxForm.status}
                          onValueChange={v => setInjectTxForm({ ...injectTxForm, status: v })}
                        >
                          <SelectTrigger className="bg-zinc-950/60 border-zinc-800 text-xs text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                            <SelectItem value="success">Success</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <Button
                        size="sm"
                        onClick={handleInjectTransaction}
                        disabled={loading}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5"
                      >
                        <CreditCard size={13} />
                        <span>Inject Payment</span>
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-20 text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-xl">
                  Select a user from the left directory to inspect or allocate subscriptions.
                </div>
              )}
            </div>
          )}

          {/* ── TAB 4: NOTE INJECTION & YOUTUBE PROMPTER ─────────────────── */}
          {activeTab === "notes" && (
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md p-6 space-y-6">
              <div className="border-b border-zinc-800 pb-4">
                <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                  <FileText size={16} className="text-indigo-400" />
                  Educational Content Injector
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Generate textbook notes and study artifacts under any simulated user's account.
                </p>
              </div>

              {/* Step 1: Prompt Generator */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                  Step 1: Extract Video Metadata & Generate LLM Prompt
                </h4>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <PlayCircle size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <Input
                      value={noteForm.videoUrl}
                      onChange={e => setNoteForm({ ...noteForm, videoUrl: e.target.value })}
                      placeholder="Paste YouTube Video URL (e.g. https://youtube.com/watch?v=...)"
                      className="pl-9 bg-zinc-950/60 border-zinc-800 text-xs text-white"
                    />
                  </div>
                  <Button
                    onClick={handleExtractPrompt}
                    disabled={promptLoading || !noteForm.videoUrl}
                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs shrink-0"
                  >
                    {promptLoading ? "Extracting..." : "Generate Prompt"}
                  </Button>
                </div>

                {generatedPrompt && (
                  <div className="relative p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedPrompt);
                        toast.success("Prompt copied to clipboard!");
                      }}
                      className="absolute top-2.5 right-2.5 text-zinc-400 hover:text-white p-1 rounded bg-zinc-800 text-xs flex items-center gap-1"
                    >
                      <Copy size={12} />
                      <span>Copy</span>
                    </button>
                    <pre className="text-[10px] font-mono text-indigo-300 max-h-32 overflow-y-auto pr-16 whitespace-pre-wrap">
                      {generatedPrompt}
                    </pre>
                  </div>
                )}
              </div>

              {/* Step 2: Content Deployment */}
              <div className="space-y-3 border-t border-zinc-800 pt-4">
                <h4 className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                  Step 2: Deploy Formatted Content
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-zinc-400">Note Title</label>
                    <Input
                      value={noteForm.title}
                      onChange={e => setNoteForm({ ...noteForm, title: e.target.value })}
                      placeholder="Title of Note"
                      className="bg-zinc-950/60 border-zinc-800 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-zinc-400">Access Level</label>
                    <Select
                      value={noteForm.type}
                      onValueChange={v => setNoteForm({ ...noteForm, type: v })}
                    >
                      <SelectTrigger className="bg-zinc-950/60 border-zinc-800 text-xs text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                        <SelectItem value="free">Free Public Note</SelectItem>
                        <SelectItem value="premium">Premium Pro Note</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-zinc-400">Detail Level</label>
                    <Select
                      value={noteForm.detailLevel}
                      onValueChange={v => setNoteForm({ ...noteForm, detailLevel: v })}
                    >
                      <SelectTrigger className="bg-zinc-950/60 border-zinc-800 text-xs text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                        <SelectItem value="Short">Concise / Summary</SelectItem>
                        <SelectItem value="Standard">Standard Guide</SelectItem>
                        <SelectItem value="Comprehensive">Comprehensive Textbook</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-zinc-400">HTML / Markdown Content Body</label>
                  <Textarea
                    value={noteForm.content}
                    onChange={e => setNoteForm({ ...noteForm, content: e.target.value })}
                    rows={6}
                    placeholder="Paste formatted HTML or Markdown from AI generator..."
                    className="bg-zinc-950/60 border-zinc-800 text-xs text-zinc-200 font-mono"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-zinc-400">
                    Deploying as Author: <strong className="text-white">{selectedUser?.name || "Select user on left"}</strong>
                  </span>

                  <Button
                    onClick={handleDeployNote}
                    disabled={loading || !selectedUser || !noteForm.content.trim()}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-5"
                  >
                    Deploy Artifact
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}