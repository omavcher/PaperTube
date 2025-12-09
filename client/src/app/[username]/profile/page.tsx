// app/[username]/profile/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  User, CalendarDays, Eye, FileText, Users, ThumbsUp,
  ExternalLink, Globe, Mail, Link, Youtube, FileDown,
  Image as ImageIcon, Video, BookOpen, Award, Crown,
  TrendingUp, Clock, Share2, MoreVertical, Edit, Download,
  Play, Filter, Grid3x3, List, ChevronRight, ChevronLeft,
  Bookmark, Heart, MessageSquare, BarChart, PieChart,
  UserPlus, Check, Loader2, ArrowLeft, Settings, Bell,
  CreditCard, Sparkles, Zap, Target, Trophy, Star,
  ShieldCheck, X, Search, ChevronUp, ChevronDown, LogOut,
  Flag, AlertTriangle, Shield, Lock, UserX, VolumeX,
  HelpCircle, Menu, Phone, MessageCircle, MailCheck,
  FileWarning, AlertCircle, UserCheck, UserMinus,
  Ban, BellOff, EyeOff, Copy, QrCode, Send, Pencil
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import api from "@/config/api";
import { toast } from "sonner";
import Image from "next/image";
import { headers } from "next/headers";

// Types
interface UserProfile {
  _id: string;
  name: string;
  email: string;
  picture?: string;
  username: string;
  joinDate: string;
  isPremium: boolean;
  membershipPlan: string;
  totalViews: number;
  totalLikes: number;
  followersCount: number;
  followingCount: number;
  bio?: string;
  location?: string;
  website?: string;
  isFollowing?: boolean;
}

interface Note {
  _id: string;
  title: string;
  slug: string;
  thumbnail: string;
  videoId: string;
  pdfThumbnail?: string;
  views: number;
  createdAt: string;
  isPremium: boolean;
  status: string;
}

interface Stats {
  totalNotes: number;
  totalViews: number;
  totalLikes: number;
  commentsCount: number;
  totalPremiumNotes: number;
  followersCount: number;
  followingCount: number;
}

interface ApiResponse {
  success: boolean;
  user: UserProfile;
  notes: Note[];
  stats: Stats;
}

