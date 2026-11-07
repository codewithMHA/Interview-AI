import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Maximize2,
  Minimize2,
  Trash2,
  ArrowRight,
  Code2,
  HelpCircle,
  Lightbulb,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { sendChatMessage, solveDoubtWithAI, DoubtSolverResponse } from '@/services/aiService';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  keyPoints?: string[];
  codeSnippet?: {
    language: string;
    code: string;
    explanation?: string;
  } | null;
  interviewTip?: string;
  suggestedFollowUps?: string[];
}

const QUICK_PROMPTS = [
  { label: '💡 Two Pointers vs Sliding Window', query: 'Explain the difference between Two Pointers and Sliding Window with when to use each.' },
  { label: '🏢 Crack Google / Amazon SDE-1', query: 'What is the exact 4-step framework to crack Tier-1 FAANG technical interviews?' },
  { label: '⚡ SQL vs NoSQL / MongoDB', query: 'Compare SQL vs NoSQL: which should I choose for an e-commerce backend and why?' },
  { label: '🎯 30-Day Placement Plan', query: 'Give me a structured 30-day DSA and Core CS preparation timetable for campus placements.' },
  { label: '🕌 As-salamu alaykum mentor', query: 'As-salamu alaykum mentor! How do I begin preparing for campus placements from today?' }
];

