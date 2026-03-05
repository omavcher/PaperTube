"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, UserPlus, FileText, CheckCircle2, 
  PlayCircle, Eye, Crown, Copy, TerminalSquare, MessageSquare
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

export default function FakerDashboard() {
  const [activeTab, setActiveTab] = useState<"users" | "notes" | "comments">("users");
  
  // User State
  const [fakeUsers, setFakeUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Loading States
  const [loading, setLoading] = useState(false);
  const [promptLoading, setPromptLoading] = useState(false);

  // Users Tab Form
  const [newFakerNames, setNewFakerNames] = useState("");
  const [editStats, setEditStats] = useState({ xp: 0, streak: 0, rank: "basic" });
  const [followerCount, setFollowerCount] = useState(5);

  // Note Injection Tab
  const [noteForm, setNoteForm] = useState({
    videoUrl: "",
    title: "",
    type: "free", 
    detailLevel: "Standard", 
    content: "<h1>Start typing here...</h1>"
  });
  const [generatedPrompt, setGeneratedPrompt] = useState("");

  // Comments Tab
  const [commentNoteId, setCommentNoteId] = useState("");
  const [commentNoteTitle, setCommentNoteTitle] = useState("");
  const [noteSearchStr, setNoteSearchStr] = useState("");
  const [foundNotes, setFoundNotes] = useState<any[]>([]);
  const [bulkComments, setBulkComments] = useState("Awesome note!\nThis really helped me.\nGreat explanation.");
  const [smmLikes, setSmmLikes] = useState(0);
  const [smmViews, setSmmViews] = useState(0);

  // --- API: USERS ---
  const fetchFakeUsers = async () => {
    try {
      const res = await api.get("/admin/faker/users", { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });
      if (res.data.success) {
        setFakeUsers(res.data.data);
        if (res.data.data.length > 0 && !selectedUser) setSelectedUser(res.data.data[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { 
    if (selectedUser) {
      setEditStats({ xp: selectedUser.xp || 0, streak: selectedUser.streak?.count || 0, rank: selectedUser.rank || 'basic' });
    }
  }, [selectedUser]);

  useEffect(() => { fetchFakeUsers(); }, []);

  const handleCreateUsers = async () => {
    if(!newFakerNames.trim()) return toast.error("Enter at least one name");
    setLoading(true);
    try {
      const names = newFakerNames.split(",").map(n => n.trim()).filter(Boolean);
      await api.post("/admin/faker/users/create", { names }, { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });
      toast.success("Users Created");
      setNewFakerNames("");
      fetchFakeUsers();
    } catch (e) { 
      toast.error("Failed to create users");
    } finally { 
      setLoading(false); 
    }
  };

  const handleUpdateStats = async () => {
    if(!selectedUser) return toast.error("Select user");
    setLoading(true);
    try {
      const res = await api.put("/admin/faker/users/stats", {
        userId: selectedUser._id,
        xp: Number(editStats.xp),
        streakCount: Number(editStats.streak),
        rank: editStats.rank
      }, { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });
      toast.success("Stats Updated");
      setSelectedUser(res.data.data);
      setFakeUsers(prev => prev.map(u => u._id === selectedUser._id ? res.data.data : u));
    } catch (e) {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFollowers = async () => {
    if(!selectedUser) return toast.error("Select user");
    setLoading(true);
    try {
      const res = await api.post("/admin/faker/users/followers", {
        targetUserId: selectedUser._id,
        count: followerCount
      }, { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });
      toast.success(res.data.message);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to add followers");
    } finally {
      setLoading(false);
    }
  };

  // --- API: NOTES ---
  const handleExtractPrompt = async () => {
    if (!noteForm.videoUrl) return toast.error("Enter YouTube URL First");
    setPromptLoading(true);
    try {
      const res = await api.post("/admin/faker/prompt", { videoUrl: noteForm.videoUrl }, { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });
      setGeneratedPrompt(res.data.prompt);
      setNoteForm(prev => ({ ...prev, title: res.data.title }));
      toast.success("Prompt Extracted! Copy it to ChatGPT.");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Prompt retrieval failed");
    } finally {
      setPromptLoading(false);
    }
  };

  const handleInjectNote = async () => {
    if (!selectedUser) return toast.error("Select an Owner User from the left");
    if (!noteForm.videoUrl || !noteForm.content) return toast.error("Fill required note fields");

    setLoading(true);
    try {
      await api.post("/admin/faker/inject", {
        userId: selectedUser._id,
        data: noteForm 
      }, { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });
      toast.success("Note Injected Successfully!");
      setNoteForm({ ...noteForm, title: "", videoUrl: "", content: "" }); 
    } catch (e) {
      toast.error("Injection Failed");
    } finally {
      setLoading(false);
    }
  };

  // --- API: COMMENTS ---
  const handleSubmitComments = async () => {
    if (!commentNoteId) return toast.error("Enter Target Note ID");
    const arr = bulkComments.split('\n').map(c => c.trim()).filter(Boolean);
    
    // We can allow empty text if they just want views/likes
    if (!arr.length && !smmLikes && !smmViews) return toast.error("Enter comments, likes, or views");

    setLoading(true);
    try {
      const res = await api.post("/admin/faker/comments/bulk", {
        noteId: commentNoteId,
        comments: arr,
        likes: smmLikes,
        views: smmViews
      }, { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });
      toast.success(res.data.message);
      setCommentNoteId("");
      setCommentNoteTitle("");
      setBulkComments("");
      setSmmLikes(0);
      setSmmViews(0);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to inject comments");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchNotes = async (query: string) => {
    setNoteSearchStr(query);
    if (!query.trim()) return setFoundNotes([]);
    try {
      const res = await api.get(`/admin/faker/notes/search?query=${query}`, { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });
      if (res.data.success) {
        setFoundNotes(res.data.data);
      }
    } catch(e) { }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans pb-32">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">
            Faker <span className="text-red-600">Studio</span>
          </h1>
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mt-1">
            Manual Entity Injection System
          </p>
        </div>
        
        {/* Navigation */}
        <div className="flex bg-[#111] p-1 rounded-xl border border-white/5">
          <button onClick={() => setActiveTab('users')} className={cn("px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2", activeTab === 'users' ? "bg-white text-black" : "text-neutral-500 hover:text-white")}>
            <Users size={14} /> User Control
          </button>
          <button onClick={() => setActiveTab('notes')} className={cn("px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2", activeTab === 'notes' ? "bg-white text-black" : "text-neutral-500 hover:text-white")}>
            <FileText size={14} /> Note Injection
          </button>
          <button onClick={() => setActiveTab('comments')} className={cn("px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2", activeTab === 'comments' ? "bg-white text-black" : "text-neutral-500 hover:text-white")}>
            <MessageSquare size={14} /> Comments SMM
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">
        
        {/* --- LEFT HAND: PERSISTENT USERS LIST --- */}
        <div className="lg:col-span-3 flex flex-col gap-4 bg-[#0a0a0a] border border-white/10 rounded-2xl p-4 overflow-hidden h-full">
          <h3 className="text-[10px] font-bold text-neutral-500 uppercase flex items-center gap-2"><Crown size={12} className="text-red-500" /> Faker Accounts ({fakeUsers.length})</h3>
          
          <div className="flex gap-2">
            <Input 
              value={newFakerNames} 
              onChange={e => setNewFakerNames(e.target.value)} 
              placeholder="Names (comma separated)" 
              className="h-8 text-[10px] bg-[#111] border-white/10" 
            />
            <Button size="sm" onClick={handleCreateUsers} disabled={loading} className="h-8 px-3 text-[10px] bg-red-600 hover:bg-red-700 text-white font-bold whitespace-nowrap">
              <UserPlus size={12} />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
            {fakeUsers.map(user => (
              <div key={user._id} onClick={() => setSelectedUser(user)}
                className={cn("p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-all", selectedUser?._id === user._id ? "bg-red-900/20 border-red-600/50" : "bg-[#111] border-white/5 hover:bg-white/5")}>
                <div className="flex items-center gap-2 overflow-hidden">
                  <Avatar className="h-6 w-6 rounded-md"><AvatarImage src={user.picture} /></Avatar>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-neutral-200 truncate">{user.name}</p>
                    <p className="text-[9px] text-neutral-500 truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- RIGHT HAND: DYNAMIC CONTENT AREA --- */}
        <div className="lg:col-span-9 flex flex-col gap-5 h-full overflow-hidden">
           
           {/* TAB: USERS & STATS */}
           {activeTab === 'users' && (
             <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 h-full space-y-8 overflow-y-auto">
                <h2 className="text-lg font-black uppercase tracking-tight border-b border-white/10 pb-4">User Statistics Engine</h2>
                
                {selectedUser ? (
                  <div className="space-y-8">
                    {/* Stat Editor */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase">XP Points</label>
                        <Input type="number" value={editStats.xp} onChange={e => setEditStats({...editStats, xp: Number(e.target.value)})} className="bg-[#111] border-white/10 font-mono" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase">Streak Count</label>
                        <Input type="number" value={editStats.streak} onChange={e => setEditStats({...editStats, streak: Number(e.target.value)})} className="bg-[#111] border-white/10 font-mono" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase">Rank</label>
                        <Select value={editStats.rank} onValueChange={(v) => setEditStats({...editStats, rank: v})}>
                          <SelectTrigger className="bg-[#111] border-white/10"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                            <SelectItem value="master">Master</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={handleUpdateStats} disabled={loading} className="bg-white text-black hover:bg-gray-200 text-xs font-bold w-full md:w-auto">Update User Identity</Button>

                    <div className="h-px bg-white/10 w-full my-6"></div>

                    {/* Follower Bot */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-white uppercase"><Users size={14} className="inline mr-2 text-blue-500" /> Bot Follower Injection</h3>
                      <p className="text-xs text-neutral-500">Inject fake users as followers to realistically boost "{selectedUser.name}"'s community presence.</p>
                      
                      <div className="flex items-end gap-4 max-w-sm">
                        <div className="space-y-2 flex-1">
                          <label className="text-[10px] font-bold text-neutral-500 uppercase">Bot Count</label>
                          <Input type="number" value={followerCount} onChange={e => setFollowerCount(Number(e.target.value))} className="bg-[#111] border-white/10" />
                        </div>
                        <Button onClick={handleAddFollowers} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">Inject Followers</Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-neutral-500 text-sm italic py-20 text-center border-2 border-dashed border-white/5 rounded-xl">Select a Target User from the left panel to manipulate their data.</div>
                )}
             </div>
           )}

           {/* TAB: NOTES INJECTOR */}
           {activeTab === 'notes' && (
             <div className="flex flex-col gap-4 h-full">
                
                {/* Top Half: Extractor */}
                <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6">
                  <h3 className="text-sm font-bold uppercase mb-4 flex items-center gap-2"><TerminalSquare size={16} className="text-purple-500" /> 1. Generate Prompt</h3>
                  <div className="flex gap-4 items-end">
                    <div className="space-y-2 flex-1 relative">
                       <PlayCircle size={16} className="absolute left-3 top-9 text-neutral-500" />
                       <label className="text-[10px] font-bold text-neutral-500 uppercase">YouTube Link</label>
                       <Input value={noteForm.videoUrl} onChange={e => setNoteForm({...noteForm, videoUrl: e.target.value})} placeholder="https://youtube.com/watch?v=..." className="bg-[#111] border-white/10 pl-10" />
                    </div>
                    <Button onClick={handleExtractPrompt} disabled={promptLoading} className="bg-purple-600 hover:bg-purple-700 text-white font-bold w-40">
                      {promptLoading ? "Extracting..." : "Get AI Prompt"}
                    </Button>
                  </div>
                  
                  {generatedPrompt && (
                    <div className="mt-4 relative bg-[#111] border border-white/10 rounded-xl p-4">
                      <Button size="icon" variant="ghost" className="absolute top-2 right-2 text-white/50 hover:text-white" onClick={() => { navigator.clipboard.writeText(generatedPrompt); toast.success("Copied!"); }}>
                        <Copy size={16} />
                      </Button>
                      <pre className="text-[10px] font-mono whitespace-pre-wrap text-blue-300 max-h-40 overflow-y-auto custom-scrollbar pr-10">{generatedPrompt}</pre>
                    </div>
                  )}
                </div>

                {/* Bottom Half: HTML Paste & Inject */}
                <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 flex flex-col flex-1 overflow-hidden">
                   <h3 className="text-sm font-bold uppercase mb-4 flex items-center gap-2"><FileText size={16} className="text-green-500" /> 2. Manual HTML Injection</h3>
                   
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                     <div className="space-y-2">
                       <label className="text-[10px] font-bold text-neutral-500 uppercase">Note Title</label>
                       <Input value={noteForm.title} onChange={(e) => setNoteForm({...noteForm, title: e.target.value})} placeholder="Video Title" className="bg-[#111] border-white/10" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase">Access Type</label>
                        <Select value={noteForm.type} onValueChange={(v) => setNoteForm({...noteForm, type: v})}>
                          <SelectTrigger className="bg-[#111] border-white/10"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="free">Free</SelectItem><SelectItem value="premium">Premium</SelectItem></SelectContent>
                        </Select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase">Detail Level</label>
                        <Select value={noteForm.detailLevel} onValueChange={(v) => setNoteForm({...noteForm, detailLevel: v})}>
                          <SelectTrigger className="bg-[#111] border-white/10"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="Short">Short</SelectItem><SelectItem value="Standard">Standard</SelectItem><SelectItem value="Comprehensive">Comprehensive</SelectItem></SelectContent>
                        </Select>
                     </div>
                   </div>

                   <Textarea 
                      value={noteForm.content} 
                      onChange={e => setNoteForm({...noteForm, content: e.target.value})} 
                      className="flex-1 bg-[#111] border-white/10 font-mono text-xs text-neutral-300 min-h-0 resize-none focus-visible:ring-1 focus-visible:ring-green-600 mb-4 p-4"
                      placeholder="Paste final HTML from ChatGPT here..."
                   />

                   <div className="flex items-center justify-between">
                     <div className="text-xs text-neutral-500">Injecting as: <strong className="text-white">{selectedUser?.name || "NONE_SELECTED"}</strong></div>
                     <Button onClick={handleInjectNote} disabled={loading || !noteForm.content.trim()} className="bg-green-600 hover:bg-green-700 font-bold uppercase tracking-widest px-8">
                       Deploy Note
                     </Button>
                   </div>
                </div>

             </div>
           )}

           {/* TAB: COMMENTS INJECTOR */}
           {activeTab === 'comments' && (
             <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 h-full flex flex-col space-y-6">
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight border-b border-white/10 pb-4 flex items-center gap-2">
                    <MessageSquare className="text-orange-500" /> SMM Comment Panel
                  </h2>
                  <p className="text-xs text-neutral-400 mt-2">Deploy a mass array of fake comments across target nodes.</p>
                </div>

                <div className="space-y-4 max-w-sm relative z-50">
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-neutral-500 uppercase">Search Target Note</label>
                     <Input 
                        value={noteSearchStr} 
                        onChange={e => handleSearchNotes(e.target.value)} 
                        placeholder="Search by note title..." 
                        className="bg-[#111] border-white/10 text-xs" 
                     />
                   </div>

                   {/* Dropdown Suggestions */}
                   {foundNotes.length > 0 && (
                     <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl overflow-hidden">
                       {foundNotes.map(n => (
                         <div 
                           key={n._id} 
                           onClick={() => {
                             setCommentNoteId(n._id);
                             setCommentNoteTitle(n.title);
                             setNoteSearchStr("");
                             setFoundNotes([]);
                           }}
                           className="p-3 text-xs border-b border-white/5 hover:bg-white/5 cursor-pointer line-clamp-1"
                         >
                           {n.title}
                         </div>
                       ))}
                     </div>
                   )}

                   {/* Selected Visualizer */}
                   {commentNoteTitle && (
                     <div className="p-3 bg-orange-900/20 border border-orange-500/50 rounded-lg text-xs flex justify-between items-center">
                       <span className="text-orange-200 line-clamp-1 break-all pr-2 font-bold">{commentNoteTitle}</span>
                       <button onClick={() => {setCommentNoteId(""); setCommentNoteTitle("");}} className="text-orange-500 hover:text-orange-400 font-bold">&times;</button>
                     </div>
                   )}
                </div>

                {/* LIKE & VIEW INJECTION */}
                <div className="grid grid-cols-2 gap-4 max-w-sm">
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-neutral-500 uppercase">Bots to Like Note</label>
                     <Input type="number" value={smmLikes} onChange={e => setSmmLikes(Number(e.target.value))} className="bg-[#111] border-white/10" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-neutral-500 uppercase">Bot View Impressions</label>
                     <Input type="number" value={smmViews} onChange={e => setSmmViews(Number(e.target.value))} className="bg-[#111] border-white/10" />
                   </div>
                </div>

                <div className="space-y-2 flex-1 flex flex-col">
                   <div className="flex justify-between items-end">
                     <label className="text-[10px] font-bold text-neutral-500 uppercase">Comment Array (1 per line)</label>
                     <Badge variant="outline" className="text-[9px] bg-[#111] border-white/10 text-neutral-400">{bulkComments.split('\n').filter(c => c.trim()).length} Ready</Badge>
                   </div>
                   <Textarea 
                     value={bulkComments} 
                     onChange={e => setBulkComments(e.target.value)} 
                     className="flex-1 bg-[#111] border-white/10 text-sm text-neutral-300 resize-none focus-visible:ring-1 focus-visible:ring-orange-500 p-4"
                     placeholder="Great resource!&#10;Thanks for this.&#10;This is really helpful!"
                   />
                </div>

                <div className="flex justify-end pt-4 border-t border-white/10">
                  <Button onClick={handleSubmitComments} disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white font-bold uppercase tracking-widest px-8">
                    Execute Mass Spam
                  </Button>
                </div>
             </div>
           )}

        </div>
      </div>
    </div>
  );
}