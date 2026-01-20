"use client";

import React, { useEffect, useState } from "react";
import { 
  Users, Search, Filter, Trash2, Edit2, 
  UserPlus, Zap, Calendar, Globe, X, Check,
  Mail, Crown, UserCircle, Clock, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/config/api";

export default function PersonnelPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // Fetch real users data
  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        
        const response = await api.get('/admin/users', {
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        });
        
        console.log('Users Data:', response.data);
        setUsers(response.data.data || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching users data:', error);
        setError('Failed to fetch users data');
        toast.error("Failed to load personnel data");
      } finally {
        setLoading(false);
      }
    };

    fetchUsersData();
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: '2-digit',
      month: 'short', 
      year: 'numeric'
    });
  };

  // Calculate days since joined
  const getDaysSinceJoined = (dateString: string) => {
    const joined = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joined.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Get user initials
  const getUserInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Get membership status
  const getMembershipStatus = (user: any) => {
    if (user.membership?.isActive) {
      return {
        label: "Premium",
        color: "bg-gradient-to-r from-red-500 to-pink-600",
        textColor: "text-white",
        icon: <Crown size={10} />
      };
    }
    return {
      label: "Free",
      color: "bg-white/5",
      textColor: "text-neutral-400",
      icon: null
    };
  };

  // Handle user deletion
  const handleDelete = (id: string, name: string) => {
    // In a real app, you would make an API call here
    setUsers(users.filter((user: any) => user._id !== id));
    toast.success(`User "${name}" terminated`, {
      description: "User data has been removed from the system"
    });
  };

  // Start editing user name
  const startEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  // Save edited name
  const saveEdit = (id: string) => {
    // In a real app, you would make an API call here
    setUsers(users.map((user: any) => 
      user._id === id ? { ...user, name: editName } : user
    ));
    setEditingId(null);
    toast.success("User profile updated", {
      description: "Changes have been saved successfully"
    });
  };

  // Filter users based on search query
  const filteredUsers = users.filter((user: any) => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mb-4"></div>
          <p className="text-sm font-medium text-neutral-500 uppercase tracking-widest">Loading Personnel Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-10 rounded-3xl bg-red-600/5 border border-red-600/20 max-w-md">
          <Shield size={24} className="text-red-500 mx-auto mb-4" />
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

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
        <div>
          <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white">Personnel_Registry</h2>
          <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2">
            <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-[0.3em] flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_5px_red]" />
              Active Personnel: {users.length} Accounts
            </p>
            <div className="hidden md:flex items-center gap-2">
              <Badge className="text-[8px] font-black px-2 py-1 rounded-full bg-red-600/10 text-red-500 border-red-500/30">
                {users.filter((u: any) => u.membership?.isActive).length} Premium
              </Badge>
              <Badge className="text-[8px] font-black px-2 py-1 rounded-full bg-white/5 text-neutral-400 border-white/10">
                {users.filter((u: any) => !u.membership?.isActive).length} Free
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Summary - Mobile Only */}
        <div className="md:hidden grid grid-cols-2 gap-3">
          <div className="bg-black border border-white/5 p-3 rounded-xl">
            <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Premium</p>
            <p className="text-sm font-black text-red-500">
              {users.filter((u: any) => u.membership?.isActive).length}
            </p>
          </div>
          <div className="bg-black border border-white/5 p-3 rounded-xl">
            <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Free</p>
            <p className="text-sm font-black text-white">
              {users.filter((u: any) => !u.membership?.isActive).length}
            </p>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTER SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8 lg:col-span-9 relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
            <input 
              type="text" 
              placeholder="Search by name, email, or user ID..."
              className="w-full bg-black border border-white/5 rounded-2xl py-3 md:py-4 pl-12 pr-4 text-[10px] md:text-[10px] font-bold uppercase tracking-widest text-white focus:border-red-600/50 transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="md:col-span-4 lg:col-span-3">
          <button className="w-full bg-black border border-white/5 rounded-2xl py-3 md:py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-white hover:border-white/10 transition-all flex items-center justify-center gap-2">
            <Filter size={14} />
            <span>Filter Results</span>
          </button>
        </div>
      </div>

      {/* USER STATS SUMMARY - Desktop Only */}
      <div className="hidden md:grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="bg-black border border-white/5 p-4 rounded-2xl">
          <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-2">Total Accounts</p>
          <div className="flex items-center justify-between">
            <p className="text-xl font-black text-white">{users.length}</p>
            <Users className="text-neutral-700" size={20} />
          </div>
        </div>
        <div className="bg-black border border-white/5 p-4 rounded-2xl">
          <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-2">Premium Members</p>
          <div className="flex items-center justify-between">
            <p className="text-xl font-black text-red-500">{users.filter((u: any) => u.membership?.isActive).length}</p>
            <Crown className="text-red-500" size={20} />
          </div>
        </div>
        <div className="bg-black border border-white/5 p-4 rounded-2xl">
          <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-2">Avg. Account Age</p>
          <div className="flex items-center justify-between">
            <p className="text-xl font-black text-white">
              {users.length > 0 
                ? Math.round(users.reduce((sum: number, user: any) => 
                    sum + getDaysSinceJoined(user.joinedAt), 0) / users.length
                  )
                : 0} days
            </p>
            <Clock className="text-neutral-700" size={20} />
          </div>
        </div>
        <div className="bg-black border border-white/5 p-4 rounded-2xl">
          <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-2">Google Auth</p>
          <div className="flex items-center justify-between">
            <p className="text-xl font-black text-white">{users.length}</p>
            <Globe className="text-neutral-700" size={20} />
          </div>
        </div>
      </div>

      {/* PERSONNEL TABLE - Responsive Design */}
      <div className="bg-black border border-white/5 rounded-3xl md:rounded-[3rem] overflow-hidden shadow-2xl">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="p-6 text-[9px] font-black uppercase tracking-[0.3em] text-neutral-500">User_Profile</th>
                <th className="p-6 text-[9px] font-black uppercase tracking-[0.3em] text-neutral-500 text-center">Membership_Status</th>
                <th className="p-6 text-[9px] font-black uppercase tracking-[0.3em] text-neutral-500">Account_Created</th>
                <th className="p-6 text-[9px] font-black uppercase tracking-[0.3em] text-neutral-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user: any) => {
                const membership = getMembershipStatus(user);
                return (
                  <tr key={user._id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        {user.picture ? (
                          <img 
                            src={user.picture} 
                            alt={user.name}
                            className="h-10 w-10 rounded-xl border border-white/10"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-purple-600 border border-white/10 flex items-center justify-center text-[10px] font-black text-white">
                            {getUserInitials(user.name)}
                          </div>
                        )}
                        <div className="min-w-0">
                          {editingId === user._id ? (
                            <input 
                              autoFocus
                              className="w-full bg-neutral-900 border border-red-500/50 rounded px-3 py-2 text-[10px] font-black text-white outline-none"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && saveEdit(user._id)}
                              onBlur={() => saveEdit(user._id)}
                            />
                          ) : (
                            <p className="text-[10px] font-black uppercase text-white tracking-widest truncate">
                              {user.name}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Mail size={10} className="text-neutral-600" />
                            <p className="text-[9px] font-bold text-neutral-600 uppercase truncate">
                              {user.email}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Shield size={10} className="text-neutral-600" />
                            <p className="text-[8px] font-medium text-neutral-500 font-mono">
                              ID: {user._id.substring(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Badge className={cn(
                          "text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border flex items-center gap-1",
                          membership.color,
                          membership.textColor
                        )}>
                          {membership.icon}
                          {membership.label}
                        </Badge>
                        {user.membership?.isActive && (
                          <div className="text-[8px] text-neutral-500 font-medium">
                            Expires: {formatDate(user.membership.expiresAt)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-neutral-400 text-[9px] font-bold uppercase">
                          <Calendar size={12} className="text-neutral-600"/> 
                          {formatDate(user.joinedAt)}
                        </div>
                        <div className="text-[8px] text-neutral-600 mt-1">
                          {getDaysSinceJoined(user.joinedAt)} days ago
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {editingId === user._id ? (
                          <button 
                            onClick={() => saveEdit(user._id)}
                            className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
                            title="Save Changes"
                          >
                            <Check size={14}/>
                          </button>
                        ) : (
                          <button 
                            onClick={() => startEdit(user._id, user.name)}
                            className="p-2 hover:bg-white/10 rounded-lg text-neutral-600 hover:text-white transition-all"
                            title="Edit User"
                          >
                            <Edit2 size={14}/>
                          </button>
                        )}
                        
                        <button 
                          onClick={() => handleDelete(user._id, user.name)}
                          className="p-2 hover:bg-red-500/10 rounded-lg text-neutral-600 hover:text-red-500 transition-all"
                          title="Delete User"
                        >
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden">
          <div className="divide-y divide-white/5">
            {filteredUsers.map((user: any) => {
              const membership = getMembershipStatus(user);
              return (
                <div key={user._id} className="p-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      {user.picture ? (
                        <img 
                          src={user.picture} 
                          alt={user.name}
                          className="h-12 w-12 rounded-xl border border-white/10 flex-shrink-0"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-purple-600 border border-white/10 flex items-center justify-center text-xs font-black text-white flex-shrink-0">
                          {getUserInitials(user.name)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        {editingId === user._id ? (
                          <input 
                            autoFocus
                            className="w-full bg-neutral-900 border border-red-500/50 rounded px-3 py-2 text-sm font-medium text-white outline-none mb-1"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && saveEdit(user._id)}
                            onBlur={() => saveEdit(user._id)}
                          />
                        ) : (
                          <p className="text-sm font-bold text-white truncate">
                            {user.name}
                          </p>
                        )}
                        <div className="flex items-center gap-1 mt-1">
                          <Mail size={10} className="text-neutral-600 flex-shrink-0" />
                          <p className="text-xs text-neutral-500 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {editingId === user._id ? (
                        <button 
                          onClick={() => saveEdit(user._id)}
                          className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg"
                        >
                          <Check size={14}/>
                        </button>
                      ) : (
                        <button 
                          onClick={() => startEdit(user._id, user.name)}
                          className="p-1.5 hover:bg-white/10 rounded-lg text-neutral-600"
                        >
                          <Edit2 size={14}/>
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(user._id, user.name)}
                        className="p-1.5 hover:bg-red-500/10 rounded-lg text-neutral-600"
                      >
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Status</div>
                      <Badge className={cn(
                        "text-[8px] font-black px-2 py-1 rounded-full flex items-center gap-1 w-fit",
                        membership.color,
                        membership.textColor
                      )}>
                        {membership.icon}
                        {membership.label}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Joined</div>
                      <div className="flex items-center gap-1 text-xs text-neutral-400">
                        <Calendar size={10} className="text-neutral-600"/>
                        {formatDate(user.joinedAt)}
                      </div>
                      <div className="text-[10px] text-neutral-600 mt-1">
                        {getDaysSinceJoined(user.joinedAt)} days
                      </div>
                    </div>
                  </div>
                  
                  {user.membership?.isActive && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Premium Details</div>
                      <div className="text-[10px] text-neutral-400">
                        Expires: {formatDate(user.membership.expiresAt)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* FOOTER */}
        <div className="p-4 md:p-6 bg-white/[0.01] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-[9px] font-black uppercase text-neutral-600 tracking-widest">
              Showing {filteredUsers.length} of {users.length} users
            </p>
            {searchQuery && (
              <p className="text-[8px] text-neutral-500 mt-1">
                Filtered by: "{searchQuery}"
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button className="h-8 w-8 flex items-center justify-center border border-white/5 rounded-lg text-[9px] font-black text-neutral-500 hover:text-white hover:border-white/10 transition-colors">
              1
            </button>
            <div className="text-[9px] text-neutral-500 px-2">
              Page 1 of 1
            </div>
          </div>
        </div>
      </div>

      {/* EMPTY STATE */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users size={48} className="text-neutral-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Users Found</h3>
          <p className="text-sm text-neutral-500 max-w-md mx-auto">
            {searchQuery 
              ? `No users match your search for "${searchQuery}"`
              : "No users found in the system. Users will appear here once they register."
            }
          </p>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="mt-4 text-sm text-red-500 hover:text-red-400 transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      )}
    </div>
  );
}