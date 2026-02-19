"use client";

import React, { useState, useEffect } from "react";
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
  Download,
  RefreshCw,
  Activity,
  TrendingUp,
  Users,
  Gavel,
  AlertOctagon,
  UserX,
  UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/config/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [reasonFilter, setReasonFilter] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedUser, setSelectedUser] = useState<TopReportedUser | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showUserActionModal, setShowUserActionModal] = useState(false);
  const [actionType, setActionType] = useState<'warn' | 'suspend' | 'ban'>('warn');
  const [actionNotes, setActionNotes] = useState("");
  const [suspensionDays, setSuspensionDays] = useState(7);
  const [refreshing, setRefreshing] = useState(false);
  const token = localStorage.getItem('authToken');

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
        setShowActionModal(false);
        setShowUserActionModal(false);
        setSelectedReport(null);
        setSelectedUser(null);
        setActionNotes("");
      }
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error("Failed to update report");
    }
  };

  const handleUserAction = async (userId: string, action: any) => {
    try {
      // You can create a separate endpoint for bulk user actions
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
        setShowUserActionModal(false);
        setSelectedUser(null);
        setActionNotes("");
      }
    } catch (error) {
      console.error('Error applying user action:', error);
      toast.error("Failed to apply action");
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
  const filteredReports = reports.filter(report => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      report.reporter?.name?.toLowerCase().includes(query) ||
      report.reporter?.email?.toLowerCase().includes(query) ||
      report.reportedUser?.name?.toLowerCase().includes(query) ||
      report.reportedUser?.email?.toLowerCase().includes(query) ||
      report.description?.toLowerCase().includes(query)
    );
  });

  // Get color for reason badge
  const getReasonColor = (reason: string) => {
    const colors: Record<string, string> = {
      spam: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      harassment: "bg-red-500/10 text-red-500 border-red-500/20",
      inappropriate_content: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      impersonation: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      other: "bg-gray-500/10 text-gray-400 border-gray-500/20"
    };
    return colors[reason] || colors.other;
  };

  // Get icon for status
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending': return <Clock size={14} className="text-orange-500" />;
      case 'reviewed': return <Eye size={14} className="text-blue-500" />;
      case 'resolved': return <CheckCircle size={14} className="text-emerald-500" />;
      default: return <Clock size={14} />;
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white flex items-center gap-3">
            <Flag className="text-red-600" />
            Reports_<span className="text-red-600">Console</span>
          </h1>
          <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.4em] mt-2">
            User Reports & Moderation System
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          className={cn(
            "flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
            refreshing ? "opacity-50" : "hover:text-white hover:border-red-600/50"
          )}
          disabled={refreshing}
        >
          <RefreshCw size={14} className={cn(refreshing && "animate-spin")} />
          {refreshing ? "Syncing..." : "Sync Data"}
        </button>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard
            label="Total Reports"
            value={stats.total}
            icon={Flag}
            color="text-neutral-400"
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            icon={Clock}
            color="text-orange-500"
          />
          <StatCard
            label="Reviewed"
            value={stats.reviewed}
            icon={Eye}
            color="text-blue-500"
          />
          <StatCard
            label="Resolved"
            value={stats.resolved}
            icon={CheckCircle}
            color="text-emerald-500"
          />
          <StatCard
            label="Resolution Rate"
            value={stats.total ? Math.round((stats.resolved / stats.total) * 100) : 0}
            suffix="%"
            icon={Activity}
            color="text-purple-500"
          />
        </div>
      )}

      {/* Top Reported Users Section */}
      <div className="bg-black/40 border border-white/5 rounded-[2rem] p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-600/10 rounded-xl">
              <TrendingUp className="text-red-600" size={20} />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                Top_Reported_Users
              </h2>
              <p className="text-[8px] text-neutral-600 font-mono mt-1">
                Users with highest report counts
              </p>
            </div>
          </div>
          <span className="text-[8px] font-black text-neutral-600 bg-white/5 px-3 py-1 rounded-full">
            Priority Watchlist
          </span>
        </div>

        {loadingTopUsers ? (
          <div className="py-10 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : topReportedUsers.length === 0 ? (
          <div className="py-10 text-center text-neutral-500 text-[10px] font-mono">
            No reported users found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topReportedUsers.map((user, index) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:border-red-600/30 transition-all group"
              >
                {/* User Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-600 to-purple-600 overflow-hidden">
                        {user.userInfo.picture ? (
                          <img src={user.userInfo.picture} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-white font-black">
                            {user.userInfo.name?.charAt(0) || '?'}
                          </div>
                        )}
                      </div>
                      <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 border-2 border-black flex items-center justify-center text-[8px] font-black text-white">
                        #{index + 1}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-wider">
                        {user.userInfo.name}
                      </p>
                      <p className="text-[8px] text-neutral-500 flex items-center gap-1 mt-1">
                        <Mail size={8} />
                        {user.userInfo.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xl font-black text-red-600">
                      {user.count}
                    </div>
                    <div className="text-[7px] font-black text-neutral-600 uppercase tracking-wider">
                      Reports
                    </div>
                  </div>
                </div>

                {/* User Stats */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-white/5 rounded-xl p-2">
                    <p className="text-[7px] font-black text-neutral-600 uppercase">Joined</p>
                    <p className="text-[8px] font-medium text-white mt-1">
                      {new Date(user.userInfo.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-2">
                    <p className="text-[7px] font-black text-neutral-600 uppercase">Status</p>
                    <p className={cn(
                      "text-[8px] font-black mt-1",
                      user.userInfo.membership?.isActive ? "text-emerald-500" : "text-neutral-500"
                    )}>
                      {user.userInfo.membership?.isActive ? user.userInfo.membership.planName || "Premium" : "Free"}
                    </p>
                  </div>
                </div>

                {/* Recent Reports Preview */}
                {user.recentReports && user.recentReports.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[7px] font-black text-neutral-600 uppercase tracking-wider mb-2">
                      Recent Reports
                    </p>
                    <div className="space-y-1">
                      {user.recentReports.slice(0, 2).map((report) => (
                        <div key={report._id} className="flex items-center justify-between text-[8px]">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full",
                            getReasonColor(report.reason)
                          )}>
                            {report.reason.replace('_', ' ')}
                          </span>
                          <span className="text-neutral-600">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowUserActionModal(true);
                    }}
                    className="flex-1 py-2 bg-red-600/10 hover:bg-red-600/20 rounded-xl text-[8px] font-black uppercase tracking-wider text-red-600 transition-colors flex items-center justify-center gap-1"
                  >
                    <Gavel size={12} />
                    Take Action
                  </button>
                  <button
                    onClick={() => {
                      // Filter reports by this user
                      setSearchQuery(user.userInfo.email);
                    }}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[8px] font-black uppercase tracking-wider text-neutral-400 transition-colors"
                  >
                    <Eye size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
          <input
            type="text"
            placeholder="Search by user name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black border border-white/5 h-14 pl-12 pr-4 rounded-2xl text-[10px] font-medium tracking-wider text-white placeholder:text-neutral-700 focus:border-red-600/50 focus:outline-none"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black border border-white/5 h-14 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white focus:border-red-600/50 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            className="bg-black border border-white/5 h-14 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white focus:border-red-600/50 focus:outline-none"
          >
            <option value="all">All Reasons</option>
            <option value="spam">Spam</option>
            <option value="harassment">Harassment</option>
            <option value="inappropriate_content">Inappropriate</option>
            <option value="impersonation">Impersonation</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-black/40 border border-white/5 rounded-[2rem] overflow-hidden">
        <div className="p-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flag size={14} className="text-neutral-600" />
            <span className="text-[9px] font-black text-neutral-500 uppercase tracking-wider">
              Report Registry ({filteredReports.length})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-mono text-neutral-700">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-20 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mb-4"></div>
            <p className="text-sm font-medium text-neutral-500">Loading reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-20 text-center">
            <Flag size={40} className="text-neutral-700 mx-auto mb-4" />
            <p className="text-sm font-medium text-neutral-500">No reports found</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredReports.map((report) => (
              <motion.div
                key={report._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Main Content */}
                  <div className="flex-1 space-y-3">
                    {/* Header with badges */}
                    <div className="flex items-center flex-wrap gap-3">
                      <div className={cn(
                        "px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5",
                        report.status === 'pending' && "bg-orange-500/10 text-orange-500 border-orange-500/20",
                        report.status === 'reviewed' && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                        report.status === 'resolved' && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      )}>
                        {getStatusIcon(report.status)}
                        {report.status}
                      </div>
                      
                      <div className={cn(
                        "px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest",
                        getReasonColor(report.reason)
                      )}>
                        {report.reason.replace('_', ' ')}
                      </div>

                      <div className="text-[8px] font-mono text-neutral-600">
                        ID: {report._id.slice(-8)}
                      </div>
                    </div>

                    {/* Users involved */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Reporter */}
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                          {report.reporter?.picture ? (
                            <img src={report.reporter.picture} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs font-black text-neutral-500">
                              {report.reporter?.name?.charAt(0) || '?'}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-white uppercase tracking-widest">
                            {report.reporter?.name || 'Unknown User'}
                          </p>
                          <p className="text-[8px] text-neutral-500 flex items-center gap-1">
                            <Mail size={8} />
                            {report.reporter?.email || 'No email'}
                          </p>
                        </div>
                        <span className="text-[7px] font-black text-neutral-700 uppercase tracking-wider ml-auto">
                          Reporter
                        </span>
                      </div>

                      {/* Reported User */}
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                          {report.reportedUser?.picture ? (
                            <img src={report.reportedUser.picture} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs font-black text-neutral-500">
                              {report.reportedUser?.name?.charAt(0) || '?'}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-white uppercase tracking-widest">
                            {report.reportedUser?.name || 'Unknown User'}
                          </p>
                          <p className="text-[8px] text-neutral-500 flex items-center gap-1">
                            <Mail size={8} />
                            {report.reportedUser?.email || 'No email'}
                          </p>
                        </div>
                        <span className="text-[7px] font-black text-red-600 uppercase tracking-wider ml-auto">
                          Reported
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    {report.description && (
                      <p className="text-[10px] text-neutral-400 bg-white/5 p-3 rounded-xl border border-white/5">
                        "{report.description}"
                      </p>
                    )}

                    {/* Footer with date */}
                    <div className="flex items-center gap-4 text-[8px] text-neutral-600">
                      <span className="flex items-center gap-1">
                        <Calendar size={8} />
                        {new Date(report.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      
                      {report.adminNotes && (
                        <span className="flex items-center gap-1 text-blue-500">
                          <MessageSquare size={8} />
                          Admin note added
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2 lg:ml-4">
                    <button
                      onClick={() => {
                        setSelectedReport(report);
                        setShowActionModal(true);
                      }}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors flex items-center gap-2"
                    >
                      <Shield size={12} />
                      Take Action
                    </button>
                    
                    <button
                      onClick={() => handleDeleteReport(report._id)}
                      className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors flex items-center gap-2"
                    >
                      <XCircle size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Action Modal for Individual Report */}
      <Dialog open={showActionModal} onOpenChange={setShowActionModal}>
        <DialogContent className="bg-black border border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black italic flex items-center gap-2">
              <Shield className="text-red-600" />
              Take_Action
            </DialogTitle>
            <DialogDescription className="text-neutral-500 text-[10px] font-mono">
              Report ID: {selectedReport?._id.slice(-8)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Action Type */}
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">
                Action Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['warn', 'suspend', 'ban'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setActionType(type)}
                    className={cn(
                      "p-4 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all",
                      actionType === type
                        ? "bg-red-600 border-red-600 text-white"
                        : "bg-white/5 border-white/10 text-neutral-500 hover:text-white"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Suspension duration (if suspend) */}
            {actionType === 'suspend' && (
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">
                  Suspension Duration (days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={suspensionDays}
                  onChange={(e) => setSuspensionDays(parseInt(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-[10px] font-medium"
                />
              </div>
            )}

            {/* Admin Notes */}
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">
                Admin Notes (optional)
              </label>
              <textarea
                rows={3}
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Add any notes about this action..."
                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-[10px] font-medium resize-none"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <button
              onClick={() => setShowActionModal(false)}
              className="flex-1 p-4 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (!selectedReport) return;
                
                const action = {
                  type: actionType,
                  details: actionNotes,
                  ...(actionType === 'suspend' && { until: new Date(Date.now() + suspensionDays * 24 * 60 * 60 * 1000) })
                };
                
                handleUpdateStatus(selectedReport._id, 'resolved', action);
              }}
              className="flex-1 p-4 bg-red-600 hover:bg-red-700 rounded-xl text-[9px] font-black uppercase tracking-wider"
            >
              Execute Action
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Action Modal for Top Reported Users */}
      <Dialog open={showUserActionModal} onOpenChange={setShowUserActionModal}>
        <DialogContent className="bg-black border border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black italic flex items-center gap-2">
              <Gavel className="text-red-600" />
              User_Action
            </DialogTitle>
            <DialogDescription className="text-neutral-500 text-[10px] font-mono">
              User: {selectedUser?.userInfo.name} ({selectedUser?.count} reports)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* User Info Preview */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-600 to-purple-600 overflow-hidden">
                  {selectedUser?.userInfo.picture ? (
                    <img src={selectedUser.userInfo.picture} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-white font-black">
                      {selectedUser?.userInfo.name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-black text-white">{selectedUser?.userInfo.name}</p>
                  <p className="text-[8px] text-neutral-500">{selectedUser?.userInfo.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[8px]">
                <div>
                  <span className="text-neutral-600">Reports:</span>
                  <span className="ml-2 text-red-600 font-black">{selectedUser?.count}</span>
                </div>
                <div>
                  <span className="text-neutral-600">Tokens:</span>
                  <span className="ml-2 text-white">{selectedUser?.userInfo.tokens || 0}</span>
                </div>
              </div>
            </div>

            {/* Action Type */}
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">
                Action Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['warn', 'suspend', 'ban'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setActionType(type)}
                    className={cn(
                      "p-4 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all",
                      actionType === type
                        ? "bg-red-600 border-red-600 text-white"
                        : "bg-white/5 border-white/10 text-neutral-500 hover:text-white"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Suspension duration (if suspend) */}
            {actionType === 'suspend' && (
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">
                  Suspension Duration (days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={suspensionDays}
                  onChange={(e) => setSuspensionDays(parseInt(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-[10px] font-medium"
                />
              </div>
            )}

            {/* Admin Notes */}
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">
                Admin Notes (required)
              </label>
              <textarea
                rows={3}
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Explain the reason for this action..."
                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-[10px] font-medium resize-none"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <button
              onClick={() => setShowUserActionModal(false)}
              className="flex-1 p-4 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (!selectedUser) return;
                handleUserAction(selectedUser.userInfo._id, {
                  type: actionType,
                  notes: actionNotes,
                  ...(actionType === 'suspend' && { duration: suspensionDays })
                });
              }}
              disabled={!actionNotes}
              className={cn(
                "flex-1 p-4 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all",
                actionNotes 
                  ? "bg-red-600 hover:bg-red-700 text-white" 
                  : "bg-red-600/50 text-white/50 cursor-not-allowed"
              )}
            >
              Apply Action
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Stat Card Component
function StatCard({ label, value, icon: Icon, color, suffix = "" }: any) {
  return (
    <div className="bg-black border border-white/5 p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">{label}</p>
        <Icon size={14} className={color} />
      </div>
      <p className="text-2xl font-black text-white">
        {value}{suffix}
      </p>
    </div>
  );
}