"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  MessageSquareText, 
  X, 
  Send, 
  Maximize2, 
  Minimize2,
  Sparkles,
  ChevronRight,
  Loader2
} from "lucide-react";
import { 
  Surface, 
  ChatMessage, 
  QuickAction, 
  getWelcomeMessage, 
  findBestResponse,
  isGreeting,
  getGreetingResponse
} from "@/lib/chat-knowledge";
import { getUser, getProfile } from "@/lib/auth";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  
  const [surface, setSurface] = useState<Surface>('landing');
  const [userName, setUserName] = useState<string | undefined>(undefined);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const pathname = usePathname();
  const router = useRouter();

  // Determine current surface based on route and load user info
  useEffect(() => {
    async function initChat() {
      // Don't show on actual user storefronts (where customers visit)
      if (pathname.startsWith('/store/')) {
        return;
      }

      let currentSurface: Surface = 'landing';
      if (pathname.startsWith('/dashboard')) {
        currentSurface = 'dashboard';
      } else if (pathname === '/login' || pathname === '/signup') {
        currentSurface = 'auth';
      } else if (pathname === '/pricing') {
        currentSurface = 'pricing';
      }

      setSurface(currentSurface);

      // Try to get user info if on dashboard
      let name = undefined;
      if (currentSurface === 'dashboard') {
        try {
          const user = await getUser();
          if (user) {
            const profile = await getProfile(user.id);
            if (profile?.store_name) {
              name = profile.store_name;
            } else if (profile?.username) {
              name = profile.username;
            }
          }
        } catch (e) {
          // Ignore auth errors here
        }
      }
      
      setUserName(name);

      // Only set initial message if chat is empty or surface changed significantly
      if (messages.length === 0) {
        setMessages([getWelcomeMessage(currentSurface, name)]);
        setHasUnread(true);
      }
    }

    initChat();
  }, [pathname]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setHasUnread(false);
    }
  }, [isOpen]);

  // Don't render on storefronts
  if (pathname.startsWith('/store/')) {
    return null;
  }

  const handleSend = async (e?: React.FormEvent, textOverride?: string) => {
    e?.preventDefault();
    
    const messageText = textOverride || input;
    if (!messageText.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate network delay for natural feel
    setTimeout(() => {
      let response: ChatMessage | null = null;
      
      if (isGreeting(messageText)) {
        response = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: getGreetingResponse(),
          timestamp: new Date(),
          quickActions: [
            { label: 'How to get started', action: 'How do I get started?', type: 'question', icon: '🚀' },
            { label: 'View plans', action: 'What are the plans?', type: 'question', icon: '💰' },
          ]
        };
      } else {
        response = findBestResponse(messageText, surface);
      }
      
      setMessages(prev => [...prev, response!]);
      setIsTyping(false);
    }, 600 + Math.random() * 800);
  };

  const handleActionClick = (action: QuickAction) => {
    if (action.type === 'navigate') {
      router.push(action.action);
      setIsOpen(false);
    } else {
      handleSend(undefined, action.action);
    }
  };

  const formatMessageContext = (content: string) => {
    // Basic bold md formatting
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-black text-foreground">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in flex flex-col items-end">
      {/* Expanded Chat Window */}
      {isOpen && (
        <div 
          className={`mb-4 overflow-hidden rounded-3xl border border-white/10 shadow-2xl glass transition-all duration-300 ease-out origin-bottom-right ${
            isExpanded ? 'w-[400px] sm:w-[500px] h-[600px] max-h-[85vh]' : 'w-[350px] sm:w-[380px] h-[500px] max-h-[75vh]'
          } flex flex-col animate-scale-in flex-shrink-0 z-50`}
        >
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-primary to-secondary flex items-center justify-between shadow-md z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner border border-white/30 relative">
                <Sparkles className="w-5 h-5 text-white" />
                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-white text-base tracking-tight leading-none">Storix AI</span>
                <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest mt-1">Setup Assistant</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-full text-white/80 hover:bg-white/20 transition-colors"
                title={isExpanded ? "Minimize" : "Expand"}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full text-white/80 hover:bg-white/20 transition-colors"
                title="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-surface/50 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {messages.map((msg, i) => (
              <div 
                key={msg.id} 
                className={`flex w-full animate-slide-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                style={{ animationDelay: '0.1s' }}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mr-2 mt-1 shadow-sm border border-primary/20">
                    <Sparkles size={14} className="text-primary-light" />
                  </div>
                )}
                
                <div className="flex flex-col gap-2 max-w-[85%]">
                  <div 
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line relative group ${
                      msg.role === 'user' 
                        ? 'bg-primary text-white rounded-br-sm shadow-md' 
                        : 'bg-surface-light text-muted border border-border shadow-sm rounded-tl-sm'
                    }`}
                  >
                    {formatMessageContext(msg.content)}
                  </div>
                  
                  {/* Quick Actions (only for latest assistant message) */}
                  {msg.role === 'assistant' && msg.quickActions && i === messages.length - 1 && (
                    <div className="flex flex-col gap-2 mt-1 animate-fade-in pl-1" style={{ animationDelay: '0.5s' }}>
                      {msg.quickActions.map((action, actionIdx) => (
                        <button
                          key={actionIdx}
                          onClick={() => handleActionClick(action)}
                          className="text-xs font-bold px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-primary/30 transition-all text-left flex items-center justify-between group shadow-sm"
                        >
                          <span className="flex items-center gap-2 text-foreground/80 group-hover:text-foreground">
                            {action.icon && <span>{action.icon}</span>}
                            {action.label}
                          </span>
                          <ChevronRight size={14} className="text-muted/50 group-hover:text-primary transition-colors group-hover:translate-x-0.5" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex w-full justify-start animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mr-2 shadow-sm border border-primary/20">
                  <Sparkles size={14} className="text-primary-light" />
                </div>
                <div className="px-4 py-[14px] bg-surface-light border border-border rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-1" />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-surface border-t border-border z-10">
            <form onSubmit={(e) => handleSend(e)} className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                disabled={isTyping}
                className="w-full pl-4 pr-12 py-3.5 bg-surface-light border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all shadow-inner disabled:opacity-50"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isTyping}
                className="absolute right-2 p-2 rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-50 disabled:hover:bg-primary transition-all shadow-md group"
              >
                {isTyping ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                )}
              </button>
            </form>
            <div className="text-center mt-2.5">
               <span className="text-[9px] text-muted/50 uppercase tracking-widest font-bold">Powered by Storix AI</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 hover-lift z-50 ${
          isOpen ? 'bg-surface-light border border-border text-foreground hover:bg-surface-lighter' : 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-primary/30 shadow-primary/20'
        }`}
        aria-label="Toggle chat assistant"
      >
        {isOpen ? (
          <X size={24} className="animate-scale-in" />
        ) : (
          <>
            <MessageSquareText size={24} className="animate-scale-in" />
            {hasUnread && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-danger text-white text-[9px] font-black rounded-full flex items-center justify-center shadow border-2 border-background animate-pulse">
                1
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
}
