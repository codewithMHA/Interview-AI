import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Bot,
  User,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Plus,
  Trash2,
  BookOpen,
  Code2,
  Briefcase,
  HelpCircle,
  Lightbulb,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';
import {
  solveDoubtWithAI,
  DoubtSolverResponse,
  fetchConversations,
  ConversationSummaryItem
} from '@/services/aiService';

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

const TOPICS = [
  { id: 'General', name: 'All-Rounder', icon: Sparkles, desc: 'Interview tips, roadmap advice & CS fundamentals' },
  { id: 'DSA', name: 'DSA & Algorithms', icon: Code2, desc: 'Arrays, Trees, Graphs, Dynamic Programming' },
  { id: 'System Design', name: 'System Design & OS', icon: Layers, desc: 'Scalability, microservices, databases & concurrency' },
  { id: 'HR', name: 'HR & Behavioral', icon: Briefcase, desc: 'STAR technique, cultural fit & salary negotiation' },
];

const STARTER_QUESTIONS = [
  {
    topic: 'DSA',
    title: 'Sliding Window vs Two Pointers',
    query: 'What is the exact heuristic to determine when to use Sliding Window vs Two Pointers in DSA problems?'
  },
  {
    topic: 'DSA',
    title: 'Top DP Patterns to Master',
    query: 'List the top 5 Dynamic Programming patterns every student must master for FAANG interviews with classic problem examples.'
  },
  {
    topic: 'System Design',
    title: 'SQL vs NoSQL Architectural Trade-offs',
    query: 'Explain ACID vs BASE properties, and give concrete criteria for selecting PostgreSQL vs MongoDB.'
  },
  {
    topic: 'HR',
    title: 'Tell Me About Yourself (Product Companies)',
    query: 'How should a fresh CS graduate structure the "Tell me about yourself" answer in under 90 seconds?'
  },
  {
    topic: 'General',
    title: '30-Day Placement Sprint Plan',
    query: 'Generate a focused 4-week daily checklist for a student with upcoming campus placement drives.'
  }
];

