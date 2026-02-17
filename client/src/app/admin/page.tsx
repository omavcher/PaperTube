"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, FileText, IndianRupee, 
  Activity, ShieldCheck, Link, User, Mail
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import api from "@/config/api";

// --- Updated Interface based on your JSON ---
interface Diagnostics {
  totalUsers: number;
  totalNotes: number;
  totalRevenue: number;
  sourceDistribution: Array<{ _id: string; count: number }>;
  last5Creations: {
    notes: Array<{ 
      _id: string; 
      title: string; 
      owner: { _id: string; name: string; email: string }; 
      createdAt: string 
    }>;
  };
}

export default function AdminDashboard() {
  const [diagnostics, setDiagnostics] = useState<Diagnostics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUserDetails, setShowUserDetails] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchDiagnostics = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        
        const response = await api.get('/admin/diagnostics', {
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        });
        
        setDiagnostics(response.data.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching diagnostics data:', error);
        setError('Failed to fetch diagnostics data');
      } finally {
        setLoading(false);
      }
    };

    fetchDiagnostics();
  }, []);

  // Calculate total source count
  const getTotalSources = () => {
    if (!diagnostics?.sourceDistribution) return 0;
    return diagnostics.sourceDistribution.reduce((sum, source) => sum + source.count, 0);
  };

  // Toggle user details view
  const toggleUserDetails = (id: string) => {
    setShowUserDetails(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Get unique users ONLY from Notes
  const getUniqueUsers = () => {
    if (!diagnostics?.last5Creations?.notes) return [];
    
    const users = new Map();
    
    diagnostics.last5Creations.notes.forEach(note => {
      if (note.owner && note.owner._id) {
        users.set(note.owner._id, note.owner);
      }
    });
    
    return Array.from(users.values());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mb-4"></div>
          <p className="text-sm font-medium text-neutral-500 uppercase tracking-widest">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-10 rounded-3xl bg-red-600/5 border border-red-600/20 max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">Error Loading Data</h3>
          <p className="text-sm text-neutral-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-sm font-medium text-red-500 hover:text-red-400 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const uniqueUsers = getUniqueUsers();

  return (
    <div className="space-y-6 md:space-y-10 pb-10">
      
      {/* SECTION 1: KEY STATS (Removed Flashcards/Quiz Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <AdminStatCard 
          label="Total Users" 
          value={diagnostics?.totalUsers || 0} 
          sub="Registered accounts" 
          icon={Users} 
          color="text-red-500" 
        />
        <AdminStatCard 
          label="Total Notes" 
          value={diagnostics?.totalNotes || 0} 
          sub="Created notes" 
          icon={FileText} 
          color="text-blue-500" 
        />
        <AdminStatCard 
          label="Total Revenue" 
          value={diagnostics?.totalRevenue || 0} 
          sub="Platform earnings" 
          icon={IndianRupee} 
          color="text-emerald-500" 
          isCurrency={true}
        />
      </div>

      {/* SECTION 2: REFERRAL SOURCE & ACTIVE USERS */}
      <div className="grid lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* Source Distribution */}
        <Card className="lg:col-span-7 bg-black border-white/5 rounded-3xl md:rounded-[3.5rem] p-6 md:p-10 shadow-2xl border overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 md:p-10 opacity-10 rotate-12">
            <Link size={120} className="text-red-600" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xs md:text-sm font-black uppercase italic tracking-[0.4em] mb-2 text-red-500">Traffic Sources</h3>
            <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-6 md:mb-10">User Acquisition Distribution</p>
            
            {diagnostics?.sourceDistribution && diagnostics.sourceDistribution.length > 0 ? (
              <div className="space-y-6 md:space-y-8">
                {diagnostics.sourceDistribution.map((source, index) => {
                  const percentage = Math.round((source.count / getTotalSources()) * 100);
                  let color = "bg-white";
                  
                  switch(source._id) {
                    case 'Instagram': color = "bg-pink-500"; break;
                    case 'Twitter/X': color = "bg-blue-400"; break;
                    case 'WhatsApp': color = "bg-emerald-500"; break;
                    case 'Facebook': color = "bg-blue-600"; break;
                    case 'LinkedIn': color = "bg-blue-700"; break;
                    case 'YouTube': color = "bg-red-600"; break;
                    case 'Direct': color = "bg-gray-400"; break;
                    case 'localhost': color = "bg-purple-500"; break;
                  }
                  
                  return (
                    <ReferralBar 
                      key={index}
                      label={source._id} 
                      percentage={percentage} 
                      color={color} 
                      count={source.count} 
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-sm text-neutral-500">No source data available</p>
              </div>
            )}
          </div>
        </Card>

        {/* Active Users Panel */}
        <Card className="lg:col-span-5 bg-neutral-900/20 border-white/5 rounded-3xl md:rounded-[3.5rem] p-6 md:p-10 backdrop-blur-3xl shadow-2xl border">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h3 className="text-xs md:text-sm font-black uppercase italic tracking-[0.4em] text-white">Active_Users</h3>
            <span className="text-[10px] font-black text-neutral-500 bg-white/5 px-3 py-1 rounded-full">
              {uniqueUsers.length} Active
            </span>
          </div>
          
          <div className="space-y-4">
            {uniqueUsers.length > 0 ? (
              uniqueUsers.map((user: any) => (
                <div key={user._id} className="p-4 md:p-6 rounded-2xl md:rounded-3xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all cursor-pointer"
                  onClick={() => toggleUserDetails(user._id)}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center text-white text-xs font-black">
                        {user.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-white">{user.name}</p>
                        <p className="text-[9px] text-neutral-500 truncate max-w-[120px]">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-[8px] font-black text-neutral-500 bg-white/5 px-2 py-1 rounded">
                      ID: {user._id.substring(0, 6)}...
                    </div>
                  </div>
                  
                  {showUserDetails[user._id] && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className="mt-3 pt-3 border-t border-white/5"
                    >
                      <div className="grid grid-cols-2 gap-3 text-[9px]">
                        <div className="flex items-center gap-2">
                          <Mail size={10} className="text-neutral-500" />
                          <span className="text-neutral-400">Email:</span>
                          <span className="text-white truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User size={10} className="text-neutral-500" />
                          <span className="text-neutral-400">User ID:</span>
                          <span className="text-white font-mono">{user._id.substring(0, 8)}...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <User size={24} className="text-neutral-600 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">No active users found</p>
              </div>
            )}

            {/* System Status */}
            <div className="mt-4 p-4 md:p-6 rounded-2xl md:rounded-3xl bg-red-600/5 border border-red-600/10">
              <div className="flex items-center gap-3 text-red-500 mb-2">
                <ShieldCheck size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">System Status</span>
              </div>
              <p className="text-[9px] text-neutral-500 leading-relaxed font-medium">
                All services operational. Tracking {getTotalSources()} user sources.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* SECTION 3: LATEST CREATIONS (ONLY NOTES) */}
      <Card className="bg-black border-white/5 rounded-3xl md:rounded-[3.5rem] p-6 md:p-10 shadow-2xl border">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-10 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-2xl text-red-500"><Activity size={20}/></div>
            <div>
              <h3 className="text-xs md:text-sm font-black uppercase tracking-widest italic">Latest_Notes</h3>
              <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">Recent generated content</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
              Total Revenue: <span className="text-white">₹{diagnostics?.totalRevenue || 0}</span>
            </div>
            <div className="text-[9px] font-medium text-neutral-600 bg-white/5 px-3 py-1 rounded-full">
               Total Notes: {diagnostics?.totalNotes || 0}
            </div>
          </div>
        </div>

        {/* Single Full-Width Column for Notes */}
        <div className="space-y-4">
            {diagnostics?.last5Creations?.notes && diagnostics.last5Creations.notes.length > 0 ? (
              diagnostics.last5Creations.notes.map((note) => (
                <CreationCard 
                  key={note._id}
                  title={note.title}
                  owner={note.owner}
                  date={note.createdAt}
                />
              ))
            ) : (
              <p className="text-sm text-neutral-500 text-center py-4">No notes found</p>
            )}
        </div>
      </Card>
    </div>
  );
}

// --- TACTICAL SUB-COMPONENTS ---

function AdminStatCard({ label, value, sub, icon: Icon, color, isCurrency = false }: any) {
  return (
    <div className="bg-black border border-white/5 p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] relative overflow-hidden group hover:border-red-600/40 transition-all duration-500 shadow-xl">
      <div className="absolute top-0 right-0 p-4 md:p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
        <Icon size={80} className="hidden md:block" />
        <Icon size={60} className="md:hidden" />
      </div>
      <div className={cn("p-2 md:p-4 rounded-xl md:rounded-2xl bg-white/5 w-fit mb-4 md:mb-6 shadow-inner", color)}>
        <Icon size={16} className="md:hidden" />
        <Icon size={20} className="hidden md:block" />
      </div>
      <p className="text-[8px] md:text-[9px] font-black text-neutral-600 uppercase tracking-[0.3em] md:tracking-[0.4em] mb-1">
        {label}
      </p>
      <h4 className="text-xl md:text-3xl font-black italic tracking-tighter text-white mb-1 md:mb-2">
        {isCurrency && "₹"}{typeof value === 'number' ? value.toLocaleString() : value}
      </h4>
      <p className="text-[8px] md:text-[9px] font-bold text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-1">
        {sub}
      </p>
    </div>
  );
}

function ReferralBar({ label, percentage, color, count }: any) {
  return (
    <div className="space-y-2 md:space-y-3">
      <div className="flex justify-between items-center md:items-end">
        <span className="text-[10px] md:text-[10px] font-black uppercase tracking-widest text-neutral-400 truncate mr-2">
          {label}
        </span>
        <span className="text-[10px] md:text-[10px] font-black text-white whitespace-nowrap">
          {count} <span className="text-neutral-600 mx-1">/</span> {percentage}%
        </span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: `${percentage}%` }} 
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={cn("h-full rounded-full shadow-[0_0_10px] shadow-current", color)} 
        />
      </div>
    </div>
  );
}

function CreationCard({ title, owner, date }: any) {
  // Always Note type now
  const color = 'text-blue-500';
  const Icon = FileText;

  // Format owner name for display
  const getOwnerInitials = (owner: { name?: string }) => {
    if (!owner || !owner.name) return '??';
    return owner.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getOwnerName = (owner: { name?: string }) => {
    if (!owner || !owner.name) return 'Unknown User';
    return owner.name.length > 20 ? owner.name.substring(0, 20) + '...' : owner.name;
  };

  return (
    <div className="group flex items-center gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl hover:bg-white/[0.03] border border-white/5 transition-all">
      <div className="flex-shrink-0">
        <div className={cn("p-2 rounded-lg bg-white/5", color)}>
          <Icon size={14} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] md:text-[12px] font-medium text-white mb-1 truncate">
          {title}
        </p>
        <div className="flex items-center justify-between">
          {owner && owner.name ? (
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center text-[8px] font-black text-white">
                {getOwnerInitials(owner)}
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-neutral-300 leading-tight">
                  {getOwnerName(owner)}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <User size={10} className="text-neutral-500" />
              <span className="text-[8px] font-medium text-neutral-500 uppercase">
                Unknown Owner
              </span>
            </div>
          )}
          <span className="text-[9px] font-medium text-neutral-600 whitespace-nowrap">
            {formatDate(date)}
          </span>
        </div>
      </div>
    </div>
  );
}

// Helper function for date formatting
function formatDate(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

// Add AlertCircle icon component
function AlertCircle(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}