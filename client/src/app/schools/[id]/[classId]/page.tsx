"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Send, Ghost, UserCircle, ShieldAlert, 
  FileText, Image as ImageIcon, BarChart3, X, 
  Crown, UserPlus, Flag, AlertCircle, Plus,
  Bell, Pin, Trash2, Edit, Check, Search,
  Users, BookOpen, Calendar, Download,
  Filter, MoreVertical, ThumbsUp, MessageCircle,
  Share, Bookmark, Eye, EyeOff, Lock, Unlock,
  Info,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- Types ---
type MessageType = 'text' | 'image' | 'poll' | 'file' | 'announcement';
type UserRole = 'admin' | 'monitor' | 'vice-monitor' | 'student';
type PollOption = {
  id: number;
  text: string;
  votes: number;
  voters: string[];
};

interface User {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
  isOnline: boolean;
}

interface Message {
  id: string;
  userId: string;
  user: User;
  text: string;
  type: MessageType;
  content?: any;
  tags: string[];
  isPinned: boolean;
  isAnnouncement: boolean;
  isAnonymous: boolean;
  reactions: { [key: string]: string[] };
  comments: Message[];
  time: Date;
  likes: number;
  isEdited: boolean;
}

interface PollData {
  question: string;
  options: PollOption[];
  isMultiple: boolean;
  totalVotes: number;
  expiresAt?: Date;
}

interface Notice {
  id: string;
  title: string;
  content: string;
  author: User;
  tags: string[];
  isPinned: boolean;
  createdAt: Date;
  attachments?: string[];
}

interface Classroom {
  id: string;
  name: string;
  subject: string;
  code: string;
  admin: User;
  monitors: User[];
  students: User[];
  notices: Notice[];
}

// --- Custom Hooks ---
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

