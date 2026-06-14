"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Flag,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Mail,
  Calendar,
  ChevronDown,
  Eye,
  XCircle,
  Shield,
  Ban,
  MessageSquare,
  RefreshCw,
  Activity,
  TrendingUp,
  Users,
  Gavel,
  AlertOctagon,
  UserX,
  UserCheck,
  Zap,
  Terminal,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Copy,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/config/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Types
interface Report {
  _id: string;
  reporter: {
    _id: string;
    name: string;
    email: string;
    username: string;
    picture?: string;
  };
  reportedUser: {
    _id: string;
    name: string;
    email: string;
    username: string;
    picture?: string;
  };
  reason: 'spam' | 'harassment' | 'inappropriate_content' | 'impersonation' | 'other';
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
  actionTaken?: {
    type: 'warn' | 'suspend' | 'ban';
    details: string;
  };
}

interface Stats {
  pending: number;
  reviewed: number;
  resolved: number;
  total: number;
  byReason: Array<{ _id: string; count: number }>;
}

interface TopReportedUser {
  _id: string;
  count: number;
  userInfo: {
    _id: string;
    name: string;
    email: string;
    username: string;
    picture?: string;
    joinedAt: string;
    membership?: {
      isActive: boolean;
      planName?: string;
    };
    tokens?: number;
  };
  recentReports: Array<{
    _id: string;
    reason: string;
    status: string;
    createdAt: string;
  }>;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [topReportedUsers, setTopReportedUsers] = useState<TopReportedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTopUsers, setLoadingTopUsers] = useState(true);
  
  // Filtering & Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [reasonFilter, setReasonFilter] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);

  // Drawer moderation states
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedUser, setSelectedUser] = useState<TopReportedUser | null>(null);
  const [actionType, setActionType] = useState<'warn' | 'suspend' | 'ban'>('warn');
  const [actionNotes, setActionNotes] = useState("");
  const [suspensionDays, setSuspensionDays] = useState(7);
  const [submittingAction, setSubmittingAction] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : '';

  // Fetch reports
  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (reasonFilter !== 'all') params.append('reason', reasonFilter);
      
      const response = await api.get(`/admin/reports?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setReports(response.data.data.reports);
        setStats(response.data.data.stats);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  // Fetch top reported users
  const fetchTopReportedUsers = async () => {
    try {
      setLoadingTopUsers(true);
      const response = await api.get('/admin/reports/analytics/top-reported', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setTopReportedUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching top reported users:', error);
    } finally {
      setLoadingTopUsers(false);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchTopReportedUsers();
  }, [statusFilter, reasonFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchReports(), fetchTopReportedUsers()]);
    setRefreshing(false);
    toast.success("Reports synced");
  };

  const handleUpdateStatus = async (reportId: string, status: string, action?: any) => {
    setSubmittingAction(true);
    try {
      const response = await api.patch(`/admin/reports/${reportId}`, 
        {
          status,
          adminNotes: actionNotes,
          action
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(`Report marked as ${status}`);
        fetchReports();
        fetchTopReportedUsers();
        setSelectedReport(null);
        setSelectedUser(null);
        setActionNotes("");
      }
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error("Failed to update report");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleUserAction = async (userId: string) => {
    setSubmittingAction(true);
    try {
      const response = await api.post('/admin/users/action', 
        {
          userId,
          action: actionType,
          notes: actionNotes,
          ...(actionType === 'suspend' && { duration: suspensionDays })
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(`Action applied to user`);
        fetchTopReportedUsers();
        setSelectedUser(null);
        setSelectedReport(null);
        setActionNotes("");
      }
    } catch (error) {
      console.error('Error applying user action:', error);
      toast.error("Failed to apply action");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return;
    
    try {
      const response = await api.delete(`/admin/reports/${reportId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        toast.success("Report deleted");
        fetchReports();
        fetchTopReportedUsers();
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error("Failed to delete report");
    }
  };

  // Filter reports based on search
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase().trim();
      return (
        report.reporter?.name?.toLowerCase().includes(query) ||
        report.reporter?.email?.toLowerCase().includes(query) ||
        report.reportedUser?.name?.toLowerCase().includes(query) ||
        report.reportedUser?.email?.toLowerCase().includes(query) ||
        report.description?.toLowerCase().includes(query)
      );
    });
  }, [reports, searchQuery]);

  // Get color for reason badge
  const getReasonColor = (reason: string) => {
    const colors: Record<string, string> = {
      spam: "bg-orange-500/10 text-orange-500 border-orange-500/15",
      harassment: "bg-red-500/10 text-red-500 border-red-500/15",
      inappropriate_content: "bg-purple-500/10 text-purple-500 border-purple-500/15",
      impersonation: "bg-yellow-500/10 text-yellow-500 border-yellow-500/15",
      other: "bg-neutral-900 text-neutral-400 border-neutral-850"
    };
    return colors[reason] || colors.other;
  };

  // Sparkline coordinates for stat cards
  const sparklineStats = useMemo(() => [15, 25, 20, 35, 30, 48, 42, 56], []);

  const openReportDrawer = (report: Report) => {
    setSelectedReport(report);
    setSelectedUser(null);
    setActionType('warn');
    setActionNotes(report.adminNotes || "");
    setIsDrawerOpen(true);
  };

  const openUserDrawer = (user: TopReportedUser) => {
    setSelectedUser(user);
    setSelectedReport(null);
    setActionType('warn');
    setActionNotes("");
    setIsDrawerOpen(true);
  };

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="space-y-6 md:space-y-8 pb-32 md:pb-20 font-mono">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 border-b border-neutral-900 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-red-400 bg-red-500/5 border border-red-500/15 px-2 py-0.5 rounded uppercase tracking-wider font-bold">
              Security Node
            </span>
            <span className="text-[9px] font-mono text-neutral-500 flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
              STATUS: ENFORCING
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black italic uppercase tracking-wider text-white">
            Reports_<span className="text-red-500 underline decoration-red-500/30 underline-offset-8">Console</span>
          </h1>
          <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider mt-1">
            Uplink monitor for moderation tickets, user code of conduct compliance, and audit actions.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-850 text-[10px] text-neutral-400 hover:text-white hover:border-neutral-700 transition-all shrink-0 w-full md:w-auto justify-center",
            refreshing && "opacity-50"
          )}
          disabled={refreshing}
        >
          <RefreshCw size={12} className={cn("text-neutral-500", refreshing && "animate-spin text-red-500")} />
          {refreshing ? "SYNCING..." : "SYNC NOW"}
        </button>
      </div>

      {/* --- STATS HUD GRID --- */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            label="Total Reports"
            value={stats.total}
            icon={Flag}
            color="emerald"
            sparklineData={sparklineStats}
          />
          <StatCard
            label="Pending Queue"
            value={stats.pending}
            icon={Clock}
            color="orange"
            sparklineData={sparklineStats.map(v => Math.round(v * 0.4))}
          />
          <StatCard
            label="Reviewed Log"
            value={stats.reviewed}
            icon={Eye}
            color="blue"
            sparklineData={sparklineStats.map(v => Math.round(v * 0.75))}
          />
          <StatCard
            label="Resolved Log"
            value={stats.resolved}
            icon={CheckCircle}
            color="emerald"
            sparklineData={sparklineStats.map(v => Math.round(v * 0.9))}
          />
          <StatCard
            label="Resolution Efficiency"
            value={stats.total ? Math.round((stats.resolved / stats.total) * 100) : 0}
            suffix="%"
            icon={Activity}
            color="purple"
            circularProgress={stats.total ? Math.round((stats.resolved / stats.total) * 100) : 0}
          />
        </div>
      )}

      {/* --- TOP REPORTED USERS (WATCHLIST) --- */}
      <div className="bg-neutral-950/40 border border-neutral-900 rounded-[2rem] p-6 backdrop-blur-md relative overflow-hidden group">
        <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-red-500/5 filter blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400">
              <TrendingUp size={16} />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                Priority Personnel Watchlist
              </h2>
              <p className="text-[8px] text-neutral-500 uppercase mt-0.5">
                Users flagged with multiple chronological infractions
              </p>
            </div>
          </div>
          <span className="text-[7px] font-black text-red-400 bg-red-500/5 border border-red-500/15 px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">
            HIGH EXPOSURE
          </span>
        </div>

        {loadingTopUsers ? (
          <div className="py-10 text-center">
            <Loader2 className="animate-spin mx-auto text-red-500" size={20} />
          </div>
        ) : topReportedUsers.length === 0 ? (
          <div className="py-10 text-center text-neutral-500 text-[9px] uppercase tracking-wider">
            No priority infraction targets found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topReportedUsers.slice(0, 3).map((user, index) => (
              <div
                key={user._id}
                className="bg-neutral-900/20 border border-neutral-900 rounded-2xl p-5 hover:border-red-500/35 transition-all group flex flex-col justify-between"
              >
                <div>
                  {/* User Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10 border border-neutral-800 ring-2 ring-red-500/10">
                          <AvatarImage src={user.userInfo.picture} className="object-cover" />
                          <AvatarFallback className="bg-neutral-950 text-neutral-600 text-xs font-bold">{user.userInfo.name?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 border border-neutral-950 flex items-center justify-center text-[8px] font-black text-white">
                          #{index + 1}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-white group-hover:text-red-400 transition-colors truncate max-w-[110px]">
                          {user.userInfo.name}
                        </p>
                        <p className="text-[8px] text-neutral-500 truncate max-w-[110px]">
                          {user.userInfo.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <span className="text-lg font-black text-red-500 block leading-none">
                        {user.count}
                      </span>
                      <span className="text-[6px] font-bold text-neutral-500 uppercase tracking-widest block mt-0.5">
                        Infractions
                      </span>
                    </div>
                  </div>

                  {/* Info Row */}
                  <div className="grid grid-cols-2 gap-2 mb-4 text-[8px]">
                    <div className="bg-neutral-950/40 rounded-xl p-2 border border-neutral-900/60">
                      <span className="text-neutral-550 block uppercase">Joined</span>
                      <strong className="text-white mt-0.5 block">
                        {new Date(user.userInfo.joinedAt).toLocaleDateString()}
                      </strong>
                    </div>
                    <div className="bg-neutral-950/40 rounded-xl p-2 border border-neutral-900/60">
                      <span className="text-neutral-550 block uppercase">Sub Status</span>
                      <strong className={cn(
                        "mt-0.5 block uppercase font-black",
                        user.userInfo.membership?.isActive ? "text-emerald-400" : "text-neutral-500"
                      )}>
                        {user.userInfo.membership?.isActive ? user.userInfo.membership.planName || "Premium" : "Free"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-neutral-900/40">
                  <button
                    onClick={() => openUserDrawer(user)}
                    className="flex-1 py-2 bg-red-600/10 hover:bg-red-600/20 rounded-xl text-[8px] font-bold uppercase tracking-wider text-red-400 transition-colors flex items-center justify-center gap-1 border border-red-500/10"
                  >
                    <Gavel size={12} />
                    Take Action
                  </button>
                  <button
                    onClick={() => setSearchQuery(user.userInfo.email)}
                    title="Filter in ledger"
                    className="px-3 py-2 bg-neutral-950 border border-neutral-850 hover:border-neutral-700 rounded-xl text-[8px] font-bold uppercase text-neutral-400 hover:text-white transition-colors"
                  >
                    <Eye size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- SEARCH & FILTERS BAR --- */}
      <div className="bg-neutral-950/60 border border-neutral-900 p-4 rounded-2xl space-y-4 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600" size={14} />
            <input
              type="text"
              placeholder="Search reporter/reported name, email or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-850 focus:border-red-500/40 h-11 pl-10 pr-4 rounded-xl text-[10px] font-mono text-white placeholder-neutral-500 focus:outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-neutral-900 border border-neutral-850 focus:border-red-500/40 h-11 pl-3 pr-8 rounded-xl text-[10px] font-bold uppercase tracking-widest text-neutral-400 focus:text-white focus:outline-none transition-all appearance-none cursor-pointer w-full sm:w-auto min-w-[120px]"
              >
                <option value="all">STATUS: ALL</option>
                <option value="pending">STATUS: PENDING</option>
                <option value="reviewed">STATUS: REVIEWED</option>
                <option value="resolved">STATUS: RESOLVED</option>
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={reasonFilter}
                onChange={(e) => setReasonFilter(e.target.value)}
                className="bg-neutral-900 border border-neutral-850 focus:border-red-500/40 h-11 pl-3 pr-8 rounded-xl text-[10px] font-bold uppercase tracking-widest text-neutral-400 focus:text-white focus:outline-none transition-all appearance-none cursor-pointer w-full sm:w-auto min-w-[120px]"
              >
                <option value="all">REASON: ALL</option>
                <option value="spam">REASON: SPAM</option>
                <option value="harassment">REASON: HARASSMENT</option>
                <option value="inappropriate_content">REASON: INAPPROPRIATE</option>
                <option value="impersonation">REASON: IMPERSONATION</option>
                <option value="other">REASON: OTHER</option>
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center text-[8px] font-mono text-neutral-600 uppercase border-t border-neutral-900/60 pt-3">
          <span>Active filter parameters matching: {filteredReports.length} report(s)</span>
          <span>Security protocol stream online</span>
        </div>
      </div>

      {/* --- REPORTS LEDGER LISTING --- */}
      <div className="bg-neutral-950/40 border border-neutral-900 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="p-4 bg-neutral-950/60 border-b border-neutral-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flag size={13} className="text-neutral-500" />
            <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">
              Infraction Report Registry
            </span>
          </div>
          <span className="text-[8px] font-mono text-neutral-600 uppercase">
            Total Ledger Weight: {filteredReports.length}
          </span>
        </div>

        {loading ? (
          <div className="p-20 text-center">
            <Loader2 className="animate-spin mx-auto text-red-500" size={24} />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-16 text-center text-neutral-500 text-[10px] uppercase">
            No moderation reports logged in interval
          </div>
        ) : (
          <>
            {/* Desktop View Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left font-mono">
                <thead>
                  <tr className="border-b border-neutral-900 bg-neutral-950/30 text-[8px] uppercase tracking-widest text-neutral-500">
                    <th className="p-5 font-black">Infraction details</th>
                    <th className="p-5 font-black">Reporter</th>
                    <th className="p-5 font-black">Offending target</th>
                    <th className="p-5 font-black text-center">Status</th>
                    <th className="p-5 font-black text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900/40">
                  {filteredReports.map((report) => (
                    <tr 
                      key={report._id} 
                      onClick={() => openReportDrawer(report)}
                      className="hover:bg-neutral-950/60 transition-colors group cursor-pointer"
                    >
                      <td className="p-5 max-w-[200px]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[7px] font-bold uppercase border shrink-0",
                            getReasonColor(report.reason)
                          )}>
                            {report.reason.replace('_', ' ')}
                          </span>
                          <span className="text-[7px] text-neutral-600 font-bold">#{report._id.slice(-8).toUpperCase()}</span>
                        </div>
                        <p className="text-[10px] text-neutral-400 truncate leading-relaxed">
                          {report.description || "No description logs"}
                        </p>
                      </td>
                      
                      <td className="p-5 max-w-[150px]">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7 border border-neutral-850 shrink-0">
                            <AvatarImage src={report.reporter?.picture} className="object-cover" />
                            <AvatarFallback className="bg-neutral-900 text-neutral-600 text-[9px]">{report.reporter?.name?.charAt(0) || '?'}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-[9px] font-bold text-white truncate">{report.reporter?.name || "Unknown"}</p>
                            <p className="text-[7px] text-neutral-500 truncate">{report.reporter?.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-5 max-w-[150px]">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7 border border-neutral-850 shrink-0 ring-2 ring-red-500/5">
                            <AvatarImage src={report.reportedUser?.picture} className="object-cover" />
                            <AvatarFallback className="bg-neutral-900 text-neutral-600 text-[9px]">{report.reportedUser?.name?.charAt(0) || '?'}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-[9px] font-bold text-red-400 truncate">{report.reportedUser?.name || "Unknown"}</p>
                            <p className="text-[7px] text-neutral-500 truncate">{report.reportedUser?.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-5 text-center">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[8px] font-black uppercase border tracking-tight",
                          report.status === 'pending' && "bg-orange-500/5 border-orange-500/10 text-orange-500",
                          report.status === 'reviewed' && "bg-blue-500/5 border-blue-500/10 text-blue-500",
                          report.status === 'resolved' && "bg-emerald-500/5 border-emerald-500/10 text-emerald-500"
                        )}>
                          {report.status}
                        </span>
                      </td>

                      <td className="p-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => openReportDrawer(report)}
                            title="Moderation Console"
                            className="p-2 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white rounded-lg transition-colors border border-neutral-850"
                          >
                            <Shield size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteReport(report._id)}
                            title="Purge Report"
                            className="p-2 bg-red-650/5 hover:bg-red-600/10 text-red-500 rounded-lg transition-colors border border-red-500/10"
                          >
                            <XCircle size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View Card List */}
            <div className="md:hidden divide-y divide-neutral-900/60 bg-neutral-950/20">
              {filteredReports.map((report) => (
                <div 
                  key={report._id}
                  onClick={() => openReportDrawer(report)}
                  className="p-5 space-y-4 cursor-pointer hover:bg-neutral-950/40 transition-colors"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[7px] font-bold uppercase border",
                        getReasonColor(report.reason)
                      )}>
                        {report.reason.replace('_', ' ')}
                      </span>
                      <span className="text-[7px] text-neutral-600 font-bold">#{report._id.slice(-8).toUpperCase()}</span>
                    </div>

                    <span className={cn(
                      "px-2 py-0.5 rounded text-[7px] font-black uppercase border tracking-tight",
                      report.status === 'pending' && "bg-orange-500/5 border-orange-500/10 text-orange-500",
                      report.status === 'reviewed' && "bg-blue-500/5 border-blue-500/10 text-blue-500",
                      report.status === 'resolved' && "bg-emerald-500/5 border-emerald-500/10 text-emerald-500"
                    )}>
                      {report.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-neutral-900/30 p-3 rounded-xl border border-neutral-900/60">
                    <div>
                      <span className="text-[6px] text-neutral-600 uppercase block mb-1">Reporter</span>
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="h-6 w-6 border border-neutral-850 shrink-0">
                          <AvatarImage src={report.reporter?.picture} className="object-cover" />
                          <AvatarFallback className="bg-neutral-950 text-neutral-600 text-[8px]">{report.reporter?.name?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <p className="text-[9px] font-bold text-white truncate">{report.reporter?.name || "Unknown"}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-[6px] text-neutral-600 uppercase block mb-1">Offender</span>
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="h-6 w-6 border border-neutral-850 shrink-0 ring-2 ring-red-500/5">
                          <AvatarImage src={report.reportedUser?.picture} className="object-cover" />
                          <AvatarFallback className="bg-neutral-950 text-neutral-600 text-[8px]">{report.reportedUser?.name?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <p className="text-[9px] font-bold text-red-400 truncate">{report.reportedUser?.name || "Unknown"}</p>
                      </div>
                    </div>
                  </div>

                  {report.description && (
                    <p className="text-[10px] text-neutral-400 bg-neutral-900/10 p-3 rounded-xl border border-neutral-900/50">
                      "{report.description}"
                    </p>
                  )}

                  <div className="flex justify-between items-center text-[7px] text-neutral-550 pt-1">
                    <span>
                      Infraction filed: {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-red-400 font-bold flex items-center gap-0.5">
                      Open Moderation Panel <ArrowRight size={8} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* --- TELEMETRY SLIDING DRAWER PANEL (MODERATION ACTION) --- */}
      <AnimatePresence>
        {isDrawerOpen && (selectedReport || selectedUser) && (
          <div className="fixed inset-0 z-[200] flex" onClick={() => setIsDrawerOpen(false)}>
            {/* Backdrop */}
            <div className="flex-1 bg-black/60 backdrop-blur-sm" />

            {/* Slider Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl bg-neutral-950 border-l border-neutral-900 flex flex-col h-full overflow-hidden shadow-2xl relative"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-900 bg-neutral-950 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_#ef4444]" />
                  <span className="text-[10px] font-mono tracking-wider uppercase text-neutral-400 font-bold">
                    Moderation_Command_Terminal
                  </span>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 hover:bg-neutral-900 border border-transparent hover:border-neutral-850 rounded-lg text-neutral-500 hover:text-red-400 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-36 font-mono text-[10px]">
                
                {/* 1. Infraction Context */}
                {selectedReport ? (
                  <div className="p-4 bg-neutral-900/40 border border-neutral-900 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded text-[8px] font-bold border uppercase tracking-wider",
                        getReasonColor(selectedReport.reason)
                      )}>
                        {selectedReport.reason.replace('_', ' ')}
                      </span>
                      <span className="text-[8px] text-neutral-600 font-bold">
                        TICKET_ID: {selectedReport._id.slice(-8).toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[7px] text-neutral-500 uppercase">Description Logs</span>
                      <p className="text-[10px] text-white leading-relaxed bg-black/40 p-3 rounded-xl border border-neutral-900">
                        "{selectedReport.description || "No specific infraction description logs logged."}"
                      </p>
                    </div>

                    {/* Reporter & Offended Profiles */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1">
                        <span className="text-[7px] text-neutral-500 uppercase block">Reporter Details</span>
                        <div className="flex items-center gap-2 bg-neutral-950/40 p-2.5 rounded-xl border border-neutral-900/60">
                          <Avatar className="h-7 w-7 border border-neutral-850 shrink-0">
                            <AvatarImage src={selectedReport.reporter?.picture} className="object-cover" />
                            <AvatarFallback className="bg-neutral-900 text-[9px] font-bold text-neutral-600">{selectedReport.reporter?.name?.charAt(0) || '?'}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-[9px] font-bold text-white truncate leading-tight">{selectedReport.reporter?.name || "Unknown"}</p>
                            <p className="text-[7px] text-neutral-500 truncate">{selectedReport.reporter?.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[7px] text-neutral-500 uppercase block">Infracting Account</span>
                        <div className="flex items-center gap-2 bg-neutral-950/40 p-2.5 rounded-xl border border-neutral-900/60">
                          <Avatar className="h-7 w-7 border border-neutral-850 shrink-0 ring-2 ring-red-500/5">
                            <AvatarImage src={selectedReport.reportedUser?.picture} className="object-cover" />
                            <AvatarFallback className="bg-neutral-900 text-[9px] font-bold text-neutral-600">{selectedReport.reportedUser?.name?.charAt(0) || '?'}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-[9px] font-bold text-red-400 truncate leading-tight">{selectedReport.reportedUser?.name || "Unknown"}</p>
                            <p className="text-[7px] text-neutral-500 truncate">{selectedReport.reportedUser?.email}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : selectedUser && (
                  <div className="p-4 bg-neutral-900/40 border border-neutral-900 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="px-2.5 py-0.5 rounded text-[8px] font-bold bg-red-500/10 border border-red-500/20 text-red-400 uppercase tracking-wider">
                        Target watchlist profile
                      </span>
                      <span className="text-[8px] text-neutral-600 font-bold">
                        USER_ID: {selectedUser.userInfo._id.slice(-8).toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3.5 bg-neutral-950/40 p-3.5 rounded-xl border border-neutral-900">
                      <Avatar className="h-11 w-11 border border-neutral-800 ring-2 ring-red-500/10 shrink-0">
                        <AvatarImage src={selectedUser.userInfo.picture} className="object-cover" />
                        <AvatarFallback className="bg-neutral-900 text-xs font-bold text-neutral-600">{selectedUser.userInfo.name?.charAt(0) || '?'}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{selectedUser.userInfo.name}</h4>
                        <p className="text-[8px] text-neutral-500 mt-0.5">{selectedUser.userInfo.email}</p>
                        <span className="text-[7px] text-neutral-600 uppercase font-mono block mt-1">Username: {selectedUser.userInfo.username}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 text-center text-[8px] pt-1">
                      <div className="bg-neutral-950/40 p-2 rounded-xl border border-neutral-900/60">
                        <span className="text-neutral-550 uppercase">Infractions</span>
                        <strong className="text-red-500 block text-sm mt-0.5">{selectedUser.count}</strong>
                      </div>
                      <div className="bg-neutral-950/40 p-2 rounded-xl border border-neutral-900/60">
                        <span className="text-neutral-550 uppercase">Coins Balance</span>
                        <strong className="text-white block text-sm mt-0.5">{selectedUser.userInfo.tokens || 0}</strong>
                      </div>
                      <div className="bg-neutral-950/40 p-2 rounded-xl border border-neutral-900/60">
                        <span className="text-neutral-550 uppercase">Membership</span>
                        <strong className="text-white block text-sm mt-0.5 uppercase">
                          {selectedUser.userInfo.membership?.isActive ? selectedUser.userInfo.membership.planName : "Free"}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. AI Moderation Recommendation Diagnostics */}
                <div className="bg-neutral-900/20 border border-neutral-900 p-5 rounded-2xl space-y-3">
                  <h4 className="text-[10px] font-bold text-white uppercase flex items-center gap-1.5 border-b border-neutral-900 pb-2">
                    <Zap size={12} className="text-yellow-500" />
                    AI Moderation Diagnostics
                  </h4>
                  
                  <div className="p-3.5 bg-neutral-950 border border-neutral-900 rounded-xl flex gap-2.5 items-start">
                    <Terminal size={14} className="text-red-500 shrink-0 mt-0.5" />
                    <div className="space-y-1 text-[8.5px] text-neutral-400 leading-relaxed">
                      {selectedUser && selectedUser.count > 3 ? (
                        <p>
                          <strong className="text-red-400">CRITICAL PENALTY RECOMMENDATION:</strong> Target account has accumulated <strong className="text-white">{selectedUser.count} infractions</strong>. Baseline threshold breached. AI recommends applying a <strong className="text-white">permanent Ban</strong> or a minimum of <strong className="text-white">30-day suspension</strong> to restrict database upload access.
                        </p>
                      ) : selectedReport?.reason === "harassment" ? (
                        <p>
                          <strong className="text-red-400">POLICY ENFORCEMENT PROTOCOL:</strong> Filed report flags harassment. Under paperxify code Section 4.2, recommend executing a <strong className="text-white">7-day temporary suspension</strong> along with an official warning log in user notifications drawer.
                        </p>
                      ) : (
                        <p>
                          <strong className="text-white">STANDARD INFRACTION AUDIT:</strong> Initial report incident history low. AI recommends applying a <strong className="text-white">warning protocol</strong> with detailed infraction description logs. Mark report status as resolved.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Action Configuration Form */}
                <div className="bg-neutral-900/20 border border-neutral-900 p-5 rounded-2xl space-y-4">
                  <h4 className="text-[10px] font-bold text-white uppercase flex items-center gap-1.5 border-b border-neutral-900 pb-2">
                    <Shield size={12} className="text-red-400" />
                    Penalization Configuration
                  </h4>

                  <div className="space-y-4">
                    {/* Action Select Buttons */}
                    <div className="space-y-1.5">
                      <span className="text-[8px] text-neutral-500 uppercase block">INFRACTION ACTION VALUE</span>
                      <div className="grid grid-cols-3 gap-2">
                        {([
                          { type: "warn", label: "Warn Node", class: "border-yellow-500/20 hover:border-yellow-500/40 text-yellow-500" },
                          { type: "suspend", label: "Suspend Node", class: "border-orange-500/20 hover:border-orange-500/40 text-orange-500" },
                          { type: "ban", label: "Ban Node", class: "border-red-500/20 hover:border-red-500/40 text-red-500" }
                        ] as const).map((item) => {
                          const isActive = actionType === item.type;
                          return (
                            <button
                              type="button"
                              key={item.type}
                              onClick={() => setActionType(item.type)}
                              className={cn(
                                "py-3 rounded-xl border text-[8px] font-bold uppercase tracking-wider transition-all",
                                item.class,
                                isActive && "bg-red-600 border-red-600 text-white shadow-lg shadow-red-950/20"
                              )}
                            >
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Suspension Days input */}
                    {actionType === "suspend" && (
                      <div className="space-y-1.5">
                        <span className="text-[8px] text-neutral-500 uppercase block">SUSPENSION LIMIT (DAYS)</span>
                        <input 
                          type="number"
                          min={1}
                          max={365}
                          value={suspensionDays}
                          onChange={(e) => setSuspensionDays(parseInt(e.target.value) || 7)}
                          className="w-full bg-neutral-900 border border-neutral-850 h-11 px-4 text-xs font-bold text-white focus:outline-none focus:border-red-500/30 rounded-xl"
                        />
                      </div>
                    )}

                    {/* Notes Textarea */}
                    <div className="space-y-1.5">
                      <span className="text-[8px] text-neutral-500 uppercase block">ADMIN MODERATION NOTES *</span>
                      <textarea
                        rows={3}
                        value={actionNotes}
                        onChange={(e) => setActionNotes(e.target.value)}
                        placeholder="Provide details explain why action is applied..."
                        className="w-full bg-neutral-900 border border-neutral-850 p-4 text-xs text-white focus:outline-none focus:border-red-500/30 rounded-xl resize-none"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Execute Operations */}
                <div className="space-y-2 pt-2 border-t border-neutral-900/60">
                  <button
                    onClick={() => {
                      if (selectedReport) {
                        const actionObj = {
                          type: actionType,
                          details: actionNotes,
                          ...(actionType === 'suspend' && { until: new Date(Date.now() + suspensionDays * 24 * 60 * 60 * 1000) })
                        };
                        handleUpdateStatus(selectedReport._id, 'resolved', actionObj);
                      } else if (selectedUser) {
                        handleUserAction(selectedUser.userInfo._id);
                      }
                    }}
                    disabled={submittingAction || !actionNotes.trim()}
                    className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-red-600/10 transition-all"
                  >
                    {submittingAction ? (
                      <Loader2 className="animate-spin text-white" size={12} />
                    ) : (
                      <>
                        <ShieldAlert size={12} />
                        Execute Moderation Sequence
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="w-full py-3.5 bg-neutral-900 border border-neutral-850 hover:bg-neutral-850 text-neutral-400 hover:text-white rounded-xl text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                  >
                    Cancel Action
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// --- SUB-COMPONENTS ---

interface StatCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  icon: any;
  color: "emerald" | "purple" | "blue" | "orange";
  sparklineData?: number[];
  circularProgress?: number;
}

function StatCard({ label, value, suffix = "", icon: Icon, color, sparklineData, circularProgress }: StatCardProps) {
  let hoverBorder = "hover:border-red-500/40";
  let textColor = "text-red-400";
  let strokeColor = "#ef4444";
  
  if (color === "emerald") {
    hoverBorder = "hover:border-emerald-500/45";
    textColor = "text-emerald-400";
    strokeColor = "#10b981";
  } else if (color === "blue") {
    hoverBorder = "hover:border-blue-500/45";
    textColor = "text-blue-400";
    strokeColor = "#3b82f6";
  } else if (color === "purple") {
    hoverBorder = "hover:border-purple-500/45";
    textColor = "text-purple-400";
    strokeColor = "#a855f7";
  } else if (color === "orange") {
    hoverBorder = "hover:border-orange-500/45";
    textColor = "text-orange-400";
    strokeColor = "#f97316";
  }

  // Draw sparkline SVG coordinates
  let fillPoints = "";
  let points = "";
  const width = 140;
  const height = 40;
  
  if (sparklineData && sparklineData.length > 1) {
    const minVal = Math.min(...sparklineData);
    const maxVal = Math.max(...sparklineData);
    const range = maxVal - minVal || 1;
    
    points = sparklineData.map((val: number, i: number) => {
      const x = (i / (sparklineData.length - 1)) * width;
      const y = height - ((val - minVal) / range) * (height - 8) - 4;
      return `${x},${y}`;
    }).join(" ");
    
    fillPoints = `0,${height} ${points} ${width},${height}`;
  }

  return (
    <div className={cn(
      "bg-neutral-950/40 border border-neutral-900 p-5 rounded-[2rem] relative overflow-hidden group transition-all duration-300 shadow-xl backdrop-blur-md flex flex-col justify-between min-h-[130px]",
      hoverBorder
    )}>
      {/* Background SVG Sparkline */}
      {sparklineData && sparklineData.length > 1 && (
        <div className="absolute bottom-0 right-0 h-12 w-32 opacity-20 group-hover:opacity-35 transition-opacity">
          <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id={`glow-card-tx-rep-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity="0.4" />
                <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={fillPoints} fill={`url(#glow-card-tx-rep-${color})`} />
            <polyline points={points} fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      {/* Decorative Glow */}
      <div className="absolute -top-12 -left-12 w-20 h-20 rounded-full filter blur-[25px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none" style={{ backgroundColor: strokeColor }} />

      <div className="flex items-start justify-between relative z-10 gap-3">
        <div className="min-w-0">
          <p className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest mb-1">{label}</p>
          <h4 className="text-2xl font-mono font-black italic tracking-tight text-white leading-none truncate">
            {value}{suffix}
          </h4>
        </div>
        
        {circularProgress !== undefined ? (
          <div className="relative h-10 w-10 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-neutral-900" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-purple-500" strokeDasharray={`${circularProgress}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <span className="absolute text-[8px] font-mono font-black text-white">{Math.round(circularProgress)}%</span>
          </div>
        ) : (
          <div className={cn("p-2 rounded-xl bg-neutral-900 border border-neutral-850 shrink-0", textColor)}>
            <Icon size={13} />
          </div>
        )}
      </div>

      <div className="mt-4 pt-2 border-t border-neutral-900/40 flex items-center justify-between relative z-10">
        <span className="text-[7.5px] font-mono text-neutral-550 tracking-tight flex items-center gap-1">
          <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
          Queue Diagnostic Feed
        </span>
      </div>
    </div>
  );
}

// Loader icon wrapper
const Loader2 = ({ className, size }: any) => (
  <RefreshCw className={cn("animate-spin", className)} size={size || 14} />
);