"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Eye, 
  MessageSquare, 
  Heart, 
  Download, 
  Globe, 
  Lock, 
  EyeOff,
  Calendar,
  Clock,
  FileText,
  User,
  BarChart3,
  TrendingUp,
  Users,
  Save,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import Image from "next/image";
import api from "@/config/api";
import { SimpleChart, BarChart } from "@/components/ui/simple-chart";

interface Note {
  _id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  videoUrl: string;
  videoId: string;
  visibility: 'public' | 'private' | 'unlisted';
  views: number;
  commentsCount: number;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  status: 'processing' | 'completed' | 'failed';
  viewHistory: Array<{ date: string; count: number }>;
  pdf_data?: {
    downloadUrl?: string;
    fileSize?: number;
  };
}

interface Comment {
  _id: string;
  content: string;
  user: {
    _id: string;
    name: string;
    picture?: string;
  };
  likes: number;
  userLiked: string[];
  replies: Array<{
    _id: string;
    content: string;
    user: {
      _id: string;
      name: string;
      picture?: string;
    };
    likes: number;
    userLiked: string[];
    createdAt: string;
  }>;
  createdAt: string;
}

interface AnalyticsData {
  viewsOverTime: Array<{ date: string; views: number }>;
  engagementMetrics: {
    totalComments: number;
    totalReplies: number;
    totalLikes: number;
    uniqueCommenters: number;
    topEngagers: Array<{
      userId: string;
      name: string;
      picture?: string;
      comments: number;
      likes: number;
    }>;
  };
  comments: Comment[];
}

