"use client";

import { useState, useEffect, Suspense, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  User, Eye, MessageSquare, Heart, TrendingUp, FileText, Settings, 
  Trash2, Smartphone, Loader2, BarChart3, Calendar, ExternalLink, 
  Globe, Lock, Search, MoreVertical, Edit3, Share2, Clock, 
  CheckSquare, Square, Download, Filter, ChevronDown, Sparkles,
  Zap, ShieldAlert, Cpu, Activity, ZapOff, Trophy, Send, CreditCard,
  CheckCircle2, XCircle, Pencil, Link as LinkIcon, MapPin, Fingerprint,
  Save
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import api from "@/config/api";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Configuration: Pricing Protocols ---
const PRICING_PLANS = [
  {
    id: "scholar-plan",
    name: "Scholar",
    price: 149,
    desc: "Occasional learner protocol.",
    features: ["Model A + B Access", "1 Premium AI Model", "90 Min Video Limit", "5 Batch Process"],
    color: "text-blue-400",
    border: "border-blue-500/20"
  },
  {
    id: "pro-scholar-plan",
    name: "Pro Scholar",
    price: 299,
    popular: true,
    desc: "Exam-ready synthesis engine.",
    features: ["All 5 AI Models", "4 Hour Video Limit", "20 Batch Process", "Flashcard Creator", "Priority Sync"],
    color: "text-red-500",
    border: "border-red-500/40"
  },
  {
    id: "power-institute-plan",
    name: "Power Institute",
    price: 599,
    desc: "Enterprise research grade.",
    features: ["8 Hour Video Limit", "Unlimited Batching", "Custom Branding", "Team Nodes", "Model Training"],
    color: "text-emerald-500",
    border: "border-emerald-500/20"
  }
];

function ProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams.get('tab') || 'analytics';
  
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Profile Form States
  const [profileForm, setProfileForm] = useState({
    bio: "",
    location: "",
    website: "",
    publicProfile: true
  });

  const getAuthToken = useCallback(() => (typeof window !== 'undefined' ? localStorage.getItem("authToken") : null), []);

  useEffect(() => {
    const token = getAuthToken();
    const userData = localStorage.getItem("user");
    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setProfileForm({
        bio: parsedUser.bio || "",
        location: parsedUser.location || "",
        website: parsedUser.website || "",
        publicProfile: parsedUser.publicProfile ?? true
      });
      setIsLoading(false);
    } else {
      router.push("/");
    }
  }, [getAuthToken, router]);

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    try {
      const { data } = await api.put("/auth/update-profile", profileForm, { 
        headers: { 'Auth': getAuthToken() } 
      });
      if (data.success) {
        const updatedUser = { ...user, ...profileForm };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        toast.success("Identity Protocol Updated");
      }
    } catch {
      toast.error("Handshake Failed: Update aborted");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-500/30 font-sans relative overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        <div className="absolute inset-0 bg-radial-gradient from-red-600/10 via-transparent to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-32 pb-20 relative z-10">
        
        {/* --- Personnel Header --- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12 p-8 md:p-12 rounded-[3rem] bg-neutral-900/30 border border-white/5 backdrop-blur-3xl shadow-2xl"
        >
          <div className="flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left">
            <div className="relative group">
              <div className="absolute inset-0 bg-red-600/30 blur-2xl rounded-full group-hover:bg-red-600/50 transition-all duration-700" />
              <Avatar className="h-28 w-28 md:h-32 md:w-32 border-4 border-red-600 relative z-10 shadow-2xl">
                <AvatarImage src={user?.picture} />
                <AvatarFallback className="bg-neutral-800 text-red-600 text-4xl font-black italic">{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-red-600 rounded-full border-4 border-black flex items-center justify-center shadow-lg z-20">
                <Trophy size={18} className="text-white" />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">{user?.name}</h1>
                <Badge className="bg-red-600 text-white border-none text-[10px] font-black px-3 py-1 shadow-[0_0_20px_rgba(220,38,38,0.4)]">ELITE PERSONNEL</Badge>
              </div>
              <p className="text-neutral-500 font-mono text-sm tracking-tight">{user?.email}</p>
              <div className="flex justify-center sm:justify-start gap-6 pt-4">
                 <StatusMini label="System Status" val="OPERATIONAL" color="text-emerald-500" />
                 <StatusMini label="Clearance" val="LEVEL 04" color="text-red-500" />
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
            <Button onClick={() => setActiveTab('billing')} className="bg-red-600 hover:bg-red-700 text-white font-black uppercase italic rounded-2xl h-16 px-10 shadow-xl active:scale-95 transition-all">
              <Zap size={18} className="mr-2" /> Upgrade Tier
            </Button>
          </div>
        </motion.div>

        {/* --- Navigation Tabs --- */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
          <TabsList className="bg-neutral-900/60 border border-white/5 p-1.5 rounded-[2rem] h-auto backdrop-blur-md flex flex-wrap justify-center sm:justify-start">
            <TabsTrigger value="analytics" className="flex-1 sm:flex-none data-[state=active]:bg-red-600 data-[state=active]:text-white text-neutral-500 font-black uppercase italic text-[10px] tracking-[0.2em] py-4 px-8 rounded-2xl transition-all">
              <Activity className="mr-2 h-4 w-4" /> Performance
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex-1 sm:flex-none data-[state=active]:bg-red-600 data-[state=active]:text-white text-neutral-500 font-black uppercase italic text-[10px] tracking-[0.2em] py-4 px-8 rounded-2xl transition-all">
              <FileText className="mr-2 h-4 w-4" /> Repository
            </TabsTrigger>
            <TabsTrigger value="identity" className="flex-1 sm:flex-none data-[state=active]:bg-red-600 data-[state=active]:text-white text-neutral-500 font-black uppercase italic text-[10px] tracking-[0.2em] py-4 px-8 rounded-2xl transition-all">
              <Fingerprint className="mr-2 h-4 w-4" /> Identity
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex-1 sm:flex-none data-[state=active]:bg-red-600 data-[state=active]:text-white text-neutral-500 font-black uppercase italic text-[10px] tracking-[0.2em] py-4 px-8 rounded-2xl transition-all">
              <CreditCard className="mr-2 h-4 w-4" /> Billing
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-1 sm:flex-none data-[state=active]:bg-red-600 data-[state=active]:text-white text-neutral-500 font-black uppercase italic text-[10px] tracking-[0.2em] py-4 px-8 rounded-2xl transition-all">
              <Settings className="mr-2 h-4 w-4" /> Config
            </TabsTrigger>
          </TabsList>

          {/* --- Identity Tab: Public Profile Management --- */}
          <TabsContent value="identity" className="outline-none">
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              
              {/* Form Side */}
              <div className="lg:col-span-8 space-y-6">
                <Card className="bg-neutral-900/40 border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl backdrop-blur-xl">
                  <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-6">
                    <div className="p-3 rounded-2xl bg-red-600/10 text-red-500 border border-red-600/20"><Pencil size={24}/></div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-black uppercase italic text-white tracking-widest">Public Persona Node</h3>
                      <p className="text-[10px] font-bold text-neutral-500 uppercase">Manage how other researchers see you.</p>
                    </div>
                  </div>

                  <div className="grid gap-8">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Bio / Intel Briefing</Label>
                      <Textarea 
                        placeholder="Tell the world about your research habits..." 
                        className="bg-black border-white/10 rounded-2xl min-h-[120px] focus:border-red-600/50 p-6 text-sm"
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Deployment Location</Label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
                          <Input 
                            placeholder="Pune, India" 
                            className="h-14 pl-12 bg-black border-white/10 rounded-xl focus:border-red-600/50" 
                            value={profileForm.location}
                            onChange={(e) => setProfileForm({...profileForm, location: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Digital Artifact Hub (Website)</Label>
                        <div className="relative">
                          <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
                          <Input 
                            placeholder="https://yourportfolio.com" 
                            className="h-14 pl-12 bg-black border-white/10 rounded-xl focus:border-red-600/50" 
                            value={profileForm.website}
                            onChange={(e) => setProfileForm({...profileForm, website: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-black/40 rounded-2xl border border-white/5">
                      <div className="space-y-1">
                        <p className="text-sm font-black uppercase italic tracking-tighter">Public Discovery</p>
                        <p className="text-[10px] text-neutral-500 uppercase">Allow other nodes to view your public intelligence repository.</p>
                      </div>
                      <Switch 
                        checked={profileForm.publicProfile}
                        onCheckedChange={(val) => setProfileForm({...profileForm, publicProfile: val})}
                        className="data-[state=checked]:bg-red-600"
                      />
                    </div>

                    <Button 
                      onClick={handleUpdateProfile}
                      disabled={isSaving}
                      className="h-16 bg-white text-black hover:bg-red-600 hover:text-white font-black uppercase italic rounded-2xl text-lg shadow-xl transition-all"
                    >
                      {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-5 w-5" />}
                      Sync Identity Node
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Preview Side */}
              <div className="lg:col-span-4 sticky top-24">
                <div className="text-center mb-6">
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-600">Handshake Preview</p>
                </div>
                <Card className="bg-neutral-950 border-white/10 rounded-[3rem] p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-5"><Globe size={100}/></div>
                   <div className="relative mx-auto w-fit">
                      <div className="absolute inset-0 bg-red-600/20 blur-xl rounded-full" />
                      <Avatar className="h-24 w-24 border-2 border-red-600 relative z-10">
                        <AvatarImage src={user?.picture} />
                        <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                      </Avatar>
                   </div>
                   <div className="space-y-2 relative z-10">
                      <h4 className="text-2xl font-black uppercase italic tracking-tighter">{user?.name}</h4>
                      <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">@{user?.username || 'researcher'}</p>
                      <p className="text-neutral-500 text-xs font-medium leading-relaxed italic px-4 mt-4">
                        {profileForm.bio || "No intelligence briefing provided..."}
                      </p>
                   </div>
                   <div className="flex flex-col gap-3 pt-6 border-t border-white/5 relative z-10">
                      {profileForm.location && (
                        <div className="flex items-center justify-center gap-2 text-neutral-400 text-[10px] font-bold uppercase">
                          <MapPin size={12} className="text-red-500" /> {profileForm.location}
                        </div>
                      )}
                      {profileForm.website && (
                        <div className="flex items-center justify-center gap-2 text-neutral-400 text-[10px] font-bold uppercase">
                          <Globe size={12} className="text-red-500" /> {profileForm.website.replace('https://', '')}
                        </div>
                      )}
                   </div>
                </Card>
              </div>

            </div>
          </TabsContent>

          {/* --- Analytics Tab: Performance Hub --- */}
          <TabsContent value="analytics" className="space-y-8 outline-none">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <HUDStat label="Total Nodes" val="124" icon={Cpu} color="text-red-500" />
              <HUDStat label="Read Access" val="1.2k" icon={Eye} color="text-orange-500" />
              <HUDStat label="Sync Rate" val="99%" icon={Zap} color="text-yellow-500" />
              <HUDStat label="Network" val="Global" icon={Globe} color="text-blue-500" />
              <HUDStat label="Uptime" val="420h" icon={Clock} color="text-emerald-500" />
              <HUDStat label="Security" val="AES" icon={ShieldAlert} color="text-neutral-500" />
            </div>
            <Card className="bg-neutral-950 border-white/5 rounded-[3rem] p-8 md:p-12 overflow-hidden shadow-2xl">
               <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 rounded-2xl bg-red-600/10 text-red-500 border border-red-600/20"><TrendingUp size={24}/></div>
                  <h3 className="text-xl font-black uppercase italic text-white tracking-widest">Knowledge Flux</h3>
               </div>
               <div className="h-[300px] w-full flex items-end justify-between gap-1 md:gap-3">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${Math.random() * 100}%` }} transition={{ delay: i * 0.05 }}
                      className="flex-1 bg-red-600/20 rounded-t-lg border-t border-red-600/40 hover:bg-red-600 transition-all cursor-crosshair" />
                  ))}
               </div>
            </Card>
          </TabsContent>

          {/* --- Repository: Notes --- */}
          <TabsContent value="notes" className="space-y-6 outline-none">
            <div className="flex flex-col sm:flex-row gap-4">
               <div className="relative flex-1">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-700" />
                  <Input placeholder="Search Encrypted Nodes..." className="h-16 pl-16 bg-neutral-950 border-white/10 rounded-2xl focus:border-red-600/50 text-white uppercase font-bold tracking-tight" />
               </div>
               <Button onClick={() => router.push("/")} className="h-16 bg-white text-black font-black uppercase italic rounded-2xl px-10 hover:bg-red-600 hover:text-white transition-all shadow-2xl">Create Protocol</Button>
            </div>
            
            <div className="grid gap-4">
              {isLoadingNotes ? <LoadingText /> : notes.length > 0 ? notes.map((note: any) => (
                <div key={note._id} className="group flex items-center gap-6 p-6 bg-neutral-950 border border-white/5 rounded-[2.5rem] hover:border-red-600/30 transition-all duration-500 shadow-xl">
                  <div className="h-20 w-32 rounded-2xl bg-neutral-900 border border-white/5 overflow-hidden relative shrink-0">
                    {note.thumbnail && <Image src={note.thumbnail} alt="t" fill className="object-cover opacity-60 group-hover:opacity-100 transition-opacity" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xl font-black text-white uppercase italic truncate group-hover:text-red-500 transition-colors">{note.title}</h4>
                    <div className="flex items-center gap-4 mt-2">
                       <Badge className="bg-white/5 text-neutral-500 border-white/10 text-[8px] font-black uppercase tracking-widest">{note.visibility}</Badge>
                       <span className="text-[10px] font-bold text-neutral-700 uppercase flex items-center gap-1"><Clock size={12}/> {new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-xl hover:bg-red-600 hover:text-white h-12 w-12 transition-all"><Edit3 size={18}/></Button>
                </div>
              )) : <div className="py-20 text-center text-neutral-700 font-black uppercase italic tracking-[0.4em]">Empty Repository</div>}
            </div>
          </TabsContent>

          {/* --- Billing Tab --- */}
          <TabsContent value="billing" className="outline-none">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {PRICING_PLANS.map((plan) => (
                <Card key={plan.id} className={cn("bg-neutral-950 border relative rounded-[3.5rem] p-10 transition-all duration-500 group flex flex-col", plan.popular ? "shadow-[0_0_60px_rgba(220,38,38,0.1)] border-red-600/40" : "border-white/5")}>
                  <div className="mb-10 space-y-2">
                    <h3 className={cn("text-3xl font-black uppercase italic tracking-tighter", plan.color)}>{plan.name}</h3>
                    <p className="text-neutral-500 text-xs font-medium uppercase tracking-widest">{plan.desc}</p>
                  </div>
                  <div className="mb-10"><span className="text-5xl font-black text-white italic">₹{plan.price}</span></div>
                  <div className="space-y-4 mb-12 flex-1">
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-3"><CheckCircle2 className={cn("shrink-0", plan.color)} size={16} /><span className="text-xs font-bold text-neutral-400 uppercase tracking-tight">{f}</span></div>
                    ))}
                  </div>
                  <Button className={cn("w-full h-16 rounded-[2rem] font-black uppercase italic text-lg tracking-widest shadow-2xl transition-all active:scale-95", plan.popular ? "bg-red-600 hover:bg-red-700 text-white" : "bg-neutral-900 hover:bg-white hover:text-black text-neutral-400")}>Initialize</Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* --- Config: Settings & Hard Reset --- */}
          <TabsContent value="settings" className="outline-none max-w-2xl">
            <Card className="bg-neutral-900 border-red-600/30 rounded-[3rem] overflow-hidden shadow-2xl">
               <div className="bg-red-600/10 p-10 border-b border-white/5 flex items-center gap-6">
                  <div className="h-16 w-16 rounded-full bg-red-600/20 border border-red-600 flex items-center justify-center text-red-600 shadow-[0_0_20px_rgba(220,38,38,0.2)]"><ShieldAlert size={32} /></div>
                  <div>
                    <h3 className="text-2xl font-black uppercase italic text-white leading-none">Hard Reset Protocol</h3>
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-2">DANGER: NON-RECOVERABLE ACTION</p>
                  </div>
               </div>
               <CardContent className="p-10 space-y-8">
                  <p className="text-neutral-400 text-sm leading-relaxed font-medium uppercase tracking-tight">Initializing this command will purge all encrypted neural notes, account metadata, and transaction tokens.</p>
                  <Button variant="destructive" className="bg-red-600 hover:bg-red-700 font-black uppercase italic rounded-[2rem] w-full h-16 text-lg tracking-widest shadow-xl active:scale-95 transition-all">Authorize total wipe</Button>
               </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}

/* --- Helpers --- */

const HUDStat = ({ label, val, icon: Icon, color }: any) => (
  <div className="bg-neutral-950 border border-white/5 p-5 rounded-[2rem] group hover:border-red-600/40 transition-all duration-500">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-2 rounded-xl bg-black border border-white/5 shadow-inner", color)}><Icon size={18}/></div>
      <div className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
    </div>
    <p className="text-[8px] font-black text-neutral-700 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-2xl font-black text-white italic leading-none">{val}</p>
  </div>
);

const StatusMini = ({ label, val, color }: any) => (
  <div>
    <p className="text-[8px] font-black text-neutral-700 uppercase tracking-widest">{label}</p>
    <p className={cn("text-xs font-bold uppercase italic", color)}>{val}</p>
  </div>
);

const LoadingScreen = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="flex flex-col items-center gap-6">
      <div className="h-20 w-20 border-4 border-red-600 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(220,38,38,0.2)]" />
      <p className="text-red-600 font-black uppercase italic tracking-[0.5em] text-xs animate-pulse">Initializing Identity Vault...</p>
    </div>
  </div>
);

const LoadingText = () => <div className="py-24 text-center text-red-600 font-black italic uppercase tracking-[0.4em] animate-pulse text-[10px]">Accessing Secure Node...</div>;

export default function ProfilePage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ProfileContent />
    </Suspense>
  );
}