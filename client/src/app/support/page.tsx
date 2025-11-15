"use client"
import React, { useState, useEffect, useRef } from 'react'
import api from "@/config/api";

// Interfaces for the data
interface TimelineItem {
  type: 'transaction' | 'note' | 'token_transaction' | 'token_usage' | 'account';
  id: string;
  timestamp: string;
  date: string;
  title: string;
  description?: string;
  status?: 'success' | 'failed';
  amount?: number;
  tokens?: number;
  paymentId?: string;
  orderId?: string;
  packageName?: string;
  paymentMethod?: string;
  error?: string;
  slug?: string;
  thumbnail?: string;
  transactionType?: string;
  action?: string;
  metadata: {
    type: string;
    contentLength?: number;
    hasPdf?: boolean;
    thumbnailAvailable?: boolean;
    imagesCount?: number;
    razorpay_payment_id?: string;
    razorpay_order_id?: string;
  };
  formattedDate: string;
  isoDate: string;
}

interface Summary {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalNotes: number;
  totalTokenUsage: number;
  notesWithThumbnails: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    timeline: TimelineItem[];
    summary: Summary;
  };
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
}

function ServicesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null);
  const [showSupport, setShowSupport] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const authToken = localStorage.getItem('authToken');
        setIsAuthenticated(!!authToken);
        
        if (!authToken) {
          setLoading(false);
          return false;
        }
        return true;
      } catch (err) {
        console.error("Error checking authentication:", err);
        setIsAuthenticated(false);
        setLoading(false);
        return false;
      }
    };

    checkAuth();
  }, []);

  const fetchAllUserServiceData = async (): Promise<ApiResponse> => {
    try {
      const response = await api.get('/auth/services', {
        headers: {
          'Auth': `${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error("Error fetching user service data:", error);
      throw new Error(error.response?.data?.message || 'Failed to fetch service data');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetchAllUserServiceData();
      setData(response);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const openSupportForItem = (item: TimelineItem) => {
    setSelectedItem(item);
    setShowConfirmation(true);
  };

  const startSupportChat = () => {
    setShowConfirmation(false);
    setShowSupport(true);
    
    let welcomeText = `I see you need help with:\n"${selectedItem?.title}"\n\nWhat specific issue are you facing?`;
    
    // Add thumbnail if it's a note
    if (selectedItem?.type === 'note' && selectedItem?.thumbnail) {
      welcomeText = `I see you need help with this note:\n"${selectedItem?.title}"\n\nWhat specific issue are you facing?`;
    }
    
    const welcomeMessage: Message = {
      id: '1',
      text: welcomeText,
      sender: 'support',
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    
    setIsTyping(true);
    setTimeout(() => {
      const supportMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I understand. Our support team will contact you within 2 hours with a solution.",
        sender: 'support',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, supportMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-900/30';
      case 'failed': return 'bg-red-900/30';
      default: return 'bg-gray-900';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'transaction': return '💳';
      case 'note': return '📄';
      case 'token_transaction': return '🪙';
      case 'token_usage': return '⚡';
      case 'account': return '👤';
      default: return '📌';
    }
  };

  const filteredTimeline = data?.data.timeline.filter(item => {
    if (activeFilter === 'all') return true;
    return item.type === activeFilter;
  }) || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-800 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Activities</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Sign In Required</h2>
          <p className="text-gray-400">Please sign in to view your activities</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Unable to Load</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-white text-black px-6 py-3 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Support Confirmation Sheet */}
      {showConfirmation && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80">
          <div className="bg-gray-900 rounded-t-3xl w-full max-w-md mx-4 mb-4 max-h-[80vh] overflow-hidden border border-gray-800">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Get Support</h3>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-800 rounded-full transition-colors"
                >
                  <span className="text-xl text-gray-400">×</span>
                </button>
              </div>

              <div className="bg-gray-800 rounded-2xl p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center">
                    <span className="text-lg">{getTypeIcon(selectedItem.type)}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium text-sm mb-1">{selectedItem.title}</h4>
                    <p className="text-gray-400 text-xs">{formatTime(selectedItem.timestamp)}</p>
                    {selectedItem.status && (
                      <span className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${getStatusBg(selectedItem.status)} ${getStatusColor(selectedItem.status)}`}>
                        {selectedItem.status}
                      </span>
                    )}
                    {/* Show thumbnail for notes */}
                    {selectedItem.type === 'note' && selectedItem.thumbnail && (
                      <img 
                        src={selectedItem.thumbnail} 
                        alt="Note thumbnail"
                        className="w-20 h-12 rounded-lg object-cover mt-2 border border-gray-700"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={startSupportChat}
                  className="w-full bg-white text-black py-4 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Start Support Chat
                </button>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="w-full bg-gray-800 text-white py-4 rounded-2xl font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Support Chat Overlay */}
      {showSupport && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          {/* Header with Back Button */}
          <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center">
            <button
              onClick={() => setShowSupport(false)}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-800 rounded-full transition-colors mr-3"
            >
              <span className="text-xl text-white">←</span>
            </button>
            <div>
              <h3 className="font-semibold text-white">Support</h3>
              <p className="text-xs text-gray-400">We're here to help</p>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-3xl ${
                    message.sender === 'user'
                      ? 'bg-white text-black rounded-br-none'
                      : 'bg-gray-900 text-white rounded-bl-none border border-gray-800'
                  }`}
                >
                  {message.sender === 'support' && selectedItem?.type === 'note' && selectedItem?.thumbnail && message.id === '1' && (
                    <div className="mb-3">
                      <img 
                        src={selectedItem.thumbnail} 
                        alt="Note thumbnail"
                        className="w-32 h-20 rounded-lg object-cover border border-gray-700"
                      />
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-900 px-4 py-3 rounded-3xl rounded-bl-none border border-gray-800">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="bg-gray-900 border-t border-gray-800 p-4">
            <div className="flex space-x-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-gray-800 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:bg-gray-700 transition-colors"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-white text-black w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span className="text-lg">↑</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-white mb-2">Activity</h1>
          <p className="text-gray-400">Your transactions and notes</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { label: 'Transactions', value: data?.data.summary.totalTransactions || 0 },
            { label: 'Notes', value: data?.data.summary.totalNotes || 0 },
            { label: 'Successful', value: data?.data.summary.successfulTransactions || 0 },
            { label: 'Failed', value: data?.data.summary.failedTransactions || 0 }
          ].map((card, index) => (
            <div key={index} className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
              <p className="text-2xl font-semibold text-white mb-1">{card.value}</p>
              <p className="text-sm text-gray-400">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="bg-gray-900 rounded-2xl p-2 mb-6 border border-gray-800">
          <div className="flex space-x-1">
            {['all', 'transaction', 'note'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeFilter === filter
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:bg-gray-800'
                }`}
              >
                {filter === 'all' ? 'All' : 
                 filter === 'transaction' ? 'Transactions' : 'Notes'}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          {filteredTimeline.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-800">
                <span className="text-2xl">📝</span>
              </div>
              <p className="text-gray-400">No activities found</p>
            </div>
          ) : (
            filteredTimeline.map((item) => (
              <div 
                key={item.id} 
                className="bg-gray-900 rounded-2xl p-4 border border-gray-800 hover:border-gray-700 transition-all cursor-pointer active:scale-[0.98] active:bg-gray-800"
                onClick={() => openSupportForItem(item)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">{getTypeIcon(item.type)}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium mb-1 line-clamp-2">{item.title}</h3>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm text-gray-400">{formatTime(item.timestamp)}</span>
                        {item.status && (
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusBg(item.status)} ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        )}
                      </div>

                      {item.amount && (
                        <p className="text-sm font-medium text-white">{formatCurrency(item.amount)}</p>
                      )}

                      {item.tokens && (
                        <p className="text-sm text-gray-400">{item.tokens} tokens</p>
                      )}

                      {item.thumbnail && (
                        <img 
                          src={item.thumbnail} 
                          alt="Note thumbnail"
                          className="w-16 h-12 rounded-lg object-cover mt-2 border border-gray-700"
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="text-2xl text-gray-700 ml-2">→</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Support FAB */}
        <button
          onClick={() => setShowSupport(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:bg-gray-200 transition-all active:scale-95 z-40"
        >
          <span className="text-xl">💬</span>
        </button>
      </div>
    </div>
  );
}

export default ServicesPage;