function EditNoteContent() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.id as string;

  const [note, setNote] = useState<Note | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [editedNote, setEditedNote] = useState<Partial<Note>>({});

  // Get auth token
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("authToken");
    }
    return null;
  };

  useEffect(() => {
    fetchNote();
    fetchAnalyticsData();
  }, [noteId]);

  const fetchNote = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error("Please log in to edit notes");
        router.push("/");
        return;
      }

      const response = await api.get(`/notes/${noteId}/edit`, {
        headers: { 'Auth': token }
      });

      if (response.data?.success) {
        setNote(response.data.data);
        setEditedNote(response.data.data);
      } else {
        throw new Error(response.data?.message || "Failed to fetch note");
      }
    } catch (error: any) {
      console.error("❌ Error fetching note:", error);
      toast.error(error.message || "Failed to load note");
      router.push("/profile?tab=notes");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalyticsData = async () => {
    setIsLoadingAnalytics(true);
    try {
      const token = getAuthToken();
      const response = await api.get(`/notes/${noteId}/analytics`, {
        headers: { 'Auth': token }
      });

      if (response.data?.success) {
        setAnalytics(response.data.data);
      }
    } catch (error: any) {
      console.error("❌ Error fetching analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const handleSave = async () => {
    if (!note) return;

    setIsSaving(true);
    try {
      const token = getAuthToken();
      const updates: any = {};

      // Only include changed fields
      if (editedNote.title !== note.title) updates.title = editedNote.title;
      if (editedNote.visibility !== note.visibility) updates.visibility = editedNote.visibility;

      if (Object.keys(updates).length === 0) {
        toast.info("No changes to save");
        return;
      }

      const response = await api.patch(`/notes/${noteId}`, updates, {
        headers: { 'Auth': token }
      });

      if (response.data?.success) {
        toast.success("Note updated successfully");
        setNote(prev => prev ? { ...prev, ...updates } : null);
      } else {
        throw new Error(response.data?.message || "Failed to update note");
      }
    } catch (error: any) {
      console.error("❌ Error updating note:", error);
      toast.error(error.message || "Failed to update note");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof Note, value: any) => {
    setEditedNote(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return formatDate(dateString);
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="h-4 w-4" />;
      case 'private': return <Lock className="h-4 w-4" />;
      case 'unlisted': return <EyeOff className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading note...
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
          <h2 className="text-white text-xl mb-2">Note Not Found</h2>
          <p className="text-neutral-400 mb-4">The note you're looking for doesn't exist or you don't have permission to edit it.</p>
          <Button onClick={() => router.push("/profile?tab=notes")} className="bg-green-600 hover:bg-green-500">
            Back to My Notes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/profile?tab=notes")}
                className="text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Note Analytics</h1>
                <p className="text-neutral-400">View performance and engagement metrics</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push(`/notes/${note.slug}`)}
                className="border-neutral-600 text-white hover:bg-neutral-800"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Live
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-500"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-neutral-900 p-1">
                <TabsTrigger value="overview" className="text-white data-[state=active]:bg-neutral-700">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="engagement" className="text-white data-[state=active]:bg-neutral-700">
                  Engagement
                </TabsTrigger>
                <TabsTrigger value="comments" className="text-white data-[state=active]:bg-neutral-700">
                  Comments
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card className="bg-neutral-900 border-neutral-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Note Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-neutral-300 mb-2 block">
                        Note Title
                      </label>
                      <Input
                        value={editedNote.title || note.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="bg-neutral-800 border-neutral-600 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-neutral-300 mb-2 block">
                        Visibility
                      </label>
                      <Select
                        value={editedNote.visibility || note.visibility}
                        onValueChange={(value: 'public' | 'private' | 'unlisted') => 
                          handleInputChange('visibility', value)
                        }
                      >
                        <SelectTrigger className="bg-neutral-800 border-neutral-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-800 border-neutral-600 text-white">
                          <SelectItem value="public" className="focus:bg-neutral-700">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-green-400" />
                              Public - Anyone can view
                            </div>
                          </SelectItem>
                          <SelectItem value="private" className="focus:bg-neutral-700">
                            <div className="flex items-center gap-2">
                              <Lock className="h-4 w-4 text-yellow-400" />
                              Private - Only you can view
                            </div>
                          </SelectItem>
                          <SelectItem value="unlisted" className="focus:bg-neutral-700">
                            <div className="flex items-center gap-2">
                              <EyeOff className="h-4 w-4 text-blue-400" />
                              Unlisted - Anyone with link can view
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div>
                        <label className="text-sm font-medium text-neutral-300 mb-2 block">
                          Created
                        </label>
                        <p className="text-white flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-neutral-400" />
                          {formatDate(note.createdAt)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-300 mb-2 block">
                          Last Updated
                        </label>
                        <p className="text-white flex items-center gap-2">
                          <Clock className="h-4 w-4 text-neutral-400" />
                          {formatDate(note.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Views Analytics */}
                <Card className="bg-neutral-900 border-neutral-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Views Analytics
                    </CardTitle>
                    <CardDescription className="text-neutral-400">
                      Track how your note is performing over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingAnalytics ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                      </div>
                    ) : analytics?.viewsOverTime ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-neutral-800 rounded-lg">
                            <div className="text-2xl font-bold text-white">{note.views}</div>
                            <div className="text-sm text-neutral-400">Total Views</div>
                          </div>
                          <div className="text-center p-4 bg-neutral-800 rounded-lg">
                            <div className="text-2xl font-bold text-white">
                              {analytics.viewsOverTime.reduce((sum, day) => sum + day.views, 0)}
                            </div>
                            <div className="text-sm text-neutral-400">Last 30 Days</div>
                          </div>
                          <div className="text-center p-4 bg-neutral-800 rounded-lg">
                            <div className="text-2xl font-bold text-white">
                              {Math.max(...analytics.viewsOverTime.map(d => d.views))}
                            </div>
                            <div className="text-sm text-neutral-400">Peak Daily</div>
                          </div>
                        </div>
                        
                        <SimpleChart
                          data={analytics.viewsOverTime.map(d => ({
                            label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                            value: d.views
                          }))}
                          color="#3b82f6"
                          height={200}
                        />
                      </div>
                    ) : (
                      <div className="text-center py-12 text-neutral-400">
                        No view data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Engagement Tab */}
              <TabsContent value="engagement" className="space-y-6">
                {isLoadingAnalytics ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                ) : analytics ? (
                  <>
                    {/* Engagement Metrics */}
                    <Card className="bg-neutral-900 border-neutral-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Engagement Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-4 bg-neutral-800 rounded-lg">
                            <MessageSquare className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">{analytics.engagementMetrics.totalComments}</div>
                            <div className="text-sm text-neutral-400">Comments</div>
                          </div>
                          <div className="text-center p-4 bg-neutral-800 rounded-lg">
                            <MessageSquare className="h-8 w-8 text-green-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">{analytics.engagementMetrics.totalReplies}</div>
                            <div className="text-sm text-neutral-400">Replies</div>
                          </div>
                          <div className="text-center p-4 bg-neutral-800 rounded-lg">
                            <Heart className="h-8 w-8 text-red-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">{analytics.engagementMetrics.totalLikes}</div>
                            <div className="text-sm text-neutral-400">Likes</div>
                          </div>
                          <div className="text-center p-4 bg-neutral-800 rounded-lg">
                            <Users className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">{analytics.engagementMetrics.uniqueCommenters}</div>
                            <div className="text-sm text-neutral-400">Engagers</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Top Engagers */}
                    {analytics.engagementMetrics.topEngagers.length > 0 && (
                      <Card className="bg-neutral-900 border-neutral-700">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Top Engagers
                          </CardTitle>
                          <CardDescription className="text-neutral-400">
                            Users who are most active on this note
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {analytics.engagementMetrics.topEngagers.map((engager, index) => (
                              <div key={engager.userId} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={engager.picture} alt={engager.name} />
                                    <AvatarFallback className="bg-neutral-700">
                                      {engager.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium text-white">{engager.name}</div>
                                    <div className="text-sm text-neutral-400">
                                      {engager.comments} comments • {engager.likes} likes
                                    </div>
                                  </div>
                                </div>
                                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                                  #{index + 1}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Engagement Chart */}
                    <Card className="bg-neutral-900 border-neutral-700">
                      <CardHeader>
                        <CardTitle>Engagement Over Time</CardTitle>
                        <CardDescription className="text-neutral-400">
                          Comments and likes activity pattern
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 flex items-center justify-center text-neutral-400">
                          Engagement timeline chart would be displayed here
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card className="bg-neutral-900 border-neutral-700">
                    <CardContent className="p-12 text-center">
                      <p className="text-neutral-400">No engagement data available</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Comments Tab */}
              <TabsContent value="comments" className="space-y-6">
                {isLoadingAnalytics ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                ) : analytics?.comments && analytics.comments.length > 0 ? (
                  <Card className="bg-neutral-900 border-neutral-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        All Comments ({analytics.comments.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {analytics.comments.map((comment) => (
                          <div key={comment._id} className="border-b border-neutral-700 pb-6 last:border-0">
                            {/* Main Comment */}
                            <div className="flex gap-4">
                              <Avatar className="h-10 w-10 flex-shrink-0">
                                <AvatarImage src={comment.user.picture} alt={comment.user.name} />
                                <AvatarFallback className="bg-neutral-700">
                                  {comment.user.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="font-medium text-white">{comment.user.name}</div>
                                  <div className="text-sm text-neutral-400">
                                    {formatRelativeTime(comment.createdAt)}
                                  </div>
                                </div>
                                <p className="text-white mb-3">{comment.content}</p>
                                <div className="flex items-center gap-4 text-sm text-neutral-400">
                                  <div className="flex items-center gap-1">
                                    <Heart className="h-4 w-4" />
                                    {comment.likes} likes
                                  </div>
                                  <div>
                                    {comment.userLiked.length} people liked this
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                              <div className="ml-14 mt-4 space-y-4">
                                {comment.replies.map((reply) => (
                                  <div key={reply._id} className="flex gap-3">
                                    <Avatar className="h-8 w-8 flex-shrink-0">
                                      <AvatarImage src={reply.user.picture} alt={reply.user.name} />
                                      <AvatarFallback className="bg-neutral-700 text-xs">
                                        {reply.user.name.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <div className="font-medium text-white text-sm">{reply.user.name}</div>
                                        <div className="text-xs text-neutral-400">
                                          {formatRelativeTime(reply.createdAt)}
                                        </div>
                                      </div>
                                      <p className="text-white text-sm mb-2">{reply.content}</p>
                                      <div className="flex items-center gap-3 text-xs text-neutral-400">
                                        <div className="flex items-center gap-1">
                                          <Heart className="h-3 w-3" />
                                          {reply.likes} likes
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-neutral-900 border-neutral-700">
                    <CardContent className="p-12 text-center">
                      <MessageSquare className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
                      <p className="text-neutral-400">No comments yet</p>
                      <p className="text-neutral-500 text-sm mt-2">
                        Comments will appear here when users engage with your note
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="bg-neutral-900 border-neutral-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Status</span>
                  <Badge 
                    className={`
                      ${note.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}
                      ${note.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : ''}
                      ${note.status === 'failed' ? 'bg-red-500/20 text-red-400 border-red-500/30' : ''}
                    `}
                  >
                    {note.status.charAt(0).toUpperCase() + note.status.slice(1)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-neutral-800 rounded-lg">
                    <Eye className="h-6 w-6 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{note.views}</div>
                    <div className="text-xs text-neutral-400">Views</div>
                  </div>
                  <div className="text-center p-3 bg-neutral-800 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{note.commentsCount}</div>
                    <div className="text-xs text-neutral-400">Comments</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-neutral-800 rounded-lg">
                    <Heart className="h-6 w-6 text-red-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{note.likesCount}</div>
                    <div className="text-xs text-neutral-400">Likes</div>
                  </div>
                  <div className="text-center p-3 bg-neutral-800 rounded-lg">
                    <div className="h-6 w-6 mx-auto mb-2 flex items-center justify-center">
                      <Badge className={`text-xs ${getVisibilityColor(note.visibility)}`}>
                        {getVisibilityIcon(note.visibility)}
                      </Badge>
                    </div>
                    <div className="text-sm font-bold text-white mt-1 capitalize">{note.visibility}</div>
                    <div className="text-xs text-neutral-400">Visibility</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* PDF Download */}
            {note.pdf_data?.downloadUrl && (
              <Card className="bg-neutral-900 border-neutral-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    PDF Export
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => window.open(note.pdf_data?.downloadUrl, '_blank')}
                    className="w-full bg-green-600 hover:bg-green-500"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditNotePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading...
        </div>
      </div>
    }>
      <EditNoteContent />
    </Suspense>
  );
}