interface LocalStorageUser {
  id?: string;
  _id?: string;
  sub?: string;
  name: string;
  email: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  email_verified?: boolean;
  googleId?: string;
  googleAccessToken?: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [followLoading, setFollowLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<LocalStorageUser | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showFollowersDialog, setShowFollowersDialog] = useState(false);
  const [showFollowingDialog, setShowFollowingDialog] = useState(false);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);;

 const getAuthToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("authToken");
    }
    return null;
  }, []);
  
  const isOwnProfile = React.useMemo(() => {
    if (!currentUser || !user) return false;
    
    // Check multiple possible ID fields from localStorage user
    const currentUserId = currentUser.id || currentUser._id;
    return currentUserId === user._id;
  }, [currentUser, user]);

  // Format time ago function
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  };

  // Check mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load current user from localStorage - FIXED VERSION
  useEffect(() => {
    const loadCurrentUser = () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr) as LocalStorageUser;
          setCurrentUser(userData);
          console.log('Current user loaded successfully:', userData);
        } else {
          console.log('No user found in localStorage');
        }
      } catch (error) {
        console.error('Error loading current user:', error);
      }
    };
    
    // Load immediately
    loadCurrentUser();
    
    // Also listen for storage events in case user logs in/out in another tab
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        loadCurrentUser();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get<ApiResponse>(`/users/${username}/profile`);
        
        if (response.data.success) {
          const { user, notes, stats } = response.data;
          
          // Transform API data to match our interface
          const userProfile: UserProfile = {
            ...user,
            totalViews: user.totalViews || 0,
            totalLikes: user.totalLikes || 0,
            followersCount: user.followersCount || 0,
            followingCount: user.followingCount || 0
          };
          
          setUser(userProfile);
          setNotes(notes || []);
          setStats(stats);
        } else {
          toast.error("User not found");
          router.push('/');
        }
      } catch (error: any) {
        console.error('Error loading profile:', error);
        toast.error(error.response?.data?.message || "Failed to load profile");
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    
    if (username) {
      loadProfile();
    }
  }, [username, router]);

  // Handle follow/unfollow
  const handleFollow = async () => {
    if (!user || !currentUser) {
      toast.error("Please login to follow users");
      return;
    }
    
    // Don't allow following yourself
    if (isOwnProfile) {
      toast.info("You cannot follow yourself");
      return;
    }
    
    try {
      setFollowLoading(true);
      const token = getAuthToken();
      const response = await api.post(
      `/users/${user._id}/follow`,
      {}, 
      {
        headers: { 
          'Auth': token
        },
      }
    );
      
      if (response.data.success) {
        setUser(prev => prev ? {
          ...prev,
          isFollowing: response.data.isFollowing,
          followersCount: response.data.isFollowing 
            ? prev.followersCount + 1 
            : prev.followersCount - 1
        } : null);
        
        toast.success(response.data.message);
      }
    } catch (error: any) {
      console.error('Follow error:', error);
      if (error.response?.status === 401) {
        toast.error("Please login to follow users");
      } else {
        toast.error(error.response?.data?.message || "Failed to update follow status");
      }
    } finally {
      setFollowLoading(false);
    }
  };

  // Handle edit profile
  const handleEditProfile = () => {
    if (isOwnProfile) {
      router.push('/profile');
    }
  };

  // Handle share profile
  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Profile link copied to clipboard!");
    setShowShareDialog(false);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle note click
  const handleNoteClick = (note: Note) => {
    router.push(`/note/${username}/${note.slug}`);
  };

  // Load followers
  const loadFollowers = async () => {
    if (!user) return;
    
    try {
      setLoadingFollowers(true);
      const response = await api.get(`/users/${user._id}/followers`);
      if (response.data.success) {
        setFollowers(response.data.followers || []);
      }
    } catch (error) {
      console.error('Error loading followers:', error);
      toast.error("Failed to load followers");
    } finally {
      setLoadingFollowers(false);
    }
  };

  // Load following
  const loadFollowing = async () => {
    if (!user) return;
    
    try {
      setLoadingFollowing(true);
      const response = await api.get(`/users/${user._id}/following`);
      if (response.data.success) {
        setFollowing(response.data.following || []);
      }
    } catch (error) {
      console.error('Error loading following:', error);
      toast.error("Failed to load following");
    } finally {
      setLoadingFollowing(false);
    }
  };

  // Handle follower/following dialog open
  const handleOpenFollowers = () => {
    setShowFollowersDialog(true);
    loadFollowers();
  };

  const handleOpenFollowing = () => {
    setShowFollowingDialog(true);
    loadFollowing();
  };

  // Filter notes by tab
  const filteredNotes = notes.filter(note => {
    if (activeTab === 'all') return true;
    if (activeTab === 'premium') return note.isPremium;
    if (activeTab === 'free') return !note.isPremium;
    if (activeTab === 'popular') return note.views > 50;
    return true;
  });

  // Stat cards
  const statCards = [
    {
      label: "Notes",
      value: stats?.totalNotes || 0,
      icon: <FileText className="h-4 w-4 md:h-5 md:w-5" />,
      color: "from-blue-500 to-cyan-500"
    },
    {
      label: "Views",
      value: stats?.totalViews?.toLocaleString() || 0,
      icon: <Eye className="h-4 w-4 md:h-5 md:w-5" />,
      color: "from-purple-500 to-pink-500"
    },
    {
      label: "Likes",
      value: stats?.totalLikes?.toLocaleString() || 0,
      icon: <ThumbsUp className="h-4 w-4 md:h-5 md:w-5" />,
      color: "from-red-500 to-orange-500"
    },
    {
      label: "Followers",
      value: stats?.followersCount || 0,
      icon: <Users className="h-4 w-4 md:h-5 md:w-5" />,
      color: "from-green-500 to-emerald-500"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse mx-auto"></div>
            <Loader2 className="h-8 w-8 animate-spin text-white absolute inset-0 m-auto" />
          </div>
          <p className="text-zinc-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <User className="h-16 w-16 text-zinc-600 mx-auto" />
          <h2 className="text-2xl font-bold text-white">User Not Found</h2>
          <p className="text-zinc-400">The user you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-900 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="text-zinc-400 hover:text-white hover:bg-zinc-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.picture} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-xs">
                    {user.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-sm font-semibold">@{user.username}</h1>
                  <p className="text-xs text-zinc-500 truncate max-w-[120px]">{user.name}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowShareDialog(true)}
                className="text-zinc-400 hover:text-white hover:bg-zinc-900"
              >
                <Share2 className="h-5 w-5" />
              </Button>
              
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="text-zinc-400 hover:text-white hover:bg-zinc-900 md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              {/* Desktop Dropdown */}
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-zinc-400 hover:text-white hover:bg-zinc-900"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="bg-zinc-900 border-zinc-800 w-56"
                  >
                    <DropdownMenuLabel className="text-zinc-400">
                      Profile Actions
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-zinc-800" />
                    
                    <DropdownMenuItem 
                      className="text-zinc-300 hover:bg-zinc-800 cursor-pointer"
                      onClick={() => setShowShareDialog(true)}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Profile
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      className="text-zinc-300 hover:bg-zinc-800 cursor-pointer"
                      onClick={() => {
                        const url = window.location.href;
                        navigator.clipboard.writeText(url);
                        toast.success("Link copied!");
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </DropdownMenuItem>
                    
                    {!isOwnProfile && (
                      <>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuItem 
                          className="text-amber-400 hover:bg-amber-500/10 cursor-pointer"
                          onClick={() => setShowReportDialog(true)}
                        >
                          <Flag className="h-4 w-4 mr-2" />
                          Report User
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                          onClick={() => setShowBlockDialog(true)}
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Block User
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    {isOwnProfile && (
                      <>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuItem 
                          className="text-zinc-300 hover:bg-zinc-800 cursor-pointer"
                          onClick={handleEditProfile}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Edit Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                          onClick={() => {
                            localStorage.removeItem('user');
                            router.push('/login');
                            toast.success('Logged out successfully');
                          }}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Sheet */}
      <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
        <SheetContent side="right" className="bg-zinc-950 border-l border-zinc-800 p-0">
          <div className="p-6 border-b border-zinc-800">
            <div className="flex items-center gap-3 mb-6">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.picture} />
                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600">
                  {user.name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{user.name}</h3>
                <p className="text-sm text-zinc-500">@{user.username}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-lg font-bold">{stats?.totalNotes || 0}</div>
                <div className="text-xs text-zinc-500">Posts</div>
              </div>
              <div 
                className="text-center cursor-pointer"
                onClick={() => {
                  setShowMobileMenu(false);
                  handleOpenFollowers();
                }}
              >
                <div className="text-lg font-bold">{user.followersCount}</div>
                <div className="text-xs text-zinc-500">Followers</div>
              </div>
              <div 
                className="text-center cursor-pointer"
                onClick={() => {
                  setShowMobileMenu(false);
                  handleOpenFollowing();
                }}
              >
                <div className="text-lg font-bold">{user.followingCount}</div>
                <div className="text-xs text-zinc-500">Following</div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start border-zinc-800 text-zinc-300 hover:text-white"
                onClick={() => {
                  setShowMobileMenu(false);
                  setShowShareDialog(true);
                }}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Profile
              </Button>
              
              {!isOwnProfile && (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-zinc-800 text-amber-400 hover:text-amber-300"
                    onClick={() => {
                      setShowMobileMenu(false);
                      setShowReportDialog(true);
                    }}
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Report User
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start border-zinc-800 text-red-400 hover:text-red-300"
                    onClick={() => {
                      setShowMobileMenu(false);
                      setShowBlockDialog(true);
                    }}
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Block User
                  </Button>
                </>
              )}
              
              {isOwnProfile && (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-zinc-800 text-zinc-300 hover:text-white"
                    onClick={() => {
                      setShowMobileMenu(false);
                      handleEditProfile();
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start border-zinc-800 text-red-400 hover:text-red-300"
                    onClick={() => {
                      setShowMobileMenu(false);
                      localStorage.removeItem('user');
                      router.push('/login');
                      toast.success('Logged out successfully');
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Profile Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:w-1/3 space-y-6">
            {/* Avatar Section */}
            <div className="space-y-4">
              <div className="relative mx-auto w-fit lg:mx-0">
                <Avatar className="h-32 w-32 border-4 border-zinc-900">
                  <AvatarImage src={user.picture} />
                  <AvatarFallback className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600">
                    {user.name[0]}
                  </AvatarFallback>
                </Avatar>
                
                {user.isPremium && (
                  <div className="absolute -top-2 -right-2">
                    <div className="bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full p-1">
                      <Crown className="h-5 w-5 text-white" />
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  {user.isPremium && (
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                      <Crown className="h-3 w-3 mr-1" />
                      {user.membershipPlan || 'Premium'}
                    </Badge>
                  )}
                </div>
                <p className="text-zinc-400">@{user.username}</p>
                
                <div className="mt-3 text-sm text-zinc-300 space-y-1">
                  <p className="text-zinc-500">{user.email}</p>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-4 py-4">
                <div className="text-center">
                  <div className="text-xl font-bold">{stats?.totalNotes || 0}</div>
                  <div className="text-xs text-zinc-500">Notes</div>
                </div>
                <div 
                  className="text-center cursor-pointer hover:text-blue-400 transition-colors"
                  onClick={handleOpenFollowers}
                >
                  <div className="text-xl font-bold">{user.followersCount}</div>
                  <div className="text-xs text-zinc-500">Followers</div>
                </div>
                <div 
                  className="text-center cursor-pointer hover:text-blue-400 transition-colors"
                  onClick={handleOpenFollowing}
                >
                  <div className="text-xl font-bold">{user.followingCount}</div>
                  <div className="text-xs text-zinc-500">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{user.totalLikes}</div>
                  <div className="text-xs text-zinc-500">Likes</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {isOwnProfile ? (
                  // Show Edit Profile button for own profile
                  <Button
                    variant="default"
                    className="w-full rounded-lg h-11 bg-white text-black hover:bg-zinc-200"
                    onClick={handleEditProfile}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : currentUser ? (
                  // Show Follow/Following button for other users when logged in
                  <Button
                    variant={user.isFollowing ? "outline" : "default"}
                    className={cn(
                      "w-full rounded-lg h-11",
                      user.isFollowing 
                        ? "border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600"
                        : "bg-white text-black hover:bg-zinc-200"
                    )}
                    onClick={handleFollow}
                    disabled={followLoading}
                  >
                    {followLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : user.isFollowing ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>
                ) : (
                  // Show Follow button for non-logged in users
                  <Button
                    variant="default"
                    className="w-full rounded-lg h-11 bg-white text-black hover:bg-zinc-200"
                    onClick={() => router.push('/login')}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Follow
                  </Button>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-lg h-11 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600"
                    onClick={() => setShowShareDialog(true)}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  
                  {isOwnProfile && (
                    <Button
                      variant="outline"
                      className="flex-1 rounded-lg h-11 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600"
                      onClick={() => router.push('/')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      New Note
                    </Button>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-3 pt-4 border-t border-zinc-900">
                <div className="flex items-center gap-3 text-sm text-zinc-400">
                  <CalendarDays className="h-4 w-4" />
                  Joined {formatDate(user.joinDate)}
                </div>
                {user.location && (
                  <div className="flex items-center gap-3 text-sm text-zinc-400">
                    <Globe className="h-4 w-4" />
                    {user.location}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="lg:w-2/3">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-2 md:grid-cols-4">
              {statCards.map((stat, index) => (
                <Card key={index} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg sm:text-xl font-bold">{stat.value}</div>
                        <div className="text-xs text-zinc-500">{stat.label}</div>
                      </div>
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                        {stat.icon}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Content Tabs */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 gap-4">
                {/* Responsive Tabs Navigation */}
                <div className="w-full sm:w-auto overflow-x-auto">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="bg-transparent p-0 h-12 w-full sm:w-auto flex flex-nowrap">
                      <TabsTrigger 
                        value="all" 
                        className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-white rounded-none px-3 sm:px-4 text-sm sm:text-base whitespace-nowrap"
                      >
                        All Notes
                      </TabsTrigger>
                      <TabsTrigger 
                        value="premium" 
                        className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-amber-500 data-[state=active]:text-amber-500 rounded-none px-3 sm:px-4 text-sm sm:text-base whitespace-nowrap"
                      >
                        <Crown className="h-3 w-3 mr-1 sm:mr-2" />
                        Premium
                      </TabsTrigger>
                      <TabsTrigger 
                        value="free" 
                        className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-green-500 data-[state=active]:text-green-500 rounded-none px-3 sm:px-4 text-sm sm:text-base whitespace-nowrap"
                      >
                        Free
                      </TabsTrigger>
                      <TabsTrigger 
                        value="popular" 
                        className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-pink-500 data-[state=active]:text-pink-500 rounded-none px-3 sm:px-4 text-sm sm:text-base whitespace-nowrap"
                      >
                        <TrendingUp className="h-3 w-3 mr-1 sm:mr-2" />
                        Popular
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                {/* View Mode Toggle - Now on mobile too */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "text-zinc-400 h-8 w-8 p-0",
                      viewMode === 'grid' ? "text-white" : ""
                    )}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "text-zinc-400 h-8 w-8 p-0",
                      viewMode === 'list' ? "text-white" : ""
                    )}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Notes Grid/List */}
              {filteredNotes.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-zinc-300 mb-2">No Notes Yet</h3>
                  <p className="text-zinc-500 max-w-md mx-auto">
                    {isOwnProfile 
                      ? "You haven't created any notes yet. Start by creating your first note!"
                      : "This user hasn't created any notes yet."}
                  </p>
                  {isOwnProfile && (
                    <Button className="mt-4" onClick={() => router.push('/create')}>
                      Create Your First Note
                    </Button>
                  )}
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredNotes.map((note) => (
                    <NoteCard 
                      key={note._id} 
                      note={note} 
                      onClick={() => handleNoteClick(note)}
                      getTimeAgo={getTimeAgo}
                      isMobile={isMobile}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotes.map((note) => (
                    <NoteListItem 
                      key={note._id} 
                      note={note} 
                      onClick={() => handleNoteClick(note)}
                      getTimeAgo={getTimeAgo}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Share Profile</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Share @{user.username}'s profile with others
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-zinc-800/50 rounded-lg">
              <p className="text-sm text-zinc-400 break-all">
                {typeof window !== 'undefined' ? window.location.href : ''}
              </p>
            </div>
            <Button 
              onClick={handleShare} 
              variant="default"
              className="w-full bg-white text-black hover:bg-zinc-200"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Profile Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Report @{user.username}</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Help us keep the community safe by reporting inappropriate behavior.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Reason for reporting</Label>
              <Textarea 
                placeholder="Please describe why you're reporting this user..."
                className="bg-zinc-800 border-zinc-700 text-white min-h-[100px]"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowReportDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  toast.success("Report submitted. We'll review this user.");
                  setShowReportDialog(false);
                }}
                className="flex-1"
              >
                Submit Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Block Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Block @{user.username}?</DialogTitle>
            <DialogDescription className="text-zinc-400">
              You won't see their notes or be able to message them. They won't be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.picture} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{user.name}</h4>
                  <p className="text-sm text-zinc-500">@{user.username}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowBlockDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  toast.success(`You've blocked @${user.username}`);
                  setShowBlockDialog(false);
                }}
                className="flex-1"
              >
                Block User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Followers Sheet */}
      <Sheet open={showFollowersDialog} onOpenChange={setShowFollowersDialog}>
        <SheetContent side="bottom" className="h-[80vh] bg-zinc-950 border-t border-zinc-800 rounded-t-2xl">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-white">Followers</SheetTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translatey-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search followers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-900 border-zinc-800"
              />
            </div>
          </SheetHeader>
          
          {loadingFollowers ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : followers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-400">No followers</p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(80vh-140px)] pr-4">
              <div className="space-y-2">
                {followers.map((follower) => (
                  <div 
                    key={follower._id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-900/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setShowFollowersDialog(false);
                      router.push(`/${follower.username}/profile`);
                    }}
                  >
                    <Avatar className="h-10 w-10 border border-zinc-800">
                      <AvatarImage src={follower.picture} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm">
                        {follower.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="font-medium text-sm truncate">
                          {follower.name}
                        </p>
                        {follower.isPremium && (
                          <Crown className="h-3 w-3 text-amber-500 fill-amber-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 truncate">@{follower.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>

      {/* Following Sheet */}
      <Sheet open={showFollowingDialog} onOpenChange={setShowFollowingDialog}>
        <SheetContent side="bottom" className="h-[80vh] bg-zinc-950 border-t border-zinc-800 rounded-t-2xl">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-white">Following</SheetTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translatey-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search following..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-900 border-zinc-800"
              />
            </div>
          </SheetHeader>
          
          {loadingFollowing ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : following.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-400">Not following anyone</p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(80vh-140px)] pr-4">
              <div className="space-y-2">
                {following.map((followingUser) => (
                  <div 
                    key={followingUser._id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-900/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setShowFollowingDialog(false);
                      router.push(`/${followingUser.username}/profile`);
                    }}
                  >
                    <Avatar className="h-10 w-10 border border-zinc-800">
                      <AvatarImage src={followingUser.picture} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm">
                        {followingUser.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="font-medium text-sm truncate">
                          {followingUser.name}
                        </p>
                        {followingUser.isPremium && (
                          <Crown className="h-3 w-3 text-amber-500 fill-amber-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 truncate">@{followingUser.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Note Card Component - UPDATED FOR MOBILE
function NoteCard({ note, onClick, getTimeAgo, isMobile = false }: {
  note: Note;
  onClick: () => void;
  getTimeAgo: (dateString: string) => string;
  isMobile?: boolean;
}) {
  return (
    <div 
      className={cn(
        "group relative rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 transition-all cursor-pointer",
        isMobile ? "min-h-[180px]" : ""
      )}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-zinc-900">
        <img
          src={note.thumbnail}
          alt={note.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Premium Badge */}
        {note.isPremium && (
          <div className="absolute top-2 left-2">
            <div className="bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full p-1">
              <Crown className="h-3 w-3 text-white" />
            </div>
          </div>
        )}

        {/* Overlay Stats */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3 text-white opacity-80">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span className="text-xs sm:text-sm">
                  {note.views > 1000 ? `${(note.views / 1000).toFixed(1)}k` : note.views}
                </span>
              </span>
            </div>
            {note.status === 'completed' && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                Complete
              </Badge>
            )}
            {note.status === 'processing' && (
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                Processing
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        <h3 className="font-medium line-clamp-2 mb-2 text-sm group-hover:text-blue-400 transition-colors min-h-[40px]">
          {note.title}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>{getTimeAgo(note.createdAt)}</span>
          
          {note.pdfThumbnail && (
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span className="hidden xs:inline">PDF</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Note List Item Component
function NoteListItem({ note, onClick, getTimeAgo }: {
  note: Note;
  onClick: () => void;
  getTimeAgo: (dateString: string) => string;
}) {
  return (
    <div 
      className="flex items-center gap-3 p-3 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900/50 transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative flex-shrink-0">
        <div className="w-16 h-12 rounded overflow-hidden">
          <img
            src={note.thumbnail}
            alt={note.title}
            className="w-full h-full object-cover"
          />
        </div>
        {note.isPremium && (
          <div className="absolute -top-1 -right-1">
            <Crown className="h-3 w-3 text-amber-500 fill-amber-500" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate text-sm group-hover:text-blue-400 transition-colors">
          {note.title}
        </h4>
        <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {note.views > 1000 ? `${(note.views / 1000).toFixed(1)}k` : note.views}
          </span>
          <span>{getTimeAgo(note.createdAt)}</span>
          {note.status === 'completed' && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
              Complete
            </Badge>
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}