// --- Main Component ---
export default function NoticeBoard() {
  const params = useParams();
  const router = useRouter();
  const { width } = useWindowSize();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  
  // --- States ---
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const [input, setInput] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'notices' | 'polls' | 'files'>('chat');
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [newPollQuestion, setNewPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [replyToMessageId, setReplyToMessageId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showAssignMonitor, setShowAssignMonitor] = useState(false);
  const [assignToUserId, setAssignToUserId] = useState<string>("");
  
  // --- Mock Data ---
  const [currentUser, setCurrentUser] = useState<User>({
    id: "1",
    name: "Om Avcher",
    avatar: "",
    role: "monitor",
    isOnline: true
  });

  const [classroom, setClassroom] = useState<Classroom>({
    id: params.classId as string || "class-101",
    name: "JEE Advanced 2024",
    subject: "Physics & Maths",
    code: "JEE-ADV-24",
    admin: {
      id: "1",
      name: "Teacher Raj",
      avatar: "",
      role: "admin",
      isOnline: true
    },
    monitors: [
      {
        id: "1",
        name: "Om Avcher",
        avatar: "",
        role: "monitor",
        isOnline: true
      },
      {
        id: "2",
        name: "StudyBot",
        avatar: "",
        role: "vice-monitor",
        isOnline: true
      }
    ],
    students: [
      { id: "3", name: "Alice", avatar: "", role: "student", isOnline: true },
      { id: "4", name: "Bob", avatar: "", role: "student", isOnline: false },
      { id: "5", name: "Charlie", avatar: "", role: "student", isOnline: true },
    ],
    notices: [
      {
        id: "1",
        title: "Important Formulas for Rotation",
        content: "Make sure to review all torque and angular momentum formulas before the test.",
        author: { id: "1", name: "Om Avcher", avatar: "", role: "monitor", isOnline: true },
        tags: ["#important", "#formula"],
        isPinned: true,
        createdAt: new Date(),
        attachments: ["formula_sheet.pdf"]
      },
      {
        id: "2",
        title: "Mock Test Tonight @ 9PM",
        content: "Full-length mock test covering chapters 1-5. Be prepared!",
        author: { id: "2", name: "StudyBot", avatar: "", role: "vice-monitor", isOnline: true },
        tags: ["#test", "#reminder"],
        isPinned: true,
        createdAt: new Date(Date.now() - 3600000),
      }
    ]
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      userId: "1",
      user: { id: "1", name: "Om Avcher", avatar: "", role: "monitor", isOnline: true },
      text: "Welcome to the JEE war room! Use #important for highlights and #doubt for questions.",
      type: 'text',
      tags: ["#welcome", "#important"],
      isPinned: true,
      isAnnouncement: true,
      isAnonymous: false,
      reactions: {},
      comments: [],
      time: new Date(Date.now() - 86400000),
      likes: 12,
      isEdited: false
    },
    {
      id: "2",
      userId: "2",
      user: { id: "2", name: "StudyBot", avatar: "", role: "vice-monitor", isOnline: true },
      text: "Check the notice board for today's goals and #important updates.",
      type: 'text',
      tags: ["#update", "#notice"],
      isPinned: false,
      isAnnouncement: false,
      isAnonymous: false,
      reactions: { "👍": ["3", "4"] },
      comments: [],
      time: new Date(Date.now() - 43200000),
      likes: 5,
      isEdited: false
    },
    {
      id: "3",
      userId: "3",
      user: { id: "3", name: "Alice", avatar: "", role: "student", isOnline: true },
      text: "Can someone explain #doubt the concept of rotational inertia?",
      type: 'text',
      tags: ["#doubt", "#physics"],
      isPinned: false,
      isAnnouncement: false,
      isAnonymous: false,
      reactions: {},
      comments: [
        {
          id: "3-1",
          userId: "1",
          user: { id: "1", name: "Om Avcher", avatar: "", role: "monitor", isOnline: true },
          text: "Rotational inertia depends on mass distribution. Check chapter 7.",
          type: 'text',
          tags: [],
          isPinned: false,
          isAnnouncement: false,
          isAnonymous: false,
          reactions: {},
          comments: [],
          time: new Date(Date.now() - 3600000),
          likes: 3,
          isEdited: false
        }
      ],
      time: new Date(Date.now() - 7200000),
      likes: 2,
      isEdited: false
    }
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // --- Effects ---
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Auto-hide sidebar on mobile when switching tabs
    if (isMobile && activeTab !== 'chat') {
      setShowSidebar(false);
    }
  }, [activeTab, isMobile]);

  // --- Handlers ---
  const handleSend = useCallback((type: MessageType = 'text', content?: any) => {
    if (!input.trim() && type === 'text' && !selectedFile) return;

    const tags = input.match(/#\w+/g) || [];
    
    const newMessage: Message = {
      id: Date.now().toString(),
      userId: currentUser.id,
      user: currentUser,
      text: input,
      type: type,
      content: content || (selectedFile ? { file: selectedFile, type: selectedFile.type } : null),
      tags,
      isPinned: false,
      isAnnouncement: currentUser.role === 'monitor' || currentUser.role === 'admin',
      isAnonymous: isAnonymous && currentUser.role === 'student',
      reactions: {},
      comments: [],
      time: new Date(),
      likes: 0,
      isEdited: false
    };

    setMessages(prev => [...prev, newMessage]);
    setInput("");
    setSelectedFile(null);
    setIsAnonymous(false);
  }, [input, currentUser, isAnonymous, selectedFile]);

  const handleAddPollOption = () => {
    setPollOptions([...pollOptions, ""]);
  };

  const handlePollOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handleCreatePoll = () => {
    if (!newPollQuestion.trim() || pollOptions.some(opt => !opt.trim())) return;

    const pollData: PollData = {
      question: newPollQuestion,
      options: pollOptions.map((opt, i) => ({
        id: i,
        text: opt,
        votes: 0,
        voters: []
      })),
      isMultiple: false,
      totalVotes: 0
    };

    handleSend('poll', pollData);
    setShowPollCreator(false);
    setNewPollQuestion("");
    setPollOptions(["", ""]);
  };

  const handleVotePoll = (messageId: string, optionId: number) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.type === 'poll' && msg.content) {
        const updatedOptions = msg.content.options.map((opt: PollOption) => {
          if (opt.id === optionId && !opt.voters.includes(currentUser.id)) {
            return {
              ...opt,
              votes: opt.votes + 1,
              voters: [...opt.voters, currentUser.id]
            };
          }
          return opt;
        });

        return {
          ...msg,
          content: {
            ...msg.content,
            options: updatedOptions,
            totalVotes: msg.content.totalVotes + 1
          }
        };
      }
      return msg;
    }));
  };

  const handleAssignMonitor = () => {
    if (!assignToUserId) return;

    const user = classroom.students.find(s => s.id === assignToUserId);
    if (user) {
      setClassroom(prev => ({
        ...prev,
        monitors: [...prev.monitors, { ...user, role: 'vice-monitor' as UserRole }],
        students: prev.students.filter(s => s.id !== assignToUserId)
      }));
      setShowAssignMonitor(false);
      setAssignToUserId("");
    }
  };

  const handleAddReaction = (messageId: string, reaction: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const currentReactions = { ...msg.reactions };
        if (!currentReactions[reaction]) {
          currentReactions[reaction] = [];
        }
        if (!currentReactions[reaction].includes(currentUser.id)) {
          currentReactions[reaction] = [...currentReactions[reaction], currentUser.id];
        }
        return { ...msg, reactions: currentReactions };
      }
      return msg;
    }));
  };

  const handlePinMessage = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isPinned: !msg.isPinned } : msg
    ));
  };

  const handleDeleteMessage = (messageId: string) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setInput(file.name);
    }
  };

  const handleAddNotice = () => {
    const newNotice: Notice = {
      id: Date.now().toString(),
      title: "New Notice",
      content: "Add your notice content here...",
      author: currentUser,
      tags: ["#new"],
      isPinned: false,
      createdAt: new Date()
    };

    setClassroom(prev => ({
      ...prev,
      notices: [newNotice, ...prev.notices]
    }));
  };

  // --- Filtered Messages ---
  const filteredMessages = messages.filter(msg => {
    if (selectedTag && !msg.tags.includes(selectedTag)) return false;
    if (searchQuery && !msg.text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const pinnedMessages = messages.filter(msg => msg.isPinned);
  const announcementMessages = messages.filter(msg => msg.isAnnouncement);

  // --- Render Helpers ---
  const renderText = (text: string) => {
    return text.split(" ").map((word, i) => {
      if (word.startsWith("#")) {
        return (
          <button
            key={i}
            onClick={() => setSelectedTag(word === selectedTag ? null : word)}
            className={cn(
              "inline-block px-1.5 py-0.5 rounded text-xs font-bold mr-1 transition-all hover:scale-105",
              word === selectedTag 
                ? "bg-red-600 text-white" 
                : "bg-red-500/10 text-red-500"
            )}
          >
            {word}
          </button>
        );
      }
      return <span key={i}>{word} </span>;
    });
  };

  const renderMessageContent = (message: Message) => {
    switch (message.type) {
      case 'poll':
        return <PollView data={message.content} onVote={(optionId) => handleVotePoll(message.id, optionId)} />;
      case 'image':
        return (
          <div className="mt-2">
            <img 
              src={message.content?.url || URL.createObjectURL(message.content.file)} 
              alt="Uploaded" 
              className="max-w-full rounded-lg max-h-64 object-cover"
            />
          </div>
        );
      case 'file':
        return (
          <div className="mt-2 p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-2">
              <FileText size={16} />
              <span className="text-sm font-medium">{message.content.file.name}</span>
              <Download size={14} className="ml-auto cursor-pointer hover:text-red-500" />
            </div>
          </div>
        );
      default:
        return renderText(message.text);
    }
  };

  // --- Components ---
  const MessageItem = ({ message }: { message: Message }) => {
    const [showActions, setShowActions] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [commentInput, setCommentInput] = useState("");

    const handleAddComment = () => {
      if (!commentInput.trim()) return;

      const newComment: Message = {
        id: `${message.id}-${Date.now()}`,
        userId: currentUser.id,
        user: currentUser,
        text: commentInput,
        type: 'text',
        tags: [],
        isPinned: false,
        isAnnouncement: false,
        isAnonymous: isAnonymous,
        reactions: {},
        comments: [],
        time: new Date(),
        likes: 0,
        isEdited: false
      };

      setMessages(prev => prev.map(msg => 
        msg.id === message.id 
          ? { ...msg, comments: [...msg.comments, newComment] }
          : msg
      ));
      setCommentInput("");
    };

    return (
      <div 
        className={cn(
          "group relative p-4 rounded-2xl transition-all",
          message.isPinned ? "bg-yellow-500/5 border border-yellow-500/20" :
          message.isAnnouncement ? "bg-red-500/5 border border-red-500/20" :
          "bg-neutral-900/40 border border-white/5"
        )}
      >
        {/* Message Header */}
        <div className="flex items-start gap-3 mb-2">
          <Avatar className="h-8 w-8 border border-white/10 shrink-0">
            <AvatarFallback className={cn(
              "text-xs font-black",
              message.isAnonymous ? "bg-red-900" : "bg-neutral-800"
            )}>
              {message.isAnonymous ? "?" : message.user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn(
                "text-xs font-bold",
                message.isAnonymous ? "text-red-500" : "text-white"
              )}>
                {message.isAnonymous ? "Anonymous" : message.user.name}
              </span>
              
              {message.user.role === 'monitor' && (
                <Crown size={10} className="text-yellow-500" />
              )}
              {message.user.role === 'vice-monitor' && (
                <ShieldAlert size={10} className="text-blue-500" />
              )}
              {message.user.role === 'admin' && (
                <ShieldAlert size={10} className="text-green-500" />
              )}

              <span className="text-[10px] text-neutral-500">
                {message.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>

              {message.isEdited && (
                <span className="text-[10px] text-neutral-600 italic">edited</span>
              )}

              {message.isPinned && (
                <Pin size={10} className="text-yellow-500 ml-auto" />
              )}
            </div>

            {/* Tags */}
            {message.tags.length > 0 && (
              <div className="flex gap-1 mt-1 flex-wrap">
                {message.tags.map(tag => (
                  <span 
                    key={tag}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-neutral-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Message Actions */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/5 rounded"
            >
              <MoreVertical size={14} />
            </button>

            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-6 w-48 bg-neutral-950 border border-white/10 rounded-lg shadow-xl z-50"
                >
                  <div className="p-1">
                    {['monitor', 'admin'].includes(currentUser.role) && (
                      <button
                        onClick={() => handlePinMessage(message.id)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-white/5 rounded flex items-center gap-2"
                      >
                        <Pin size={12} />
                        {message.isPinned ? 'Unpin' : 'Pin'}
                      </button>
                    )}
                    
                    {currentUser.id === message.userId && (
                      <>
                        <button
                          onClick={() => setEditingMessageId(message.id)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-white/5 rounded flex items-center gap-2"
                        >
                          <Edit size={12} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-red-500/10 text-red-500 rounded flex items-center gap-2"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => setReplyToMessageId(message.id)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-white/5 rounded flex items-center gap-2"
                    >
                      <MessageCircle size={12} />
                      Reply
                    </button>
                    
                    <button className="w-full text-left px-3 py-2 text-xs hover:bg-white/5 rounded flex items-center gap-2">
                      <Share size={12} />
                      Share
                    </button>
                    
                    <button className="w-full text-left px-3 py-2 text-xs hover:bg-white/5 rounded flex items-center gap-2">
                      <Bookmark size={12} />
                      Save
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Message Content */}
        <div className="mt-2">
          {editingMessageId === message.id ? (
            <div className="space-y-2">
              <input
                type="text"
                defaultValue={message.text}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setMessages(prev => prev.map(msg =>
                      msg.id === message.id 
                        ? { ...msg, text: e.currentTarget.value, isEdited: true }
                        : msg
                    ));
                    setEditingMessageId(null);
                  }
                }}
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setEditingMessageId(null)}>
                  Cancel
                </Button>
                <Button size="sm" variant="destructive">
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-neutral-300">
              {renderMessageContent(message)}
            </div>
          )}
        </div>

        {/* Reactions */}
        <div className="flex items-center gap-2 mt-3">
          <div className="flex gap-1">
            {Object.entries(message.reactions).map(([emoji, users]) => (
              <button
                key={emoji}
                onClick={() => handleAddReaction(message.id, emoji)}
                className="text-xs px-2 py-1 bg-white/5 rounded-full hover:bg-white/10"
              >
                {emoji} {users.length}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => handleAddReaction(message.id, "👍")}
            className="text-xs px-2 py-1 hover:bg-white/5 rounded-full"
          >
            👍
          </button>
          
          <button
            onClick={() => handleAddReaction(message.id, "❤️")}
            className="text-xs px-2 py-1 hover:bg-white/5 rounded-full"
          >
            ❤️
          </button>
          
          <button
            onClick={() => handleAddReaction(message.id, "🔥")}
            className="text-xs px-2 py-1 hover:bg-white/5 rounded-full"
          >
            🔥
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="text-xs px-2 py-1 hover:bg-white/5 rounded-full ml-auto flex items-center gap-1"
          >
            <MessageCircle size={12} />
            {message.comments.length} replies
          </button>

          <button className="text-xs px-2 py-1 hover:bg-white/5 rounded-full flex items-center gap-1">
            <Share size={12} />
            Share
          </button>
        </div>

        {/* Comments */}
        {showComments && (
          <div className="mt-4 pl-4 border-l border-white/10">
            <div className="space-y-3 mb-3">
              {message.comments.map(comment => (
                <div key={comment.id} className="text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs">
                      {comment.user.name}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {comment.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-neutral-400 mt-1">{comment.text}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <Button size="sm" onClick={handleAddComment}>
                <Send size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const PollView = ({ data, onVote }: { data: PollData; onVote: (optionId: number) => void }) => {
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-bold">{data.question}</h4>
        <div className="space-y-2">
          {data.options.map((option) => {
            const percentage = data.totalVotes > 0 
              ? Math.round((option.votes / data.totalVotes) * 100)
              : 0;
            
            return (
              <button
                key={option.id}
                onClick={() => onVote(option.id)}
                className="w-full text-left"
              >
                <div className="relative p-3 rounded-lg border border-white/10 hover:border-red-500/30 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">{option.text}</span>
                    <span className="text-xs text-neutral-500">{percentage}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-1">
                    {option.votes} vote{option.votes !== 1 ? 's' : ''}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="text-xs text-neutral-500">
          {data.totalVotes} total votes • {data.isMultiple ? 'Multiple votes allowed' : 'Single vote only'}
        </div>
      </div>
    );
  };

  const NoticeItem = ({ notice }: { notice: Notice }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <div className="p-4 rounded-xl border border-white/10 bg-neutral-900/40">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="font-bold text-sm flex items-center gap-2">
              {notice.title}
              {notice.isPinned && <Pin size={12} className="text-yellow-500" />}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-neutral-500">
                By {notice.author.name}
              </span>
              <span className="text-[10px] text-neutral-600">
                {notice.createdAt.toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex gap-1">
            {notice.isPinned && currentUser.role === 'monitor' && (
              <button className="p-1 hover:bg-white/5 rounded">
                <Edit size={12} />
              </button>
            )}
            <button className="p-1 hover:bg-white/5 rounded">
              <Bell size={12} />
            </button>
          </div>
        </div>

        <p className={cn(
          "text-sm text-neutral-400 mb-3",
          !isExpanded && "line-clamp-2"
        )}>
          {notice.content}
        </p>

        {notice.content.length > 100 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-red-500 hover:text-red-400"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}

        {notice.tags.length > 0 && (
          <div className="flex gap-1 mt-3 flex-wrap">
            {notice.tags.map(tag => (
              <span
                key={tag}
                className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-neutral-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {notice.attachments && notice.attachments.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <FileText size={12} />
              <span>Attachments: {notice.attachments.length}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const UserListItem = ({ user, showActions = false }: { user: User; showActions?: boolean }) => (
    <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="h-8 w-8">
            <AvatarFallback className={cn(
              "text-xs",
              user.role === 'admin' ? "bg-green-900" :
              user.role === 'monitor' ? "bg-yellow-900" :
              user.role === 'vice-monitor' ? "bg-blue-900" :
              "bg-neutral-800"
            )}>
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className={cn(
            "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-neutral-950",
            user.isOnline ? "bg-green-500" : "bg-neutral-500"
          )} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{user.name}</span>
            {user.role === 'monitor' && <Crown size={10} className="text-yellow-500" />}
            {user.role === 'vice-monitor' && <ShieldAlert size={10} className="text-blue-500" />}
            {user.role === 'admin' && <ShieldAlert size={10} className="text-green-500" />}
          </div>
          <span className="text-xs text-neutral-500 capitalize">{user.role}</span>
        </div>
      </div>
      
      {showActions && currentUser.role === 'monitor' && user.role === 'student' && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setAssignToUserId(user.id);
            setShowAssignMonitor(true);
          }}
        >
          <UserPlus size={12} />
        </Button>
      )}
    </div>
  );

  // --- Main Render ---
  return (
    <div className="h-screen flex flex-col bg-neutral-950 text-white overflow-hidden">
      {/* Top Header */}
      <header className="h-16 flex items-center justify-between px-4 border-b border-white/5 bg-neutral-950/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/5 rounded-full transition-colors lg:hidden"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest">
              {classroom.name}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-neutral-500">
                {classroom.code}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5">
                {classroom.subject}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm w-40 md:w-56 focus:w-64 transition-all"
            />
          </div>

          {/* Notifications */}
          <button className="p-2 hover:bg-white/5 rounded-full relative">
            <Bell size={20} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Toggle Sidebar */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <Info size={20} />
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Mobile Bottom Navigation */}
        {isMobile ? (
          <div className="fixed bottom-0 left-0 right-0 h-16 bg-neutral-950 border-t border-white/5 z-50">
            <div className="flex h-full">
              {(['chat', 'notices', 'polls', 'files'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center text-xs font-medium",
                    activeTab === tab ? "text-red-500" : "text-neutral-500"
                  )}
                >
                  {tab === 'chat' && <MessageCircle size={20} />}
                  {tab === 'notices' && <Bell size={20} />}
                  {tab === 'polls' && <BarChart3 size={20} />}
                  {tab === 'files' && <FileText size={20} />}
                  <span className="capitalize mt-1">{tab}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Desktop Left Sidebar */
          <aside className="w-64 border-r border-white/5 bg-neutral-900/20 hidden md:flex flex-col">
            <div className="p-4 border-b border-white/5">
              <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-3">
                Navigation
              </h3>
              <div className="space-y-1">
                {(['chat', 'notices', 'polls', 'files'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-3",
                      activeTab === tab 
                        ? "bg-red-500/10 text-red-500" 
                        : "hover:bg-white/5"
                    )}
                  >
                    {tab === 'chat' && <MessageCircle size={16} />}
                    {tab === 'notices' && <Bell size={16} />}
                    {tab === 'polls' && <BarChart3 size={16} />}
                    {tab === 'files' && <FileText size={16} />}
                    <span className="capitalize">{tab}</span>
                    {tab === 'chat' && (
                      <span className="ml-auto text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                        {messages.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="p-4 border-b border-white/5">
              <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-3">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-400">Online</span>
                  <span className="text-sm font-bold">
                    {[...classroom.monitors, ...classroom.students].filter(u => u.isOnline).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-400">Messages</span>
                  <span className="text-sm font-bold">{messages.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-400">Notices</span>
                  <span className="text-sm font-bold">{classroom.notices.length}</span>
                </div>
              </div>
            </div>

            {/* Active Users */}
            <div className="p-4 flex-1">
              <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-3">
                Active Now ({[...classroom.monitors, ...classroom.students].filter(u => u.isOnline).length})
              </h3>
              <div className="space-y-2">
                {[...classroom.monitors, ...classroom.students]
                  .filter(user => user.isOnline)
                  .map(user => (
                    <UserListItem key={user.id} user={user} />
                  ))}
              </div>
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Content Header */}
          <div className="p-4 border-b border-white/5 bg-neutral-950/80 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black capitalize">
                  {activeTab === 'chat' && 'Class Chat'}
                  {activeTab === 'notices' && 'Notice Board'}
                  {activeTab === 'polls' && 'Polls & Surveys'}
                  {activeTab === 'files' && 'Shared Files'}
                </h2>
                <p className="text-sm text-neutral-500">
                  {activeTab === 'chat' && `${messages.length} messages • ${pinnedMessages.length} pinned`}
                  {activeTab === 'notices' && `${classroom.notices.length} notices • ${classroom.notices.filter(n => n.isPinned).length} pinned`}
                  {activeTab === 'polls' && `${messages.filter(m => m.type === 'poll').length} active polls`}
                  {activeTab === 'files' && `${messages.filter(m => m.type === 'file').length} files shared`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Tag Filter */}
                {activeTab === 'chat' && (
                  <div className="flex gap-1">
                    {['#important', '#doubt', '#announcement'].map(tag => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                          selectedTag === tag
                            ? "bg-red-600 text-white"
                            : "bg-white/5 text-neutral-400 hover:bg-white/10"
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}

                {/* Add Button */}
                {currentUser.role !== 'student' && (
                  <Button
                    onClick={() => {
                      if (activeTab === 'notices') handleAddNotice();
                      if (activeTab === 'polls') setShowPollCreator(true);
                    }}
                    className="gap-2"
                  >
                    <Plus size={16} />
                    Add {activeTab === 'notices' ? 'Notice' : activeTab === 'polls' ? 'Poll' : 'New'}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeTab === 'chat' && (
              <>
                {/* Pinned Messages */}
                {pinnedMessages.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-3 flex items-center gap-2">
                      <Pin size={12} />
                      Pinned Messages
                    </h4>
                    <div className="space-y-3">
                      {pinnedMessages.map(msg => (
                        <MessageItem key={msg.id} message={msg} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Announcements */}
                {announcementMessages.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-3">
                      Announcements
                    </h4>
                    <div className="space-y-3">
                      {announcementMessages.map(msg => (
                        <MessageItem key={msg.id} message={msg} />
                      ))}
                    </div>
                  </div>
                )}

                {/* All Messages */}
                <div className="space-y-4">
                  {filteredMessages
                    .filter(msg => !msg.isPinned && !msg.isAnnouncement)
                    .map(msg => (
                      <MessageItem key={msg.id} message={msg} />
                    ))}
                </div>
              </>
            )}

            {activeTab === 'notices' && (
              <div className="space-y-4">
                {classroom.notices.map(notice => (
                  <NoticeItem key={notice.id} notice={notice} />
                ))}
              </div>
            )}

            {activeTab === 'polls' && (
              <div className="space-y-4">
                {messages
                  .filter(msg => msg.type === 'poll')
                  .map(msg => (
                    <div key={msg.id} className="p-4 rounded-xl border border-white/10 bg-neutral-900/40">
                      <PollView 
                        data={msg.content} 
                        onVote={(optionId) => handleVotePoll(msg.id, optionId)} 
                      />
                    </div>
                  ))}
              </div>
            )}

            {activeTab === 'files' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {messages
                  .filter(msg => msg.type === 'file')
                  .map(msg => (
                    <div key={msg.id} className="p-4 rounded-xl border border-white/10 bg-neutral-900/40">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-white/5 rounded-lg">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm truncate">
                            {msg.content.file.name}
                          </h4>
                          <p className="text-xs text-neutral-500">
                            Uploaded by {msg.user.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Download size={14} />
                          Download
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Input Section - Only for chat tab */}
          {activeTab === 'chat' && (
            <div className="p-4 border-t border-white/5 bg-neutral-950/80 backdrop-blur-xl">
              <div className="max-w-4xl mx-auto space-y-3">
                {/* Quick Actions */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  <button
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all shrink-0",
                      isAnonymous
                        ? "bg-red-600 border-red-500 text-white"
                        : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
                    )}
                  >
                    <Ghost size={14} />
                    Anonymous
                  </button>

                  <label className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-neutral-400 hover:text-white text-xs font-medium cursor-pointer shrink-0">
                    <ImageIcon size={14} />
                    Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>

                  <label className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-neutral-400 hover:text-white text-xs font-medium cursor-pointer shrink-0">
                    <FileText size={14} />
                    File
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>

                  <button
                    onClick={() => setShowPollCreator(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-neutral-400 hover:text-white text-xs font-medium shrink-0"
                  >
                    <BarChart3 size={14} />
                    Poll
                  </button>

                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-neutral-400 hover:text-white text-xs font-medium shrink-0">
                    <Calendar size={14} />
                    Schedule
                  </button>
                </div>

                {/* Input Area */}
                <div className="flex items-center gap-2 bg-white/5 rounded-2xl p-2 border border-white/10">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={
                      isAnonymous
                        ? "Ask anonymously... (use #tags)"
                        : "Type your message... (use #important, #doubt, #question)"
                    }
                    className="flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-neutral-500"
                  />
                  
                  <div className="flex items-center gap-1">
                    {selectedFile && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg mr-2">
                        <span className="text-xs truncate max-w-[100px]">
                          {selectedFile.name}
                        </span>
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="p-0.5 hover:bg-white/10 rounded"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleSend()}
                      className="p-2 text-red-500 hover:text-red-400 hover:scale-110 transition-transform"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>

                {/* Quick Tags */}
                <div className="flex gap-1 justify-center">
                  {['#important', '#doubt', '#question', '#notes', '#urgent'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => setInput(prev => prev + ` ${tag}`)}
                      className="text-xs px-2 py-1 rounded bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar - Notice Board & Staff */}
        <AnimatePresence>
          {(showSidebar || !isMobile) && (
            <motion.aside
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className={cn(
                "w-80 border-l border-white/5 bg-neutral-950/80 backdrop-blur-xl flex flex-col",
                "fixed inset-y-0 right-0 z-40 lg:static lg:flex",
                isMobile ? "w-full" : ""
              )}
            >
              {/* Sidebar Header */}
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-xs font-black uppercase tracking-widest text-neutral-500">
                  Notice Board & Staff
                </h2>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="lg:hidden p-1 hover:bg-white/5 rounded"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Notices Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500">
                      Pinned Notices
                    </h3>
                    {currentUser.role !== 'student' && (
                      <Button size="sm" variant="ghost" onClick={handleAddNotice}>
                        <Plus size={12} />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {classroom.notices
                      .filter(notice => notice.isPinned)
                      .slice(0, 3)
                      .map(notice => (
                        <NoticeItem key={notice.id} notice={notice} />
                      ))}
                  </div>
                </div>

                {/* Staff Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500">
                      Class Monitors
                    </h3>
                    {currentUser.role === 'monitor' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowAssignMonitor(true)}
                      >
                        <UserPlus size={12} />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {classroom.monitors.map(user => (
                      <UserListItem key={user.id} user={user} />
                    ))}
                  </div>
                </div>

                {/* Class Members */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-4">
                    Class Members ({classroom.students.length})
                  </h3>
                  <div className="space-y-2">
                    {classroom.students.slice(0, 5).map(user => (
                      <UserListItem key={user.id} user={user} showActions />
                    ))}
                    {classroom.students.length > 5 && (
                      <button className="w-full text-center text-xs text-neutral-500 hover:text-white py-2">
                        View all {classroom.students.length} members
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar Footer */}
              <div className="p-6 border-t border-white/5">
                <div className="text-xs text-neutral-500 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={12} />
                    <span>Monitors can pin messages and assign roles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flag size={12} />
                    <span>Report inappropriate content to admins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle size={12} />
                    <span>Use #tags for better organization</span>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Modal Overlays */}
      <AnimatePresence>
        {/* Poll Creator Modal */}
        {showPollCreator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPollCreator(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-neutral-900 rounded-2xl border border-white/10 p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-4">Create New Poll</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Question</label>
                  <input
                    type="text"
                    value={newPollQuestion}
                    onChange={(e) => setNewPollQuestion(e.target.value)}
                    placeholder="What's the hardest chapter?"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Options</label>
                    <button
                      onClick={handleAddPollOption}
                      className="text-xs text-red-500 hover:text-red-400"
                    >
                      + Add Option
                    </button>
                  </div>
                  <div className="space-y-2">
                    {pollOptions.map((option, index) => (
                      <input
                        key={index}
                        type="text"
                        value={option}
                        onChange={(e) => handlePollOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="multiple"
                    className="rounded"
                  />
                  <label htmlFor="multiple" className="text-sm">
                    Allow multiple votes
                  </label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowPollCreator(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleCreatePoll}
                    disabled={!newPollQuestion.trim() || pollOptions.some(opt => !opt.trim())}
                  >
                    Create Poll
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Assign Monitor Modal */}
        {showAssignMonitor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAssignMonitor(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-neutral-900 rounded-2xl border border-white/10 p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-4">Assign Vice-Monitor</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Student</label>
                  <select
                    value={assignToUserId}
                    onChange={(e) => setAssignToUserId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm"
                  >
                    <option value="">Choose a student...</option>
                    {classroom.students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-sm text-neutral-400 p-3 bg-white/5 rounded-lg">
                  <p>Vice-monitors can:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Pin important messages</li>
                    <li>Manage notices</li>
                    <li>Moderate chat content</li>
                    <li>Cannot remove other monitors</li>
                  </ul>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowAssignMonitor(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleAssignMonitor}
                    disabled={!assignToUserId}
                  >
                    Assign Role
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}