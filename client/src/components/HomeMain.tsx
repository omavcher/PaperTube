"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BackgroundBeams } from './ui/background-beams';
import api from '@/config/api';
import { MultiStepLoader as Loader } from "./ui/multi-step-loader";
import { 
  IconSquareRoundedX, 
  IconBrandYoutube, 
  IconRobot, 
  IconSettings,
  IconLanguage, 
  IconListDetails,
  IconCoin,
  IconCrown
} from "@tabler/icons-react";
import { useRouter } from 'next/navigation';
import { Cover } from './ui/cover';
import { ArrowUpIcon, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import Image from 'next/image';
import { FcGoogle } from "react-icons/fc";
import SubscriptionDialog from "@/components/SubscriptionDialog";

// --- Constants ---

const LOADING_STATES = [
  { text: "Analyzing video structure..." },
  { text: "Transcribing audio tracks..." },
  { text: "Applying context & custom prompts..." },
  { text: "Synthesizing key concepts..." },
  { text: "Formatting PDF document..." },
];

const AI_MODELS = [
  {
    id: "sankshipta",
    name: "Sankshipta",
    fullName: "Sankshipta",
    accessTier: "Free",
    tokenCost: 25,
    description: "Basic colorful notes without images",
    endpoint: "free"
  },
  {
    id: "bhashasetu",
    name: "Bhasha-Setu",
    fullName: "Bhasha-Setu",
    accessTier: "Free",
    tokenCost: 50,
    description: "Advanced notes with images and enhanced styling",
    endpoint: "free"
  },
  {
    id: "parikshasarthi",
    name: "Pariksha-Sarthi",
    fullName: "Pariksha-Sarthi",
    accessTier: "Premium",
    description: "Exam-focused notes with structured output",
    endpoint: "premium"
  },
  {
    id: "vyavastha",
    name: "Vyavastha",
    fullName: "Vyavastha",
    accessTier: "Premium",
    description: "Structured notes with comprehensive coverage",
    endpoint: "premium"
  },
  {
    id: "sarlakruti",
    name: "Sarlakruti",
    fullName: "Sarlakruti",
    accessTier: "Premium",
    description: "Smart compression and summary features",
    endpoint: "premium"
  }
];

const LANGUAGES = ["English", "Hindi", "Marathi", "Bengali", "Telugu", "Tamil", "Kannada"];
const DETAIL_LEVELS = ["Brief Summary", "Standard Notes", "Comprehensive", "Bullet Points Only"];

// --- Interfaces ---

interface UserData {
  name: string;
  email: string;
  picture?: string;
  tokens?: number;
}

interface VideoInfo {
  thumbnail?: string;
  title: string;
  duration?: string;
  formattedDuration?: string;
  tooLongForFree?: boolean;
  maxFreeDurationFormatted?: string;
}

interface MembershipData {
  isActive: boolean;
  planId: string;
  planName: string;
  billingPeriod: string;
  startedAt: string;
  expiresAt: string;
  expiresInDays: number;
}

interface PlanStatusData {
  user: UserData;
  membership: MembershipData;
  tokens: {
    balance: number;
    used: number;
  };
  usageSummary: {
    notesCreated: number;
    tokenTransactions: number;
  };
  recentTransactions: any[];
}

// --- Sub-Components ---

function LoginDialog({ isOpen, onClose, onSuccess }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess: (userData: UserData, token: string) => void;
}) {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const accessToken = tokenResponse.access_token;
        const { data } = await axios.get<UserData>(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        
        const response = await api.post("/auth/google", {
          name: data.name,
          email: data.email,
          picture: data.picture,
        });

        const sessionToken = response.data.sessionToken;
        const userWithTokens = { ...data, tokens: response.data.tokens || 50 };

        localStorage.setItem("authToken", sessionToken);
        localStorage.setItem("user", JSON.stringify(userWithTokens));
        onSuccess(userWithTokens, sessionToken);
        onClose();
      } catch (err) {
        console.error("Google login error:", err);
      }
    },
    onError: (err) => console.error("Login Failed:", err),
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] sm:max-w-md bg-neutral-900 border-neutral-700 text-white rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Access Your Workspace</DialogTitle>
          <DialogDescription className="text-center text-neutral-400">
            Login to generate notes, manage tokens, and save history.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4 space-y-4">
          <button
            onClick={() => login()}
            className="flex items-center gap-3 px-6 py-3 text-base font-medium bg-white text-black rounded-xl shadow-lg hover:bg-gray-100 transition-all w-full justify-center active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <FcGoogle className="text-xl" />
            Continue with Google
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TokenDialog({ 
  isOpen, 
  onClose, 
  requiredTokens, 
  availableTokens 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  requiredTokens: number;
  availableTokens: number;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] sm:max-w-md bg-neutral-900 border-neutral-700 text-white rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl text-yellow-500">Low Token Balance</DialogTitle>
          <DialogDescription className="text-center text-neutral-400">
            You don't have enough tokens for this model.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 text-center">
          <div className="mb-4 space-y-2">
            <p className="text-sm text-neutral-300">
              Required: <span className="text-yellow-400 font-semibold">{requiredTokens} tokens</span>
            </p>
            <p className="text-sm text-neutral-300">
              Available: <span className="text-red-400 font-semibold">{availableTokens} tokens</span>
            </p>
            <p className="text-xs text-neutral-400 mt-2">
              Upgrade your plan or wait for the daily refresh.
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="w-full py-3 bg-yellow-600 rounded-xl hover:bg-yellow-500 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
          >
            Get More Tokens
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function VideoTooLongDialog({ 
  isOpen, 
  onClose, 
  videoDuration, 
  maxAllowedDuration,
  onUpgrade
}: { 
  isOpen: boolean; 
  onClose: () => void;
  videoDuration: string;
  maxAllowedDuration: string;
  onUpgrade: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] sm:max-w-md bg-neutral-900 border-neutral-700 text-white rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl text-yellow-500 flex items-center justify-center gap-2">
            <Clock className="w-5 h-5" />
            Video Too Long
          </DialogTitle>
          <DialogDescription className="text-center text-neutral-400">
            This video exceeds the free tier limit.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 text-center">
          <div className="mb-6 space-y-3">
            <div className="flex items-center justify-center gap-3 text-sm">
              <div className="text-red-400 font-semibold">
                Video: {videoDuration}
              </div>
              <div className="text-neutral-500">•</div>
              <div className="text-green-400 font-semibold">
                Free Limit: {maxAllowedDuration}
              </div>
            </div>
            <p className="text-sm text-neutral-300">
              Upgrade to Premium to process longer videos and unlock advanced features.
            </p>
          </div>
          <div className="space-y-3">
            <button 
              onClick={onUpgrade}
              className="w-full py-3 bg-yellow-600 rounded-xl hover:bg-yellow-500 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500/50 flex items-center justify-center gap-2"
            >
              <IconCrown className="w-4 h-4" />
              Upgrade to Premium
            </button>
            <button 
              onClick={onClose}
              className="w-full py-2 bg-neutral-800 rounded-xl hover:bg-neutral-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              Try a Shorter Video
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- Main Component ---

export default function HomeMain() {
  const router = useRouter();
  
  // Input States
  const [videoUrl, setVideoUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  
  // Settings States
  const [outputLanguage, setOutputLanguage] = useState('English');
  const [detailLevel, setDetailLevel] = useState('Standard Notes');
  
  // System States
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaderLoading, setLoaderLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidUrl, setIsValidUrl] = useState(false);
  
  // User/Auth States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userTokens, setUserTokens] = useState(0);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  
  // Dialog States
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showVideoTooLongDialog, setShowVideoTooLongDialog] = useState(false);
  const [tokenDialogData, setTokenDialogData] = useState({ requiredTokens: 0, availableTokens: 0 });
  const [videoTooLongData, setVideoTooLongData] = useState({ videoDuration: '', maxAllowedDuration: '' });

  const youtubeRegex = useMemo(() => 
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/, 
    []
  );

  // Check user authentication and premium status
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userDataStr = localStorage.getItem("user");
    const planStatusStr = localStorage.getItem("planStatus");
    
    if (token && userDataStr) {
      const user = JSON.parse(userDataStr);
      setIsAuthenticated(true);
      setUserTokens(user.tokens || 100);
      
      // Check for premium subscription
      if (planStatusStr) {
        try {
          const planStatus: PlanStatusData = JSON.parse(planStatusStr);
          if (planStatus.membership?.isActive) {
            setHasPremiumAccess(true);
            console.log('Premium access granted:', planStatus.membership.planName);
          }
        } catch (err) {
          console.error('Error parsing planStatus:', err);
        }
      }
    }
  }, []);

  const fetchVideoInfo = useCallback(async () => {
    if (youtubeRegex.test(videoUrl)) {
      setIsValidUrl(true);
      setLoading(true);
      setError(null);
      try {
        const response = await api.post<VideoInfo>('/notes/ytinfo', { videoUrl });
        setVideoInfo(response.data);
        
        // Only show warning if user doesn't have premium access
        if (response.data.tooLongForFree && !hasPremiumAccess) {
          setVideoTooLongData({
            videoDuration: response.data.formattedDuration || 'Unknown',
            maxAllowedDuration: response.data.maxFreeDurationFormatted || '1 hour 30 minutes'
          });
        }
      } catch (err) {
        setIsValidUrl(false);
        console.error('Error fetching video info:', err);
      } finally {
        setLoading(false);
      }
    } else {
      setIsValidUrl(false);
      setVideoInfo(null);
    }
  }, [videoUrl, youtubeRegex, hasPremiumAccess]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (videoUrl.trim()) fetchVideoInfo();
    }, 800);
    return () => clearTimeout(delayDebounceFn);
  }, [videoUrl, fetchVideoInfo]);

  const handleLoginSuccess = (user: UserData) => {
    setIsAuthenticated(true);
    setUserTokens(user.tokens || 50);
    setShowLoginDialog(false);
    
    // Re-check premium status after login
    const planStatusStr = localStorage.getItem("planStatus");
    if (planStatusStr) {
      try {
        const planStatus: PlanStatusData = JSON.parse(planStatusStr);
        if (planStatus.membership?.isActive) {
          setHasPremiumAccess(true);
        }
      } catch (err) {
        console.error('Error parsing planStatus:', err);
      }
    }
  };

  const handleModelSelect = (model: typeof AI_MODELS[0]) => {
    // Premium users can select any model without restrictions
    if (model.accessTier === "Premium" && !hasPremiumAccess && !isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }
    
    // Non-premium users need to upgrade for premium models
    if (model.accessTier === "Premium" && !hasPremiumAccess) {
      setShowPaywall(true);
      return;
    }
    
    setSelectedModel(model);
  };

  const handleCreateNote = async () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setShowLoginDialog(true);
      return;
    }

    if (!youtubeRegex.test(videoUrl)) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    // Check if video is too long (only for free users using free models)
    if (videoInfo?.tooLongForFree && !hasPremiumAccess && selectedModel.endpoint === "free") {
      setShowVideoTooLongDialog(true);
      return;
    }

    // Check if user has enough tokens for free models (only for non-premium users)
    if (selectedModel.endpoint === "free" && !hasPremiumAccess && userTokens < selectedModel.tokenCost) {
      setTokenDialogData({
        requiredTokens: selectedModel.tokenCost,
        availableTokens: userTokens
      });
      setShowTokenDialog(true);
      return;
    }

    // Only show paywall for premium models if user doesn't have premium access
    if (selectedModel.endpoint === "premium" && !hasPremiumAccess) {
      setShowPaywall(true);
      return;
    }

    setLoaderLoading(true);
    setError(null);

    try {
      // Determine endpoint based on model configuration
      // Free models always use /free endpoint, even for premium users
      // Premium models use /premium endpoint
      const endpoint = `/notes/${selectedModel.endpoint}`;

      const response = await api.post(endpoint, {
        videoUrl,
        prompt,
        model: selectedModel.id,
        settings: {
          language: outputLanguage,
          detailLevel: detailLevel
        }
      }, {
        headers: { 'Auth': authToken }
      });

      if (response.data?.newNote?.slug) {
        router.push(`/notes/${response.data.newNote.slug}`);
      }
    } catch (err: any) {
      console.error('Error creating note:', err);
      
      // Handle specific error cases
      if (err.response?.data?.code === "INSUFFICIENT_TOKENS") {
        setTokenDialogData({
          requiredTokens: err.response.data.requiredTokens,
          availableTokens: err.response.data.availableTokens
        });
        setShowTokenDialog(true);
      } else if (err.response?.data?.code === "VIDEO_TOO_LONG") {
        setVideoTooLongData({
          videoDuration: err.response.data.videoDuration,
          maxAllowedDuration: err.response.data.maxAllowedDuration
        });
        setShowVideoTooLongDialog(true);
      } else if (err.response?.data?.code === "SUBSCRIPTION_REQUIRED") {
        setShowPaywall(true);
      } else {
        setError(err.response?.data?.message || 'Generation failed. Please try again.');
      }
      
      setLoaderLoading(false);
    }
  };

  const handleUpgradeToPremium = () => {
    setShowVideoTooLongDialog(false);
    setShowPaywall(true);
  };

  // Check conditions for button state
  const isFreeModel = selectedModel.endpoint === "free";
  const isPremiumModel = selectedModel.endpoint === "premium";
  
  // Premium users don't need tokens for free models, non-premium users do
  const hasEnoughTokens = isFreeModel 
    ? (hasPremiumAccess ? true : userTokens >= selectedModel.tokenCost)
    : true;

  // Video length restrictions only apply to free users using free models
  const isVideoTooLong = videoInfo?.tooLongForFree && !hasPremiumAccess && isFreeModel;

  // Can use selected model if:
  // - For free models: always allowed for premium users, or if non-premium has enough tokens
  // - For premium models: only if user has premium access
  const canUseSelectedModel = 
    (isFreeModel && (hasPremiumAccess || hasEnoughTokens)) ||
    (isPremiumModel && hasPremiumAccess);

  const getButtonText = () => {
    if (!videoUrl) return 'Enter URL';
    if (isVideoTooLong) return 'Video Too Long';
    if (isFreeModel && !hasPremiumAccess && !hasEnoughTokens) return 'Insufficient Tokens';
    if (isPremiumModel && !hasPremiumAccess) return 'Upgrade for Premium';
    return 'Generate';
  };

  const getModelBadgeText = (model: typeof AI_MODELS[0]) => {
    if (hasPremiumAccess) {
      return model.endpoint === "free" ? `${model.tokenCost} tokens` : "Included";
    }
    return model.endpoint === "free" ? `${model.tokenCost} tokens` : "Premium";
  };

  const getModelBadgeVariant = (model: typeof AI_MODELS[0]) => {
    if (hasPremiumAccess) {
      return model.endpoint === "free" ? "green" : "yellow";
    }
    return model.endpoint === "free" ? "green" : "yellow";
  };

  return (
    <section className="w-full min-h-screen relative flex flex-col items-center justify-center overflow-x-hidden bg-black px-4 py-8 md:py-12">
      
      {/* --- Dialogs --- */}
      <LoginDialog 
        isOpen={showLoginDialog} 
        onClose={() => setShowLoginDialog(false)} 
        onSuccess={handleLoginSuccess} 
      />
      
      <TokenDialog 
        isOpen={showTokenDialog} 
        onClose={() => setShowTokenDialog(false)}
        requiredTokens={tokenDialogData.requiredTokens}
        availableTokens={tokenDialogData.availableTokens}
      />
      
      <VideoTooLongDialog
        isOpen={showVideoTooLongDialog}
        onClose={() => setShowVideoTooLongDialog(false)}
        videoDuration={videoTooLongData.videoDuration}
        maxAllowedDuration={videoTooLongData.maxAllowedDuration}
        onUpgrade={handleUpgradeToPremium}
      />
      
      {/* Subscription Dialog */}
      <SubscriptionDialog 
        open={showPaywall} 
        onOpenChange={setShowPaywall} 
      />

      {/* --- Loader --- */}
      <Loader loadingStates={LOADING_STATES} loading={loaderLoading} duration={2000} />
      {loaderLoading && (
        <button 
          className="fixed top-4 right-4 text-white z-[120] focus:outline-none focus:ring-2 focus:ring-white/30 rounded-full" 
          onClick={() => setLoaderLoading(false)}
        >
          <IconSquareRoundedX className="h-10 w-10 hover:text-red-500 transition-colors" />
        </button>
      )}

      {/* --- Main Content --- */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center animate-in fade-in-0 slide-in-from-bottom-10 duration-1000">
        
        {/* Responsive Header */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight text-center leading-tight">
          Turn <Cover><span className="text-red-500">YouTube</span></Cover> into <br />
          <span className="bg-gradient-to-r from-neutral-200 to-neutral-500 bg-clip-text text-transparent">
            Perfect Knowledge.
          </span>
        </h1>
        
        <p className="text-base sm:text-lg text-neutral-400 mb-8 sm:mb-12 max-w-2xl text-center leading-relaxed px-2">
          AI-generated notes, formatted perfectly. Select your model, set your language, and let us handle the rest.
          {hasPremiumAccess && (
            <span className="block mt-2 text-yellow-400 text-sm">
              🎉 Premium Active: Full access to all features!
            </span>
          )}
        </p>

        {/* --- The "Professional" Input Card --- */}
        <div className="w-full max-w-2xl mx-auto">
          <div className="rounded-2xl p-0.5 bg-gradient-to-b from-neutral-700/50 via-neutral-800/20 to-neutral-900/0 border border-white/10 shadow-2xl backdrop-blur-xl">
            <div className="bg-black/60 rounded-xl overflow-hidden flex flex-col gap-0">
              
              {/* 1. URL Input Area */}
              <InputGroup className="bg-transparent border-b border-white/5 rounded-none p-2 sm:p-3 focus-within:border-white/10 transition-colors">
                <InputGroupAddon className="pl-2 sm:pl-3">
                  <IconBrandYoutube className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors duration-300 ${isValidUrl ? 'text-red-500' : 'text-neutral-500'}`} />
                </InputGroupAddon>
                <InputGroupInput 
                  placeholder="Paste YouTube Video URL..." 
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="text-base sm:text-lg text-white placeholder:text-neutral-600 border-none bg-transparent h-12 sm:h-14 focus:outline-none focus:ring-0 focus:border-none"
                />
                <InputGroupAddon className="pr-2 sm:pr-3">
                  {loading ? (
                    <div className="h-5 w-5 rounded-full border-2 border-neutral-600 border-t-white animate-spin" />
                  ) : isValidUrl ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                           <div className="cursor-default">
                             {isVideoTooLong ? (
                               <Clock className="w-5 h-5 text-yellow-500" />
                             ) : (
                               <CheckCircle2 className="w-5 h-5 text-green-500" />
                             )}
                           </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {isVideoTooLong ? 'Video exceeds free limit' : 'Video found successfully'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : videoUrl.length > 0 ? (
                    <AlertCircle className="w-5 h-5 text-red-500/50" />
                  ) : null}
                </InputGroupAddon>
              </InputGroup>

              {/* 2. Video Preview (Collapsible) */}
              {videoInfo && !loading && (
                <div className="px-4 py-3 bg-neutral-900/50 border-b border-white/5 flex items-center gap-3 animate-in slide-in-from-top-2 fade-in duration-300">
                  {videoInfo.thumbnail && (
                    <Image src={videoInfo.thumbnail} alt="thumb" width={60} height={40} className="rounded object-cover w-16 h-10 opacity-90" />
                  )}
                  <div className="flex flex-col overflow-hidden flex-1">
                    <span className="text-sm text-neutral-200 truncate font-medium max-w-[200px] sm:max-w-[400px]">{videoInfo.title}</span>
                    <div className="flex items-center gap-2 mt-1">
                      {isVideoTooLong ? (
                        <span className="text-[10px] sm:text-xs text-yellow-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> 
                          {videoInfo.formattedDuration} • Upgrade required
                        </span>
                      ) : (
                        <span className="text-[10px] sm:text-xs text-green-500 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> 
                          {videoInfo.formattedDuration || 'Ready to process'}
                          {hasPremiumAccess && <span className="text-yellow-400 ml-1">• Premium</span>}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Prompt Area */}
              <InputGroup className="bg-transparent border-none rounded-none p-2 sm:p-3 min-h-[100px]">
                <InputGroupTextarea 
                  placeholder="Add specific instructions (e.g., 'Focus on math formulas', 'Explain like I'm 5')..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="text-white placeholder:text-neutral-600 border-none bg-transparent resize-none focus:outline-none focus:ring-0 text-base min-h-[80px]"
                />
              </InputGroup>

              {/* 4. The "Control Deck" (Responsive Footer) */}
              <div className="p-3 bg-neutral-900/80 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-2">
                
                {/* Top Row on Mobile: Settings */}
                <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2">
                  
                  {/* Model Selector */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 sm:py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs sm:text-sm text-neutral-300 transition-colors border border-white/5 focus:outline-none focus:ring-2 focus:ring-white/30">
                        <IconRobot className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                        <span className="truncate">{selectedModel.name}</span>
                        <Badge 
                          variant="secondary" 
                          className={`text-[10px] border-none ${
                            getModelBadgeVariant(selectedModel) === "yellow" 
                              ? "bg-yellow-600/20 text-yellow-400" 
                              : "bg-green-600/20 text-green-400"
                          }`}
                        >
                          {getModelBadgeText(selectedModel)}
                        </Badge>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-neutral-900 border-neutral-800 text-neutral-300 w-[90vw] sm:w-64" align="start">
                      <DropdownMenuLabel className="text-xs text-neutral-500 uppercase tracking-wider flex items-center justify-between">
                        Select AI Model
                        {hasPremiumAccess && (
                          <Badge className="bg-yellow-600/20 text-yellow-400 text-[10px]">PRO</Badge>
                        )}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-neutral-800" />
                      {AI_MODELS.map((model) => (
                        <DropdownMenuItem 
                          key={model.id}
                          onClick={() => handleModelSelect(model)}
                          className="flex justify-between items-center cursor-pointer focus:bg-neutral-800 focus:text-white py-3 sm:py-1.5 focus:outline-none"
                          disabled={model.endpoint === "premium" && !hasPremiumAccess && !isAuthenticated}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{model.fullName}</span>
                            <span className="text-xs text-neutral-400">{model.description}</span>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={`text-[10px] border-none ${
                              getModelBadgeVariant(model) === "yellow" 
                                ? "bg-yellow-600/20 text-yellow-400" 
                                : "bg-green-600/20 text-green-400"
                            }`}
                          >
                            {getModelBadgeText(model)}
                          </Badge>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Config Button */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 sm:py-1.5 rounded-lg bg-transparent hover:bg-neutral-800/50 text-xs sm:text-sm text-neutral-400 transition-colors border border-white/5 sm:border-transparent focus:outline-none focus:ring-2 focus:ring-white/30">
                        <IconSettings className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                        Config
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-neutral-900 border-neutral-800 text-neutral-300 w-[90vw] sm:w-64" align="start">
                      <DropdownMenuLabel className="flex items-center gap-2">
                        <IconLanguage className="w-3 h-3" /> Language
                      </DropdownMenuLabel>
                      <div className="grid grid-cols-2 gap-1 p-1">
                        {LANGUAGES.slice(0, 7).map(lang => (
                          <div 
                            key={lang} 
                            onClick={() => setOutputLanguage(lang)} 
                            className={`text-xs px-2 py-2 sm:py-1 rounded cursor-pointer text-center sm:text-left focus:outline-none focus:ring-1 focus:ring-blue-500/50 ${outputLanguage === lang ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-neutral-800'}`}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                setOutputLanguage(lang);
                              }
                            }}
                          >
                            {lang}
                          </div>
                        ))}
                      </div>
                      <DropdownMenuSeparator className="bg-neutral-800 my-2" />
                      <DropdownMenuLabel className="flex items-center gap-2">
                        <IconListDetails className="w-3 h-3" /> Detail Level
                      </DropdownMenuLabel>
                      {DETAIL_LEVELS.map((level) => (
                        <DropdownMenuItem 
                          key={level} 
                          onClick={() => setDetailLevel(level)} 
                          className={`text-xs cursor-pointer py-3 sm:py-1.5 focus:outline-none focus:bg-neutral-800 ${detailLevel === level ? 'text-blue-400' : ''}`}
                        >
                          {level} {detailLevel === level && <CheckCircle2 className="w-3 h-3 ml-auto" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Bottom Row on Mobile: Cost & Action */}
                <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3">
                  
                  {/* Token Display - Only show for free models when user is not premium */}
                  {isAuthenticated && isFreeModel && !hasPremiumAccess && (
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <IconCoin className="w-4 h-4 text-yellow-500" />
                      <span className={hasEnoughTokens ? 'text-green-400' : 'text-red-400'}>
                        {userTokens} / {selectedModel.tokenCost}
                      </span>
                    </div>
                  )}
                  
                  {hasPremiumAccess && (
                    <div className="flex items-center gap-2 text-xs text-yellow-400">
                      <IconCrown className="w-4 h-4" />
                      <span>Pro Active</span>
                    </div>
                  )}
                  
                  <Separator orientation="vertical" className="h-8 bg-white/10 hidden sm:block" />

                  <button
                    onClick={handleCreateNote}
                    disabled={!videoUrl || loading || loaderLoading || !canUseSelectedModel || isVideoTooLong}
                    className={`
                      flex-1 sm:flex-none group relative inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 sm:py-2.5 text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50
                      ${!videoUrl || !canUseSelectedModel || isVideoTooLong
                        ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' 
                        : hasPremiumAccess
                        ? 'bg-yellow-600 text-white hover:bg-yellow-500 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:scale-105 active:scale-95'
                        : isPremiumModel
                        ? 'bg-yellow-600 text-white hover:bg-yellow-500 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:scale-105 active:scale-95'
                        : 'bg-white text-black hover:bg-neutral-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95'
                      }
                    `}
                  >
                    <span>{getButtonText()}</span>
                    <ArrowUpIcon className={`w-4 h-4 transition-transform duration-300 ${!videoUrl ? '' : 'group-hover:-translate-y-1 group-hover:translate-x-1'}`} />
                  </button>
                </div>
              </div>

            </div>
          </div>
          
          {/* Error Feedback Area */}
          {error && (
            <div className="mt-4 p-3 bg-red-950/30 border border-red-500/20 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {/* Footer Text */}
          <div className="mt-8 flex flex-wrap justify-center gap-4 sm:gap-6 text-xs text-neutral-600">
             <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> AI-Powered</span>
             <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> PDF Export</span>
             <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Cloud Save</span>
             {hasPremiumAccess && (
               <span className="flex items-center gap-1 text-yellow-400"><IconCrown className="w-3 h-3" /> Premium Features</span>
             )}
          </div>

        </div>
      </div>
      <BackgroundBeams />
    </section>
  );
}