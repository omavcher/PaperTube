"use client";

import React, { useState } from "react";
import { 
  Users, Search, Filter, Trash2, Edit2, 
  UserPlus, Zap, Calendar, Globe, X, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Initial Registry Data
const INITIAL_REGISTRY = [
  { id: "1", name: "Om Awchar", email: "omawchar07@gmail.com", status: "Premium", joinDate: "12 Jan 2026", type: "Real" },
  { id: "2", name: "Aryan Sharma", email: "aryan@example.com", status: "Free", joinDate: "15 Jan 2026", type: "Real" },
  { id: "3", name: "Rahul_J", email: "rahul_forge@pt.in", status: "Free", joinDate: "18 Jan 2026", type: "Shadow" },
  { id: "4", name: "Sneha Kapur", email: "sneha@web.com", status: "Premium", joinDate: "14 Jan 2026", type: "Real" },
];

export default function PersonnelPage() {
  const [users, setUsers] = useState(INITIAL_REGISTRY);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // --- REQUISITION ACTIONS ---

  const handleDelete = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
    toast.success(`PERSONNEL_ID: ${id} TERMINATED`);
  };

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const saveEdit = (id: string) => {
    setUsers(users.map(user => user.id === id ? { ...user, name: editName } : user));
    setEditingId(null);
    toast.success("PERSONNEL DATA UPDATED");
  };

  const forgeShadowUser = () => {
    const newId = (users.length + 1).toString();
    const shadowUser = {
      id: newId,
      name: `Shadow_Node_${Math.floor(Math.random() * 1000)}`,
      email: `forge_${newId}@papertube.in`,
      status: "Free",
      joinDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      type: "Shadow"
    };
    setUsers([shadowUser, ...users]);
    toast.success("NEW SHADOW ENTITY FORGED");
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Personnel_Registry</h2>
          <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_5px_red]" />
            Active Deployment: {users.length} Nodes
          </p>
        </div>

        <button 
          onClick={forgeShadowUser}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-900/20 active:scale-95"
        >
          <UserPlus size={14} /> Forge Shadow Personnel
        </button>
      </div>

      {/* SEARCH INTERFACE */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-12 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
          <input 
            type="text" 
            placeholder="Search by Email, Name, or Node_ID..."
            className="w-full bg-black border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-[10px] font-bold uppercase tracking-widest text-white focus:border-red-600/50 transition-all outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* PERSONNEL TABLE */}
      <div className="bg-black border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl border-t-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01]">
              <th className="p-6 text-[9px] font-black uppercase tracking-[0.3em] text-neutral-500">Personnel_Identity</th>
              <th className="p-6 text-[9px] font-black uppercase tracking-[0.3em] text-neutral-500 text-center">Access_Level</th>
              <th className="p-6 text-[9px] font-black uppercase tracking-[0.3em] text-neutral-500">Sync_Date</th>
              <th className="p-6 text-[9px] font-black uppercase tracking-[0.3em] text-neutral-500 text-right">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white">
                       {user.type === "Shadow" ? <Zap size={14} className="text-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]"/> : user.name.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      {editingId === user.id ? (
                        <input 
                          autoFocus
                          className="bg-neutral-900 border border-red-500/50 rounded px-2 py-1 text-[10px] font-black text-white outline-none"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && saveEdit(user.id)}
                        />
                      ) : (
                        <p className="text-[10px] font-black uppercase text-white tracking-widest">{user.name}</p>
                      )}
                      <p className="text-[9px] font-bold text-neutral-600 uppercase mt-1">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6 text-center">
                  <Badge className={cn(
                    "text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border",
                    user.status === "Premium" ? "bg-red-600/10 border-red-500 text-red-500 shadow-[0_0_10px_rgba(220,38,38,0.1)]" : "bg-neutral-900 border-neutral-800 text-neutral-500"
                  )}>
                    {user.status}
                  </Badge>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-2 text-neutral-400 text-[9px] font-bold uppercase">
                    <Calendar size={12} className="text-neutral-600"/> {user.joinDate}
                  </div>
                </td>
                <td className="p-6 text-right">
                   <div className="flex items-center justify-end gap-3">
                      {editingId === user.id ? (
                        <button 
                          onClick={() => saveEdit(user.id)}
                          className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
                        >
                          <Check size={14}/>
                        </button>
                      ) : (
                        <button 
                          onClick={() => startEdit(user.id, user.name)}
                          className="p-2 hover:bg-white/10 rounded-lg text-neutral-600 hover:text-white transition-all"
                        >
                          <Edit2 size={14}/>
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-neutral-600 hover:text-red-500 transition-all active:scale-90"
                      >
                        <Trash2 size={14}/>
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* FOOTER STATS */}
        <div className="p-6 bg-white/[0.01] flex items-center justify-between">
           <p className="text-[9px] font-black uppercase text-neutral-600 tracking-widest">
             Registry Sync Complete // {filteredUsers.length} Entries Filtered
           </p>
           <div className="flex gap-2">
             <button className="h-8 w-8 flex items-center justify-center border border-white/5 rounded-lg text-[9px] font-black text-neutral-500 hover:text-white transition-colors">1</button>
           </div>
        </div>
      </div>
    </div>
  );
}