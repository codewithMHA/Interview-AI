import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Lightbulb,
  Code2,
  CheckCircle2,
  HelpCircle,
  Plus,
  History,
  Trash2,
  Copy,
  Check,
  ArrowRight,
  MessageSquare,
  BookOpen,
  X
} from 'lucide-react';
import {
  solveDoubtWithAI,
  DoubtSolverResponse,
  fetchConversations,
  fetchConversationMessages,
  deleteConversationById,
  ConversationSummaryItem
} from '@/services/aiService';
import { Button } from '@/components/common/Button';
import { Card, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { MarkdownText } from '@/components/common/MarkdownText';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  data?: DoubtSolverResponse;
  timestamp: string;
}

const getTimeGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  if (hour >= 17 && hour < 22) return 'Good Evening';
  return 'Good Evening';
};

const TOPIC_PRESETS = [
  'All / General Placement',
  'Data Structures & Algorithms',
  'Database Management Systems',
  'Operating Systems & Linux',
  'Computer Networks',
  'System Design',
  'HR & Behavioral'
];

export const DoubtSolverPage: React.FC = () => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationSummaryItem[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `👋 ${getTimeGreeting()}! I am your AI Placement Mentor & Conversational Assistant.\n\nAsk me any concept, programming problem, core CS topic, or placement question. How can I help you today?`,
      timestamp: 'Just now',
    },
  ]);
  const [inputDoubt, setInputDoubt] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('All / General Placement');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const chatThreadRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load conversation list
  const loadConversationsList = async () => {
    try {
      setIsLoadingHistory(true);
      const list = await fetchConversations();
      setConversations(list || []);
    } catch (err) {
      console.warn('Could not load past conversations:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadConversationsList();
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputDoubt(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Scroll only the message container (never scroll the whole browser window)
  useEffect(() => {
    if (chatThreadRef.current) {
      chatThreadRef.current.scrollTo({
        top: chatThreadRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  const toggleSpeechRecognition = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge, or type your doubt.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const handleSpeak = (messageId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const speechFriendlyText = text.replace(/[*#`_~]/g, ' ').replace(/\s+/g, ' ').trim();
    const utterance = new SpeechSynthesisUtterance(speechFriendlyText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleNewChat = () => {
    window.speechSynthesis?.cancel();
    setSpeakingMessageId(null);
    setConversationId(null);
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: `Fresh conversation started! ${getTimeGreeting()} — How can I help you today?`,
        timestamp: 'Just now',
      },
    ]);
  };

  const handleSelectConversation = async (convId: string) => {
    try {
      setIsLoading(true);
      const data = await fetchConversationMessages(convId);
      if (data && data.messages && data.messages.length > 0) {
        const loaded: Message[] = data.messages.map((m: any) => ({
          id: m._id || m.id,
          sender: m.role === 'assistant' ? 'ai' : 'user',
          text: m.content,
          data: m.data,
          timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));
        setMessages(loaded);
        setConversationId(convId);
        setShowHistoryModal(false);
      }
    } catch (err) {
      console.error('Failed to load conversation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    try {
      await deleteConversationById(convId);
      setConversations((prev) => prev.filter((c) => c._id !== convId));
      if (conversationId === convId) {
        handleNewChat();
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleAskDoubt = async (doubtText?: string) => {
    const questionToAsk = (doubtText || inputDoubt).trim();
    if (!questionToAsk || isLoading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: questionToAsk,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputDoubt('');
    setIsLoading(true);

    try {
      // Build conversation history context
      const historyContext = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-6)
        .map((m) => ({
          sender: m.sender,
          message: m.text,
        }));

      const result = await solveDoubtWithAI({
        doubt: questionToAsk,
        conversationId: conversationId || undefined,
        history: historyContext,
        topic: selectedTopic !== 'All / General Placement' ? selectedTopic : undefined,
      });

      if (result.conversationId) {
        setConversationId(result.conversationId);
      }

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: result.directAnswer,
        data: result,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);
      loadConversationsList();
    } catch (err) {
      console.error('Failed to solve doubt:', err);
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: "I ran into a temporary issue connecting to the AI mentor engine. Please try asking again or check your question format.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Hero Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-brand-500/30 text-brand-200 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" /> 24/7 AI Placement Mentor & Doubt Solver
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2.5">
            Ask AI & Clear Placement Doubts
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Conversational AI Mentor with persistent memory. Ask questions, discuss code, and master technical placement concepts.
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadConversationsList();
              setShowHistoryModal(true);
            }}
            className="text-white border-white/20 hover:bg-white/10"
            leftIcon={<History className="w-3.5 h-3.5" />}
          >
            History ({conversations.length})
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNewChat}
            className="text-white border-white/20 hover:bg-white/10 bg-white/5"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            New Chat
          </Button>
        </div>
      </div>

      {/* Topic Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-slate-500 font-semibold shrink-0 pr-1 flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5" /> Focus Subject:
        </span>
        {TOPIC_PRESETS.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedTopic(t)}
            className={`shrink-0 px-3 py-1.5 rounded-full font-medium transition-all ${
              selectedTopic === t
                ? 'bg-brand-600 text-white shadow-sm ring-1 ring-brand-500'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Main Chat Conversation Container */}
      <Card className="border-slate-200 dark:border-slate-800 min-h-[500px] flex flex-col shadow-sm">
        <CardContent className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
          {/* Message Thread */}
          <div ref={chatThreadRef} className="space-y-5 overflow-y-auto max-h-[620px] pr-2">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isSpeaking = speakingMessageId === msg.id;
              const isFollowUp = msg.data?.conversationContext?.isFollowUp;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-2xl sm:max-w-3xl rounded-2xl p-4 sm:p-5 space-y-3.5 text-xs sm:text-sm ${
                      isUser
                        ? 'bg-brand-600 text-white shadow-md rounded-br-none ml-10'
                        : 'bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 shadow-sm rounded-tl-none mr-4'
                    }`}
                  >
                    {/* Header line for AI */}
                    {!isUser && (
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 font-bold text-brand-600 dark:text-brand-400">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>AI Placement Mentor</span>
                          </div>
                          {isFollowUp && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                              <Sparkles className="w-2.5 h-2.5" /> Memory Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSpeak(msg.id, msg.data?.directAnswer || msg.text)}
                            title={isSpeaking ? 'Stop listening' : 'Listen with voice'}
                            className={`p-1 rounded-md transition-colors ${
                              isSpeaking
                                ? 'bg-brand-500/20 text-brand-500'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                            }`}
                          >
                            {isSpeaking ? (
                              <VolumeX className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                        </div>
                      </div>
                    )}

                    {/* Direct Text Answer */}
                    <MarkdownText
                      content={msg.text}
                      invert={isUser}
                      className="leading-relaxed font-normal select-text"
                    />

                    {/* Rich Structured Data (if AI answered a technical doubt) */}
                    {msg.data && (
                      <div className="space-y-3 pt-2">
                        {/* Key Points Checklist */}
                        {msg.data.keyPoints && msg.data.keyPoints.length > 0 && (
                          <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 space-y-1.5">
                            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Key Takeaways
                            </span>
                            <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 list-disc pl-4">
                              {msg.data.keyPoints.map((point, idx) => (
                                <li key={idx} className="leading-relaxed">
                                  <MarkdownText content={point} inline />
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Code Snippet */}
                        {msg.data.codeSnippet && msg.data.codeSnippet.code && msg.data.codeSnippet.code.trim().length > 0 && (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs text-slate-400">
                              <span className="font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1">
                                <Code2 className="w-3.5 h-3.5" /> Code Implementation ({msg.data.codeSnippet.language || 'code'})
                              </span>
                              <button
                                onClick={() => handleCopyCode(msg.id, msg.data!.codeSnippet!.code)}
                                className="px-2 py-0.5 rounded text-[11px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 flex items-center gap-1"
                              >
                                {copiedCodeId === msg.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-500" /> Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" /> Copy Code
                                  </>
                                )}
                              </button>
                            </div>
                            <div className="rounded-xl bg-slate-900 text-slate-100 p-3.5 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
                              <pre className="whitespace-pre">{msg.data.codeSnippet.code}</pre>
                            </div>
                            {msg.data.codeSnippet.explanation && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                                <MarkdownText content={msg.data.codeSnippet.explanation} inline />
                              </p>
                            )}
                          </div>
                        )}

                        {/* Senior Interviewer Tip (only if provided) */}
                        {msg.data.interviewTip && msg.data.interviewTip.trim().length > 0 && (
                          <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-1">
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                              <Lightbulb className="w-3.5 h-3.5" /> Senior Interviewer / Placement Tip
                            </span>
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                              <MarkdownText content={msg.data.interviewTip} inline />
                            </p>
                          </div>
                        )}

                        {/* Suggested Follow-Ups */}
                        {msg.data.suggestedFollowUps && msg.data.suggestedFollowUps.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                              <HelpCircle className="w-3 h-3" /> Suggested Follow-Ups:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.data.suggestedFollowUps.map((followUp, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleAskDoubt(followUp)}
                                  className="text-left px-2.5 py-1 rounded-lg text-xs bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-slate-750 transition-colors flex items-center gap-1"
                                >
                                  <span>{followUp}</span>
                                  <ArrowRight className="w-3 h-3 shrink-0" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
                  <span>AI Mentor is analyzing context and formulating your answer...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Bar with Voice Mic & Send */}
          <div className="relative pt-2 border-t border-slate-100 dark:border-slate-800">
            {isListening && (
              <div className="absolute -top-7 left-2 flex items-center gap-1.5 text-xs text-rose-500 font-semibold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Listening to your voice... Speak your doubt clearly!</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                title={isListening ? 'Stop recording voice' : 'Talk to AI (Voice Mic)'}
                className={`p-3 rounded-xl border transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-600 ring-2 ring-rose-400 shadow-md animate-pulse'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={inputDoubt}
                onChange={(e) => setInputDoubt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAskDoubt();
                  }
                }}
                placeholder={
                  isListening
                    ? 'Listening... Speak your question now!'
                    : 'Type your question or doubt here...'
                }
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />

              <Button
                variant="primary"
                onClick={() => handleAskDoubt()}
                disabled={!inputDoubt.trim() || isLoading}
                isLoading={isLoading}
                className="px-5 py-3 shadow-md shadow-brand-500/20"
                rightIcon={<Send className="w-4 h-4" />}
              >
                Ask AI
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Slide-over / Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[80vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                <History className="w-5 h-5 text-brand-500" />
                <span>Conversation History</span>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-2">
              {isLoadingHistory ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading conversation history...</div>
              ) : conversations.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No conversation history yet. Start a new chat!
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv._id}
                    onClick={() => handleSelectConversation(conv._id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      conversationId === conv._id
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-850'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">
                        {conv.title || 'Untitled Conversation'}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{conv.messageCount} messages</span>
                        <span>•</span>
                        <span>{new Date(conv.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteConversation(e, conv._id)}
                      title="Delete conversation"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistoryModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
