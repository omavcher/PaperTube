"use client";

import { useState, useEffect, Suspense, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  User, 
  Eye,
  MessageSquare,
  Heart,
  TrendingUp,
  FileText,
  Settings, 
  Trash2,
  Smartphone,
  Loader2,
  BarChart3,
  Calendar,
  ExternalLink,
  Globe,
  Lock,
  Search,
  MoreVertical,
  Edit3,
  Share2,
  Clock,
  CheckSquare,
  Square,
  Download,
  Filter,
  ChevronDown
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/config/api";
import { ActivityCalendar } from "@/components/ui/activity-calendar";
import { SimpleChart, BarChart } from "@/components/ui/simple-chart";
import Image from "next/image";

interface UserData {
  name: string;
  email: string;
  picture: string;
  mobile?: string;
  _id?: string;
}

interface AnalyticsData {
  summary: {
    totalNotes: number;
    totalViews: number;
    totalComments: number;
    totalReplies: number;
    totalLikes: number;
    totalEngagement: number;
    publicNotes: number;
    privateNotes: number;
  };
  viewsOverTime: Array<{ date: string; views: number }>;
  notesOverTime: Array<{ month: string; count: number }>;
  activityData: Array<{ date: string; count: number }>;
  topNotes: Array<{
    id: string;
    title: string;
    slug: string;
    thumbnail: string;
    views: number;
    comments: number;
    likes: number;
    engagement: number;
  }>;
}

interface Note {
  _id: string;
  title: string;
  thumbnail?: string;
  visibility: 'public' | 'private' | 'unlisted';
  createdAt: string;
  updatedAt: string;
  views: number;
  commentsCount: number;
  likesCount: number;
  slug: string;
  fileType?: string;
  pdf_data?: {
    downloadUrl?: string;
    fileSize?: number;
  };
}

interface NotesResponse {
  data: Note[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function ProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams.get('tab') || 'analytics';
  
  const [user, setUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // My Notes states
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [deleteNoteDialogOpen, setDeleteNoteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [isDeletingNote, setIsDeletingNote] = useState(false);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all");

  // Get auth token with memoization
  const getAuthToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("authToken");
    }
    return null;
  }, []);

  // Update URL when tab changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', activeTab);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [activeTab, router, searchParams]);

  // Initialize user data
  useEffect(() => {
    const initializeUser = async () => {
      const token = getAuthToken();
      const userData = localStorage.getItem("user");
      
      if (token && userData) {
        try {
          const userObj = JSON.parse(userData);
          setUser(userObj);
          setIsLoading(false);
        } catch (error) {
          console.error("Error parsing user data:", error);
          router.push("/");
        }
      } else {
        router.push("/");
      }
    };

    initializeUser();
  }, [getAuthToken, router]);

  // Fetch analytics when analytics tab is active
  useEffect(() => {
    if (activeTab === 'analytics' && !analytics && !isLoadingAnalytics) {
      fetchAnalytics();
    }
  }, [activeTab, analytics, isLoadingAnalytics]);

  // Fetch notes when notes tab is active or filters change
  useEffect(() => {
    if (activeTab === 'notes') {
      fetchUserNotes();
    }
  }, [activeTab, sortBy, sortOrder]);

  // Optimized analytics fetch with caching
  const fetchAnalytics = async () => {
    if (isLoadingAnalytics) return;
    
    setIsLoadingAnalytics(true);
    try {
      const token = getAuthToken();
      const response = await api.get("/notes/analytics", {
        headers: { 'Auth': token },
        timeout: 10000
      });
      
      if (response.data?.success && response.data?.data) {
        setAnalytics(response.data.data);
      }
    } catch (error: any) {
      console.error("❌ Error fetching analytics:", error);
      if (error.code === 'ECONNABORTED') {
        toast.error("Analytics request timed out");
      } else {
        toast.error("Failed to load analytics data");
      }
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  // Optimized notes fetch with error handling
  const fetchUserNotes = async () => {
    if (isLoadingNotes) return;
    
    setIsLoadingNotes(true);
    try {
      const token = getAuthToken();
      const params = new URLSearchParams({
        sortBy,
        sortOrder,
        ...(searchQuery && { search: searchQuery })
      });

      const response = await api.get(`/notes/my-notes?${params}`, {
        headers: { 'Auth': token },
        timeout: 8000
      });
      
      if (response.data?.success) {
        setNotes(response.data.data || []);
      } else {
        throw new Error(response.data?.message || "Failed to fetch notes");
      }
    } catch (error: any) {
      console.error("❌ Error fetching notes:", error);
      if (error.code === 'ECONNABORTED') {
        toast.error("Notes request timed out");
      } else {
        toast.error("Failed to load your notes");
      }
      setNotes([]);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'notes') {
        fetchUserNotes();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, activeTab]);

  // Memoized filtered notes
  const filteredNotes = useMemo(() => {
    let filtered = notes;
    
    if (visibilityFilter !== 'all') {
      filtered = filtered.filter(note => note.visibility === visibilityFilter);
    }
    
    return filtered;
  }, [notes, visibilityFilter]);

  // Optimized note selection
  const toggleNoteSelection = useCallback((noteId: string) => {
    setSelectedNotes(prev =>
      prev.includes(noteId)
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  }, []);

  // Select all functionality
  const toggleSelectAll = useCallback(() => {
    setSelectedNotes(prev =>
      prev.length === filteredNotes.length ? [] : filteredNotes.map(note => note._id)
    );
  }, [filteredNotes]);

  // Optimized single note deletion
  const handleDeleteNote = async (noteId: string) => {
    setIsDeletingNote(true);
    try {
      const token = getAuthToken();
      const response = await api.delete(`/notes/${noteId}`, {
        headers: { 'Auth': token }
      });

      if (response.data?.success) {
        toast.success("Note deleted successfully");
        setNotes(prev => prev.filter(note => note._id !== noteId));
        setSelectedNotes(prev => prev.filter(id => id !== noteId));
        
        // Refresh analytics if on analytics tab
        if (activeTab === 'analytics') {
          setAnalytics(null);
        }
      } else {
        throw new Error(response.data?.message || "Failed to delete note");
      }
    } catch (error) {
      console.error("❌ Error deleting note:", error);
      toast.error("Failed to delete note");
    } finally {
      setIsDeletingNote(false);
      setDeleteNoteDialogOpen(false);
      setNoteToDelete(null);
    }
  };

  // Optimized bulk deletion using the new endpoint
  const handleDeleteMultiple = async () => {
    if (selectedNotes.length === 0) return;

    setIsDeletingNote(true);
    try {
      const token = getAuthToken();
      const response = await api.post("/notes/bulk-delete", 
        { noteIds: selectedNotes },
        { headers: { 'Auth': token } }
      );

      if (response.data?.success) {
        toast.success(response.data.message || `Deleted ${selectedNotes.length} note(s) successfully`);
        setNotes(prev => prev.filter(note => !selectedNotes.includes(note._id)));
        setSelectedNotes([]);
        
        // Refresh analytics if on analytics tab
        if (activeTab === 'analytics') {
          setAnalytics(null);
        }
      } else {
        throw new Error(response.data?.message || "Failed to delete notes");
      }
    } catch (error) {
      console.error("❌ Error deleting notes:", error);
      toast.error("Failed to delete notes");
    } finally {
      setIsDeletingNote(false);
      setDeleteNoteDialogOpen(false);
    }
  };

  // Update note visibility
  const updateNoteVisibility = async (noteId: string, visibility: 'public' | 'private' | 'unlisted') => {
    try {
      const token = getAuthToken();
      const response = await api.patch(`/notes/${noteId}/visibility`, 
        { visibility },
        { headers: { 'Auth': token } }
      );

      if (response.data?.success) {
        toast.success("Note visibility updated");
        setNotes(prev => prev.map(note => 
          note._id === noteId ? { ...note, visibility } : note
        ));
      } else {
        throw new Error(response.data?.message || "Failed to update visibility");
      }
    } catch (error) {
      console.error("❌ Error updating visibility:", error);
      toast.error("Failed to update note visibility");
    }
  };

  // Format date with memoization
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  // Format file size
  const formatFileSize = useCallback((bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  }, []);

  const handleBackToHome = () => router.push("/");
  const handleUpgrade = () => router.push("/pricing");

  // Delete Account Function
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const token = getAuthToken();
      
      if (!token) {
        toast.error("Authentication token not found");
        return;
      }

      const response = await api.delete("/auth/delete-account", {
        headers: { 'Auth': token }
      });

      if (response.data.success) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        localStorage.removeItem("planStatus");
        
        toast.success("Account deleted successfully");
        setTimeout(() => router.push("/"), 1000);
      } else {
        throw new Error(response.data.message || "Failed to delete account");
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-lg flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading your profile...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-lg">Please log in to view your profile</div>
        <Button 
          onClick={() => router.push("/login")}
          className="ml-4 bg-blue-600 hover:bg-blue-700"
        >
          Login
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-neutral-900 border-neutral-700 max-w-md mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Delete Your Account?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-400">
              This action cannot be undone. This will permanently delete your account 
              and remove all your data including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Your profile information</li>
                <li>All your notes and content</li>
                <li>Your transaction history</li>
                <li>All conversation data</li>
              </ul>
              <p className="mt-3 text-red-400 font-semibold">
                You will be logged out and redirected to the home page.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel 
              className="bg-neutral-800 text-white border-neutral-600 hover:bg-neutral-700 flex-1"
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600 flex-1"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Yes, Delete Account"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Note Confirmation Dialog */}
      <AlertDialog open={deleteNoteDialogOpen} onOpenChange={setDeleteNoteDialogOpen}>
        <AlertDialogContent className="bg-neutral-900 border-neutral-700 max-w-md mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              {noteToDelete ? "Delete Note?" : `Delete ${selectedNotes.length} Note(s)?`}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-400">
              {noteToDelete 
                ? "This action cannot be undone. This will permanently delete your note and all its content."
                : `This action cannot be undone. This will permanently delete ${selectedNotes.length} selected notes.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel 
              className="bg-neutral-800 text-white border-neutral-600 hover:bg-neutral-700 flex-1"
              disabled={isDeletingNote}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => noteToDelete ? handleDeleteNote(noteToDelete) : handleDeleteMultiple()}
              disabled={isDeletingNote}
              className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600 flex-1"
            >
              {isDeletingNote ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Yes, Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="min-h-screen pt-20 pb-10 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 md:h-20 md:w-20 border-2 border-neutral-600">
                <AvatarImage src={user.picture} alt={user.name} />
                <AvatarFallback className="bg-neutral-700 text-neutral-300 text-xl md:text-2xl">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">{user.name}</h1>
                <p className="text-neutral-400 text-sm md:text-base">{user.email}</p>
                {user.mobile && (
                  <p className="text-neutral-500 text-sm flex items-center gap-1 mt-1">
                    <Smartphone className="h-3 w-3" />
                    {user.mobile}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={handleUpgrade}
                className="bg-green-600 hover:bg-green-500 text-white"
              >
                Upgrade Plan
              </Button>
              <Button 
                onClick={handleBackToHome}
                variant="outline"
                className="border-neutral-600 text-white hover:bg-neutral-800"
              >
                Back to Home
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 md:space-y-8">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 bg-neutral-900 p-1 gap-1">
              <TabsTrigger 
                value="analytics" 
                className="flex items-center gap-2 data-[state=active]:bg-neutral-700 text-white text-xs md:text-sm py-2"
              >
                <BarChart3 className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger 
                value="notes" 
                className="flex items-center gap-2 data-[state=active]:bg-neutral-700 text-white text-xs md:text-sm py-2"
              >
                <FileText className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">My Notes</span>
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="flex items-center gap-2 data-[state=active]:bg-neutral-700 text-white text-xs md:text-sm py-2"
              >
                <Settings className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              {isLoadingAnalytics ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              ) : analytics ? (
                <AnalyticsView analytics={analytics} />
              ) : (
                <Card className="bg-neutral-900 border-neutral-700">
                  <CardContent className="p-12 text-center">
                    <p className="text-neutral-400">No analytics data available</p>
                    <Button 
                      onClick={fetchAnalytics}
                      className="mt-4 bg-green-600 hover:bg-green-500"
                    >
                      Load Analytics
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* My Notes Tab */}
            <TabsContent value="notes" className="space-y-6">
              <NotesView
                notes={filteredNotes}
                isLoading={isLoadingNotes}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedNotes={selectedNotes}
                toggleNoteSelection={toggleNoteSelection}
                toggleSelectAll={toggleSelectAll}
                setDeleteNoteDialogOpen={setDeleteNoteDialogOpen}
                setNoteToDelete={setNoteToDelete}
                router={router}
                formatDate={formatDate}
                formatFileSize={formatFileSize}
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                visibilityFilter={visibilityFilter}
                setVisibilityFilter={setVisibilityFilter}
                updateNoteVisibility={updateNoteVisibility}
              />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card className="bg-neutral-900 border-neutral-700 border-red-500/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-400 text-lg md:text-xl">
                    <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                    Danger Zone
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-neutral-400 text-sm">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button 
                      variant="destructive" 
                      className="bg-red-600 hover:bg-red-700 w-full md:w-auto"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

// Separate Analytics Component for better performance
const AnalyticsView = ({ analytics }: { analytics: AnalyticsData }) => (
  <>
    {/* Summary Cards */}
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      <SummaryCard 
        title="Total Notes" 
        value={analytics.summary.totalNotes} 
        icon={FileText}
        color="text-blue-400"
      />
      <SummaryCard 
        title="Total Views" 
        value={analytics.summary.totalViews.toLocaleString()} 
        icon={Eye}
        color="text-green-400"
      />
      <SummaryCard 
        title="Comments" 
        value={analytics.summary.totalComments} 
        icon={MessageSquare}
        color="text-yellow-400"
      />
      <SummaryCard 
        title="Likes" 
        value={analytics.summary.totalLikes} 
        icon={Heart}
        color="text-red-400"
      />
      <SummaryCard 
        title="Engagement" 
        value={analytics.summary.totalEngagement} 
        icon={TrendingUp}
        color="text-purple-400"
      />
      <SummaryCard 
        title="Public" 
        value={analytics.summary.publicNotes} 
        icon={Globe}
        color="text-cyan-400"
      />
      <SummaryCard 
        title="Private" 
        value={analytics.summary.privateNotes} 
        icon={Lock}
        color="text-orange-400"
      />
    </div>

    {/* Charts Row */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard
        title="Views Over Time (Last 30 Days)"
        description="Daily view count for your notes"
        icon={Eye}
        iconColor="text-green-400"
      >
        <SimpleChart
          data={analytics.viewsOverTime.map(d => ({
            label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: d.views
          }))}
          color="#22c55e"
          height={200}
        />
      </ChartCard>

      <ChartCard
        title="Notes Created (Last 12 Months)"
        description="Monthly note creation statistics"
        icon={FileText}
        iconColor="text-blue-400"
      >
        <BarChart
          data={analytics.notesOverTime.map(d => ({
            label: d.month,
            value: d.count
          }))}
          color="#3b82f6"
          height={200}
        />
      </ChartCard>
    </div>

    {/* Activity Calendar */}
    <ChartCard
      title="Activity Calendar"
      description="Your note creation activity over the past year"
      icon={Calendar}
      iconColor="text-purple-400"
    >
      <div className="overflow-x-auto">
        <ActivityCalendar data={analytics.activityData} />
      </div>
    </ChartCard>

    {/* Top Performing Notes */}
    {analytics.topNotes.length > 0 && (
      <ChartCard
        title="Top Performing Notes"
        description="Your most viewed notes"
        icon={TrendingUp}
        iconColor="text-yellow-400"
      >
        <div className="space-y-4">
          {analytics.topNotes.map((note, index) => (
            <Link
              key={note.id}
              href={`/notes/${note.slug}`}
              className="flex items-center gap-4 p-4 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors group"
            >
              <div className="relative w-20 h-12 flex-shrink-0 rounded overflow-hidden">
                {note.thumbnail ? (
                  <Image
                    src={note.thumbnail}
                    alt={note.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-700 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-neutral-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white truncate group-hover:text-green-400 transition-colors">
                  {note.title}
                </h4>
                <div className="flex items-center gap-4 mt-2 text-sm text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {note.views.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {note.comments}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {note.likes}
                  </span>
                </div>
              </div>
              <ExternalLink className="h-5 w-5 text-neutral-400 group-hover:text-white transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
      </ChartCard>
    )}
  </>
);

// Summary Card Component
const SummaryCard = ({ title, value, icon: Icon, color }: any) => (
  <Card className="bg-neutral-900 border-neutral-700">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-neutral-400">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </CardContent>
  </Card>
);

// Chart Card Component
const ChartCard = ({ title, description, icon: Icon, iconColor, children }: any) => (
  <Card className="bg-neutral-900 border-neutral-700">
    <CardHeader>
      <CardTitle className="text-white flex items-center gap-2">
        <Icon className={`h-5 w-5 ${iconColor}`} />
        {title}
      </CardTitle>
      <CardDescription className="text-neutral-400">{description}</CardDescription>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

// Notes View Component
const NotesView = ({
  notes,
  isLoading,
  searchQuery,
  setSearchQuery,
  selectedNotes,
  toggleNoteSelection,
  toggleSelectAll,
  setDeleteNoteDialogOpen,
  setNoteToDelete,
  router,
  formatDate,
  formatFileSize,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  visibilityFilter,
  setVisibilityFilter,
  updateNoteVisibility
}: any) => (
  <Card className="bg-neutral-900 border-neutral-700">
    <CardHeader>
      <CardTitle className="text-white">My Notes</CardTitle>
      <CardDescription className="text-neutral-400">
        Manage and view all your created notes ({notes.length} total)
      </CardDescription>
    </CardHeader>
    <CardContent>
      {/* Search and Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-neutral-800 border-neutral-600 text-white placeholder:text-neutral-400"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
              <SelectTrigger className="w-[130px] bg-neutral-800 border-neutral-600 text-white">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-600 text-white">
                <SelectItem value="all">All Notes</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="unlisted">Unlisted</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] bg-neutral-800 border-neutral-600 text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-600 text-white">
                <SelectItem value="createdAt">Date Created</SelectItem>
                <SelectItem value="updatedAt">Last Updated</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="views">Views</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="bg-neutral-800 border-neutral-600 text-white"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          {selectedNotes.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => setDeleteNoteDialogOpen(true)}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete ({selectedNotes.length})
            </Button>
          )}
          <Button 
            onClick={() => router.push("/")}
            className="bg-green-600 hover:bg-green-500"
          >
            Create New Note
          </Button>
        </div>
      </div>

      {/* Notes Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      ) : notes.length > 0 ? (
        <div className="space-y-4">
          {/* Select All Bar */}
          <div className="flex items-center gap-3 p-3 bg-neutral-800 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSelectAll}
              className="p-1 h-auto text-neutral-400 hover:text-white"
            >
              {selectedNotes.length === notes.length ? (
                <CheckSquare className="h-5 w-5 text-green-400" />
              ) : (
                <Square className="h-5 w-5" />
              )}
            </Button>
            <span className="text-sm text-neutral-400">
              {selectedNotes.length} of {notes.length} selected
            </span>
          </div>

          {/* Notes List */}
          <div className="grid gap-4">
            {notes.map((note: Note) => (
              <NoteCard
                key={note._id}
                note={note}
                isSelected={selectedNotes.includes(note._id)}
                onSelect={() => toggleNoteSelection(note._id)}
                onEdit={() => router.push(`/my-note/${note._id}/edit`)}
                onDelete={() => {
                  setNoteToDelete(note._id);
                  setDeleteNoteDialogOpen(true);
                }}
                onUpdateVisibility={updateNoteVisibility}
                formatDate={formatDate}
                formatFileSize={formatFileSize}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto mb-4 text-neutral-600" />
          <p className="text-neutral-400 mb-4">
            {searchQuery ? 'No notes found matching your search.' : 'You haven\'t created any notes yet.'}
          </p>
          <Button onClick={() => router.push("/")} className="bg-green-600 hover:bg-green-500">
            Create Your First Note
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
);

// Individual Note Card Component
const NoteCard = ({ 
  note, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete, 
  onUpdateVisibility,
  formatDate,
  formatFileSize 
}: any) => {
  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="h-3 w-3 mr-1" />;
      case 'private': return <Lock className="h-3 w-3 mr-1" />;
      case 'unlisted': return <Eye className="h-3 w-3 mr-1" />;
      default: return <Globe className="h-3 w-3 mr-1" />;
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'private': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'unlisted': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
        isSelected
          ? 'bg-blue-900/20 border-blue-500'
          : 'bg-neutral-800 border-neutral-700 hover:bg-neutral-750'
      }`}
    >
      {/* Selection Checkbox */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onSelect}
        className="p-1 h-auto"
      >
        {isSelected ? (
          <CheckSquare className="h-5 w-5 text-green-400" />
        ) : (
          <Square className="h-5 w-5 text-neutral-400" />
        )}
      </Button>

      {/* Thumbnail */}
      <div 
        className="relative w-20 h-16 flex-shrink-0 rounded-md overflow-hidden cursor-pointer"
        onClick={onEdit}
      >
        {note.thumbnail ? (
          <Image
            src={note.thumbnail}
            alt={note.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-neutral-700 flex items-center justify-center">
            <FileText className="h-6 w-6 text-neutral-400" />
          </div>
        )}
      </div>

      {/* Note Details */}
      <div 
        className="flex-1 min-w-0 cursor-pointer"
        onClick={onEdit}
      >
        <h3 className="font-semibold text-white truncate mb-1">
          {note.title}
        </h3>
        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-400">
          <Badge 
            variant="secondary"
            className={`text-xs ${getVisibilityColor(note.visibility)}`}
          >
            {getVisibilityIcon(note.visibility)}
            {note.visibility}
          </Badge>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(note.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {note.views}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {note.commentsCount}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {note.likesCount}
          </span>
          {note.pdf_data?.downloadUrl && (
            <span className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              {formatFileSize(note.pdf_data.fileSize)}
            </span>
          )}
        </div>
      </div>

      {/* Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-neutral-800 border-neutral-600 w-48">
          <DropdownMenuItem 
            onClick={onEdit}
            className="text-white hover:bg-neutral-700 cursor-pointer"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Note
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/notes/${note.slug}`);
              toast.success("Shareable link copied to clipboard!");
            }}
            className="text-white hover:bg-neutral-700 cursor-pointer"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Get Shareable Link
          </DropdownMenuItem>

          {note.pdf_data?.downloadUrl && (
            <DropdownMenuItem 
              onClick={() => window.open(note.pdf_data.downloadUrl, '_blank')}
              className="text-white hover:bg-neutral-700 cursor-pointer"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator className="bg-neutral-600" />
          
          <DropdownMenuLabel className="text-xs text-neutral-400 font-normal">
            Change Visibility
          </DropdownMenuLabel>
          
          <DropdownMenuItem 
            onClick={() => onUpdateVisibility(note._id, 'public')}
            className="text-green-400 hover:bg-green-500/20 cursor-pointer"
          >
            <Globe className="h-4 w-4 mr-2" />
            Make Public
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => onUpdateVisibility(note._id, 'private')}
            className="text-yellow-400 hover:bg-yellow-500/20 cursor-pointer"
          >
            <Lock className="h-4 w-4 mr-2" />
            Make Private
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => onUpdateVisibility(note._id, 'unlisted')}
            className="text-blue-400 hover:bg-blue-500/20 cursor-pointer"
          >
            <Eye className="h-4 w-4 mr-2" />
            Make Unlisted
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-neutral-600" />
          
          <DropdownMenuItem 
            onClick={onDelete}
            className="text-red-400 hover:bg-red-500/20 hover:text-red-300 cursor-pointer"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Forever
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

// Link component for Next.js
const Link = ({ href, children, ...props }: any) => {
  const router = useRouter();
  
  return (
    <div
      onClick={() => router.push(href)}
      className="cursor-pointer"
      {...props}
    >
      {children}
    </div>
  );
};

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}