export const PlacementAIChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<'General' | 'DSA' | 'System Design' | 'HR' | 'Web Dev'>('General');
  const [conversationId, setConversationId] = useState<string>(() => {
    return localStorage.getItem('interviewai_chat_conv_id') || `conv_${Date.now()}`;
  });
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('interviewai_chat_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [
      {
        id: 'msg_welcome',
        sender: 'ai',
        text: "👋 Hi! I am your **AI Placement Mentor & Coding Assistant**. Ask me anything about Data Structures & Algorithms, Core CS (OS, DBMS, Networks), system design, debugging your code, or behavioral HR questions!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        keyPoints: [
          'Instant technical guidance & Big-O complexity analysis',
          'Voice speaking & audio answers enabled',
          'Trained on FAANG, Product & Service Tier interview patterns'
        ],
        suggestedFollowUps: [
          'What is the difference between BFS and DFS?',
          'How to explain projects in HR rounds?',
          'Top 10 SQL queries asked in interviews'
        ]
      }
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Sync messages to localStorage
  useEffect(() => {
    localStorage.setItem('interviewai_chat_messages', JSON.stringify(messages.slice(-30)));
    localStorage.setItem('interviewai_chat_conv_id', conversationId);
  }, [messages, conversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your question.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const handleSpeak = (textToSpeak: string, msgId: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown formatting for cleaner speech
    const cleanText = textToSpeak
      .replace(/[*#`_~]/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .slice(0, 300);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(null);
    utterance.onerror = () => setIsSpeaking(null);

    setIsSpeaking(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    const newConvId = `conv_${Date.now()}`;
    setConversationId(newConvId);
    setMessages([
      {
        id: `msg_${Date.now()}`,
        sender: 'ai',
        text: '🧹 Chat cleared! How can I assist your placement preparation now?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: [
          'Explain Time & Space Complexity of QuickSort',
          'Design URL Shortener High-Level Architecture',
          'Top React interview tricky questions'
        ]
      }
    ]);
  };

  const handleSend = async (messageText?: string) => {
    const query = (messageText || inputMessage).trim();
    if (!query || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Build history context
      const historyContext = messages.slice(-6).map((m) => ({
        sender: m.sender,
        message: m.text
      }));

      const response: DoubtSolverResponse = await solveDoubtWithAI({
        doubt: query,
        conversationId,
        history: historyContext,
        topic: selectedTopic,
        role: 'Software Engineer'
      });

      if (response.conversationId) {
        setConversationId(response.conversationId);
      }

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: response.directAnswer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        keyPoints: response.keyPoints && response.keyPoints.length > 0 ? response.keyPoints : undefined,
        codeSnippet: response.codeSnippet || undefined,
        interviewTip: response.interviewTip || undefined,
        suggestedFollowUps: response.suggestedFollowUps && response.suggestedFollowUps.length > 0 ? response.suggestedFollowUps : undefined
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: "I experienced a brief connectivity blip. Don't worry! Here is an instant solution: check your question syntax or pick one of the quick suggestions below.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: [
          'What is the difference between Array and LinkedList?',
          'Explain ACID properties in DBMS'
        ]
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* 1. Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open AI Placement Mentor Chat"
            className="group relative flex items-center gap-3 px-4 py-3.5 rounded-full bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 text-white shadow-xl shadow-brand-500/30 hover:shadow-2xl hover:shadow-brand-500/40 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <div className="relative flex items-center justify-center">
              <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900 animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold tracking-wide flex items-center gap-1.5">
                AI Mentor
                <span className="text-[10px] bg-white/20 backdrop-blur-xs px-1.5 py-0.2 rounded-full uppercase tracking-wider font-extrabold">
                  24/7
                </span>
              </span>
              <span className="text-[10px] text-white/80 font-medium">Ask any doubt</span>
            </div>
          </button>
        ) : null}
      </div>

      {/* 2. Floating AI Chat Drawer */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ease-out shadow-2xl flex flex-col overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800/90 ${
            isExpanded
              ? 'inset-4 md:inset-8 rounded-3xl'
              : 'bottom-4 right-4 md:bottom-6 md:right-6 w-[430px] max-w-[calc(100vw-24px)] h-[620px] max-h-[calc(100vh-48px)] rounded-3xl'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-slate-900 via-brand-950 to-indigo-950 text-white flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-tight">AI Placement Mentor</h3>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">Fast contextual assistance & coding explanations</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-300">
              <Link
                to="/chat"
                title="Open Dedicated Full-Screen Chat"
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Restore Size' : 'Maximize Window'}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={handleClearChat}
                title="Clear Chat History"
                className="p-1.5 hover:text-rose-300 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Drawer"
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Topic Filter Chips */}
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 mr-1">
              Focus:
            </span>
            {(['General', 'DSA', 'System Design', 'HR', 'Web Dev'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTopic(t)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedTopic === t
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Chat bubble */}
                  <div
                    className={`p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-brand-600 text-white rounded-br-none ml-auto'
                        : 'bg-slate-100/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200/60 dark:border-slate-750'
                    }`}
                  >
                    <div className="whitespace-pre-wrap select-text">{msg.text}</div>

                    {/* Key points bullets if any */}
                    {msg.keyPoints && msg.keyPoints.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200/70 dark:border-slate-700/70 space-y-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Key Takeaways:
                        </span>
                        {msg.keyPoints.map((kp, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                            <span>{kp}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Code snippet if any */}
                    {msg.codeSnippet && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 text-slate-100">
                        <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                          <span>{msg.codeSnippet.language}</span>
                          <button
                            onClick={() => handleCopy(msg.codeSnippet!.code, `code_${msg.id}`)}
                            className="flex items-center gap-1 hover:text-white"
                          >
                            {copiedId === `code_${msg.id}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{copiedId === `code_${msg.id}` ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <pre className="p-3 text-xs font-mono overflow-x-auto no-scrollbar">
                          <code>{msg.codeSnippet.code}</code>
                        </pre>
                        {msg.codeSnippet.explanation && (
                          <p className="px-3 py-1.5 bg-slate-900/60 text-[11px] text-slate-400 border-t border-slate-800/80">
                            {msg.codeSnippet.explanation}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Interview Tip if any */}
                    {msg.interviewTip && (
                      <div className="mt-2.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] flex items-start gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                        <div>
                          <strong>Interview Tip:</strong> {msg.interviewTip}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions under message: timestamp, speech button, copy */}
                  <div className="flex items-center gap-2 px-1 text-[10px] text-slate-400 dark:text-slate-500">
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'ai' && (
                      <>
                        <span>•</span>
                        <button
                          onClick={() => handleSpeak(msg.text, msg.id)}
                          className="hover:text-brand-500 flex items-center gap-1 transition-colors"
                          title="Listen to this explanation"
                        >
                          {isSpeaking === msg.id ? (
                            <>
                              <VolumeX className="w-3 h-3 text-rose-500 animate-pulse" />
                              <span className="text-rose-500 font-semibold">Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3" />
                              <span>Listen</span>
                            </>
                          )}
                        </button>
                        <span>•</span>
                        <button
                          onClick={() => handleCopy(msg.text, msg.id)}
                          className="hover:text-brand-500 flex items-center gap-1 transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <span className="text-emerald-500">Copied!</span>
                          ) : (
                            'Copy'
                          )}
                        </button>
                      </>
                    )}
                  </div>

                  {/* Suggested follow-up prompt chips */}
                  {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="pt-1 flex flex-wrap gap-1.5">
                      {msg.suggestedFollowUps.map((fu, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(fu)}
                          className="text-[11px] text-left px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/50 hover:bg-brand-100 dark:hover:bg-brand-900/60 border border-brand-200 dark:border-brand-800/80 text-brand-700 dark:text-brand-300 transition-all"
                        >
                          💬 {fu}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 items-center">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="px-4 py-2.5 rounded-2xl rounded-bl-none bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-750 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="ml-1 text-[11px] text-slate-400 font-medium">Generating mentor answer...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          {messages.length <= 3 && !isTyping && (
            <div className="px-4 py-2 bg-slate-50/60 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar flex items-center gap-2 shrink-0">
              {QUICK_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p.query)}
                  className="px-2.5 py-1 text-[11px] whitespace-nowrap rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-all shrink-0"
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
            <div className="relative flex items-center gap-1.5">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? 'Listening to your voice...' : 'Ask your coding or interview doubt...'}
                className="flex-1 px-3.5 py-2.5 text-xs md:text-sm rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
              />

              {/* Mic Dictation */}
              <button
                type="button"
                onClick={toggleListening}
                title={isListening ? 'Stop Mic' : 'Dictate with Voice'}
                className={`p-2.5 rounded-xl border transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!inputMessage.trim() || isTyping}
                className="p-2.5 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-400 dark:text-slate-500">
              <span>Powered by Gemini 3.5 & Offline Semantic Engine</span>
              <Link to="/chat" className="text-brand-600 dark:text-brand-400 hover:underline">
                Full Page Mode →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