export const AIChatPage: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string>('General');
  const [conversationId, setConversationId] = useState<string>(() => {
    return localStorage.getItem('interviewai_chat_conv_id') || `conv_${Date.now()}`;
  });
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [recentConversations, setRecentConversations] = useState<ConversationSummaryItem[]>([]);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('interviewai_fullscreen_chat');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [
      {
        id: 'msg_initial',
        sender: 'ai',
        text: "👋 Welcome to your **AI Placement Mentor & Coding Assistant**!\n\nI am engineered to help you master Data Structures, System Design, Operating Systems, DBMS, and behavioral HR rounds for Tier-1, Unicorn, and IT placement drives.\n\nAsk me any doubt, paste code to debug, or pick one of the curated starter prompts below.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        keyPoints: [
          'Full conversational memory: follow up on any previous explanation naturally',
          'Voice enabled: click "Listen" to hear any answer aloud or use the microphone',
          'Trained on real interview rubrics from Google, Amazon, Microsoft, and top startups'
        ],
        suggestedFollowUps: [
          'Explain Time & Space Complexity of QuickSort vs MergeSort',
          'What happens under the hood when typing google.com in a browser?',
          'How to answer "Why should we hire you?" with confidence'
        ]
      }
    ];
  });

  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const speechRef = useRef<any>(null);

  useEffect(() => {
    localStorage.setItem('interviewai_fullscreen_chat', JSON.stringify(messages.slice(-30)));
    localStorage.setItem('interviewai_chat_conv_id', conversationId);
  }, [messages, conversationId]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Load conversation list from backend if available
  useEffect(() => {
    fetchConversations()
      .then((convs) => {
        if (convs && Array.isArray(convs)) {
          setRecentConversations(convs);
        }
      })
      .catch(() => {
        // ignore
      });
  }, []);

  // Web Speech Recognition
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
          setInputQuery((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      speechRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!speechRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your question.');
      return;
    }
    if (isListening) {
      speechRef.current.stop();
      setIsListening(false);
    } else {
      try {
        speechRef.current.start();
        setIsListening(true);
      } catch {
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
    const cleanText = textToSpeak
      .replace(/[*#`_~]/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .slice(0, 400);

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

  const startNewChat = () => {
    const newId = `conv_${Date.now()}`;
    setConversationId(newId);
    setMessages([
      {
        id: `msg_${Date.now()}`,
        sender: 'ai',
        text: '✨ New session started! What problem, algorithm, or placement doubt are we solving today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: [
          'Explain Inorder, Preorder, and Postorder tree traversals',
          'Explain how Kafka handles message ordering',
          'Mock behavioral question: Conflict resolution with teammate'
        ]
      }
    ]);
  };

  const handleSend = async (overrideQuery?: string) => {
    const text = (overrideQuery || inputQuery).trim();
    if (!text || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const historyContext = messages.slice(-8).map((m) => ({
        sender: m.sender,
        message: m.text
      }));

      const res: DoubtSolverResponse = await solveDoubtWithAI({
        doubt: text,
        conversationId,
        history: historyContext,
        topic: selectedTopic,
        role: 'Software Engineer'
      });

      if (res.conversationId) {
        setConversationId(res.conversationId);
      }

      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: res.directAnswer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        keyPoints: res.keyPoints && res.keyPoints.length > 0 ? res.keyPoints : undefined,
        codeSnippet: res.codeSnippet || undefined,
        interviewTip: res.interviewTip || undefined,
        suggestedFollowUps: res.suggestedFollowUps && res.suggestedFollowUps.length > 0 ? res.suggestedFollowUps : undefined
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      const fallback: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: "I encountered a minor network delay. Let's keep momentum! Check your question or try one of the related topics below.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: [
          'What is Big-O notation with practical examples?',
          'How does Garbage Collection work in Node.js / Java?'
        ]
      };
      setMessages((prev) => [...prev, fallback]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row">
      {/* 1. Left Sidebar: Topic Navigation & Starter Chips */}
      <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-5">
          {/* Top Brand & New Chat */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">AI Placement Mentor</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Contextual 24/7 Guidance</p>
              </div>
            </div>

            <Button size="sm" variant="outline" onClick={startNewChat} leftIcon={<Plus className="w-3.5 h-3.5" />}>
              New
            </Button>
          </div>

          {/* Track Filter */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Select Focus Domain
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {TOPICS.map((topic) => {
                const Icon = topic.icon;
                const isSelected = selectedTopic === topic.id;
                return (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic.id)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center gap-3 border ${
                      isSelected
                        ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 shadow-xs'
                        : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{topic.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{topic.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Curated Prompt Chips */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-amber-500" />
              Frequently Asked Doubts
            </label>
            <div className="space-y-1.5">
              {STARTER_QUESTIONS.map((sq, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(sq.query)}
                  className="w-full text-left p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-brand-50/80 dark:hover:bg-brand-950/40 border border-slate-200/80 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 text-[11px] text-slate-700 dark:text-slate-300 transition-all group"
                >
                  <p className="font-semibold group-hover:text-brand-600 dark:group-hover:text-brand-400 truncate">
                    {sq.title}
                  </p>
                  <p className="text-slate-400 text-[10px] truncate">{sq.query}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info badge */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            AI Online
          </span>
          <span className="font-mono text-[10px]">Gemini 3.5 Engine</span>
        </div>
      </div>

      {/* 2. Main Chat Area */}
      <div className="flex-1 flex flex-col justify-between max-w-5xl mx-auto w-full h-[calc(100vh-64px)]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-xs">
                  <Bot className="w-4.5 h-4.5" />
                </div>
              )}

              <div className={`max-w-[85%] md:max-w-[78%] space-y-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                {/* Chat Bubble */}
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-brand-600 text-white rounded-br-none ml-auto'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div className="whitespace-pre-wrap select-text leading-relaxed">{msg.text}</div>

                  {/* Key Takeaways */}
                  {msg.keyPoints && msg.keyPoints.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" /> Key Takeaways
                      </span>
                      {msg.keyPoints.map((kp, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                          <span>{kp}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Code snippet */}
                  {msg.codeSnippet && (
                    <div className="mt-3.5 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100">
                      <div className="px-3.5 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                        <span>{msg.codeSnippet.language}</span>
                        <button
                          onClick={() => handleCopy(msg.codeSnippet!.code, `code_${msg.id}`)}
                          className="flex items-center gap-1 hover:text-white"
                        >
                          {copiedId === `code_${msg.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>{copiedId === `code_${msg.id}` ? 'Copied' : 'Copy Code'}</span>
                        </button>
                      </div>
                      <pre className="p-3.5 text-xs font-mono overflow-x-auto no-scrollbar">
                        <code>{msg.codeSnippet.code}</code>
                      </pre>
                      {msg.codeSnippet.explanation && (
                        <p className="px-3.5 py-2 bg-slate-900/60 text-xs text-slate-400 border-t border-slate-800">
                          {msg.codeSnippet.explanation}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Interview Tip */}
                  {msg.interviewTip && (
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                      <div>
                        <strong>Pro Tip:</strong> {msg.interviewTip}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bubble actions */}
                <div className="flex items-center gap-2.5 px-1 text-xs text-slate-400 dark:text-slate-500">
                  <span>{msg.timestamp}</span>
                  {msg.sender === 'ai' && (
                    <>
                      <span>•</span>
                      <button
                        onClick={() => handleSpeak(msg.text, msg.id)}
                        className="hover:text-brand-500 flex items-center gap-1 transition-colors"
                      >
                        {isSpeaking === msg.id ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                            <span className="text-rose-500 font-semibold">Stop Voice</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Listen Aloud</span>
                          </>
                        )}
                      </button>
                      <span>•</span>
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="hover:text-brand-500 flex items-center gap-1 transition-colors"
                      >
                        {copiedId === msg.id ? <span className="text-emerald-500">Copied!</span> : 'Copy Text'}
                      </button>
                    </>
                  )}
                </div>

                {/* Follow up suggestions */}
                {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="pt-1 flex flex-wrap gap-2">
                    {msg.suggestedFollowUps.map((fu, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(fu)}
                        className="text-xs text-left px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-brand-50 dark:hover:bg-brand-950/50 border border-slate-200 dark:border-slate-800 hover:border-brand-300 text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 shadow-xs transition-all"
                      >
                        💬 {fu}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0 mt-1">
                  <User className="w-4.5 h-4.5" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Bouncing Dots */}
          {isTyping && (
            <div className="flex gap-3.5 items-center">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                <Bot className="w-4.5 h-4.5" />
              </div>
              <div className="px-5 py-3 rounded-2xl rounded-bl-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="ml-2 text-xs text-slate-400 font-medium">Generating comprehensive response...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
          <div className="relative flex items-end gap-2 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-750 p-2 focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500 transition-all">
            <textarea
              rows={2}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? '🎙️ Listening to your question...' : `Ask your ${selectedTopic} question or paste code snippet... (Enter to send, Shift+Enter for newline)`}
              className="flex-1 bg-transparent px-3 py-1.5 text-sm resize-none focus:outline-hidden text-slate-900 dark:text-white placeholder:text-slate-400"
            />

            <div className="flex items-center gap-1.5 pb-1">
              {/* Mic Dictation */}
              <button
                type="button"
                onClick={toggleListening}
                title={isListening ? 'Stop Mic' : 'Voice Dictation'}
                className={`p-2.5 rounded-xl border transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Send Button */}
              <Button
                size="md"
                onClick={() => handleSend()}
                disabled={!inputQuery.trim() || isTyping}
                rightIcon={<Send className="w-4 h-4" />}
                className="shadow-md shadow-brand-500/20"
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

