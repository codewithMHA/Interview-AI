import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Bot,
  User,
  Clock,
  Sparkles,
  FileText,
  RotateCcw,
  Send,
  MessageSquare,
  Square,
  ChevronRight,
  Check,
  Edit3,
  Moon,
  Sun,
  Radio,
  FileCode,
  Tag,
  Plus,
  Trash2,
  HelpCircle,
  Activity,
  Layers,
  ChevronDown,
  ChevronLeft,
  Zap,
  Coffee,
  Code2,
  PlayCircle,
  Terminal as TerminalIcon,
  Cpu,
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  Link2,
  Table as TableIcon,
  Eye,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import {
  getMockInterview,
  submitMockAnswer,
  completeMockInterview,
  saveCandidateNotes,
  updateTopicStatus,
  runInterviewCode,
} from '@/services/aiService';
import { CodeEditor, SupportedLanguage } from '@/components/coding/CodeEditor';
import {
  MockInterviewDetailedSession,
  MockInterviewQuestionItem,
  ResumeTopicItem,
} from '@/types';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { EmilyAIVideoAvatar } from '@/components/interview/EmilyAIVideoAvatar';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

type ConversationState = 'connecting' | 'interviewer_speaking' | 'listening' | 'evaluating';

// Phonetic & Technical Dictionary to fix misrecognized technical jargon and Indian names
export const sanitizeSpokenTranscript = (text: string, candidateName: string = 'Candidate'): string => {
  if (!text) return '';
  let cleaned = text;

  // 1. Candidate Name corrections (Web Speech API frequently mishears Indian names)
  cleaned = cleaned.replace(/\b(mothers and ahmed friend|mothers and ahmed|mothers ahmed|mother son ahmed|mothers and friend|mothers)\b/gi, candidateName);

  // 2. Core Tech Stack & Frameworks
  cleaned = cleaned.replace(/\b(not there's|no this has|no this|know this|note js|no js|no day yes|no just)\b/gi, 'Node.js');
  cleaned = cleaned.replace(/\b(react js|reacted js|react just)\b/gi, 'React.js');
  cleaned = cleaned.replace(/\b(express js|expressive js|express just)\b/gi, 'Express.js');
  cleaned = cleaned.replace(/\b(mongo db|manga db|mango db|momo db)\b/gi, 'MongoDB');
  cleaned = cleaned.replace(/\b(javascript|java script)\b/gi, 'JavaScript');
  cleaned = cleaned.replace(/\b(typescript|type script)\b/gi, 'TypeScript');
  cleaned = cleaned.replace(/\b(c plus plus|c \+ \+)\b/gi, 'C++');
  cleaned = cleaned.replace(/\b(git hub|get hub)\b/gi, 'GitHub');

  // 3. Runtime Internals, Concurrency & Asynchronous terms
  cleaned = cleaned.replace(/\b(non blocking in food|non blocking input food|non blocking input)\b/gi, 'non-blocking I/O');
  cleaned = cleaned.replace(/\b(in food)\b/gi, 'I/O');
  cleaned = cleaned.replace(/\b(as synchronise|as synchronize|as synchronised)\b/gi, 'asynchronous');
  cleaned = cleaned.replace(/\b(synchronise|synchronised)\b/gi, 'synchronous');
  cleaned = cleaned.replace(/\b(runs the code in bite|code in bite|in bite)\b/gi, 'runs the code in bytecode');
  cleaned = cleaned.replace(/\b(bite code)\b/gi, 'bytecode');
  cleaned = cleaned.replace(/\b(single thread|single traded)\b/gi, 'single-threaded');
  cleaned = cleaned.replace(/\b(even loop|event look)\b/gi, 'event loop');
  cleaned = cleaned.replace(/\b(cost tag|call stop|car stack)\b/gi, 'call stack');
  cleaned = cleaned.replace(/\b(live uv|leave uv|lib uv)\b/gi, 'libuv');
  cleaned = cleaned.replace(/\b(third pool|threat pool)\b/gi, 'thread pool');
  cleaned = cleaned.replace(/\b(set time out|set timeout)\b/gi, 'setTimeout');
  cleaned = cleaned.replace(/\b(set immediate)\b/gi, 'setImmediate');
  cleaned = cleaned.replace(/\b(process next tick)\b/gi, 'process.nextTick');
  cleaned = cleaned.replace(/\b(micro task|micro tasks)\b/gi, 'microtask');
  cleaned = cleaned.replace(/\b(macro task|macro tasks)\b/gi, 'macrotask');

  // 4. Database, ACID & System Architecture
  cleaned = cleaned.replace(/\b(asset properties|acid properties|asset property)\b/gi, 'ACID properties');
  cleaned = cleaned.replace(/\b(write ahead log|right ahead log|ride ahead log|wal log)\b/gi, 'Write-Ahead Log (WAL)');
  cleaned = cleaned.replace(/\b(multi version concurrency control|mvcc)\b/gi, 'MVCC');
  cleaned = cleaned.replace(/\b(phantom rows|phantom rose)\b/gi, 'phantom rows');
  cleaned = cleaned.replace(/\b(dirty reads|30 reads)\b/gi, 'dirty reads');
  cleaned = cleaned.replace(/\b(two phase locking|2 phase locking)\b/gi, 'Two-Phase Locking (2PL)');
  cleaned = cleaned.replace(/\b(pessimistic locking|pessimistic block)\b/gi, 'pessimistic locking');
  cleaned = cleaned.replace(/\b(optimistic concurrency|optimistic control)\b/gi, 'optimistic concurrency');
  cleaned = cleaned.replace(/\b(circuit breaker|circuit breakers)\b/gi, 'circuit breaker');
  cleaned = cleaned.replace(/\b(deadlock|dead lock|dead logs)\b/gi, 'deadlock');
  cleaned = cleaned.replace(/\b(best api|press api|rest api)\b/gi, 'REST API');

  // 5. Candidate Specific Experience & Projects
  cleaned = cleaned.replace(/\b(salary and electricity uses tracker|salary and electricity tracker)\b/gi, 'Salary and Electricity Usage Tracker');
  cleaned = cleaned.replace(/\b(diploma and current)\b/gi, 'diploma and currently');

  return cleaned;
};

export const MockInterviewSessionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const candidateName = user?.name?.trim() || 'Candidate';
  const { theme, toggleTheme } = useTheme();

  // Core Session State
  const [session, setSession] = useState<MockInterviewDetailedSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Conversational State matching Photo 4 ("Connected · Interviewer speaking" / "Connected · Listening to you")
  const [conversationState, setConversationState] = useState<ConversationState>('connecting');
  const conversationStateRef = useRef<ConversationState>('connecting');
  const [currentInterviewerCaption, setCurrentInterviewerCaption] = useState<string>('');

  // Silence detection & auto-submit states (with acoustic mic guard so long answers are never cut off)
  const [autoSendEnabled, setAutoSendEnabled] = useState<boolean>(true);
  const autoSendEnabledRef = useRef<boolean>(true);
  const [pauseCountdown, setPauseCountdown] = useState<number | null>(null);
  const pauseIntervalRef = useRef<any>(null);
  const isSubmittingAnswerRef = useRef<boolean>(false);
  const lastSpokenTextSnapshotRef = useRef<string>('');
  const lastVoiceActivityAtRef = useRef<number>(Date.now());
  const lastTranscriptActivityAtRef = useRef<number>(Date.now());
  const ambientNoiseFloorRef = useRef<number>(12);
  const speechSafetyTimerRef = useRef<any>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const candidateNameRef = useRef<string>(candidateName);
  const handleAutoProcessRef = useRef<() => void>(() => {});

  useEffect(() => {
    candidateNameRef.current = candidateName;
  }, [candidateName]);

  // Resume Topics (8 Cards from Photo 4)
  const [resumeTopics, setResumeTopics] = useState<ResumeTopicItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Candidate Notes Notepad (Photo 4 Middle Area)
  const notesTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [notesContent, setNotesContent] = useState<string>(
    `- High-Level Architecture & Component Boundaries\n- Data Consistency & Trade-offs\n- Testing & Edge Cases`
  );
  const [activeNotePage, setActiveNotePage] = useState<string>('talking_points');
  const [noteTags, setNoteTags] = useState<string[]>(['Resume']);
  const [isAddingTag, setIsAddingTag] = useState<boolean>(false);
  const [newTagText, setNewTagText] = useState<string>('');

  // Live Coding IDE State (activated automatically for Coding interviews or manually toggled)
  const DEFAULT_INTERVIEW_STARTERS: Record<SupportedLanguage, string> = {
    javascript: `// Write your JavaScript solution & test with console.log\nfunction solve(input) {\n  return input;\n}\nconsole.log(solve("ready"));\n`,
    python: `# Write your Python solution & test with print\ndef solve(data):\n    return data\n\nprint(solve("ready"))\n`,
    java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Ready");\n    }\n}\n`,
    cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    cout << "Ready" << endl;\n    return 0;\n}\n`,
  };
  const [centerTab, setCenterTab] = useState<'notes' | 'code'>('notes');
  const [interviewLang, setInterviewLang] = useState<SupportedLanguage>('javascript');
  const [interviewCode, setInterviewCode] = useState<string>(DEFAULT_INTERVIEW_STARTERS.javascript);
  const [isRunningCode, setIsRunningCode] = useState<boolean>(false);
  const [codeOutput, setCodeOutput] = useState<{
    stdout: string;
    stderr: string;
    time: string;
    exitCode: number;
  } | null>(null);

  // Audio Speech Recognition State (Candidate Mic)
  const [isListeningMic, setIsListeningMic] = useState<boolean>(true);
  const isListeningMicRef = useRef<boolean>(true);
  const [userSpokenAnswer, setUserSpokenAnswer] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const latestSpokenAnswerRef = useRef<string>('');
  const latestInterimRef = useRef<string>('');
  const [micVolumeLevel, setMicVolumeLevel] = useState<number>(0);
  const [isTextModeOpen, setIsTextModeOpen] = useState<boolean>(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState<boolean>(false);
  const [speechLang, setSpeechLang] = useState<'en-IN' | 'en-US'>('en-IN');
  const [isEditingSpokenAnswer, setIsEditingSpokenAnswer] = useState<boolean>(false);
  const isEditingSpokenAnswerRef = useRef<boolean>(false);

  useEffect(() => {
    conversationStateRef.current = conversationState;
  }, [conversationState]);

  useEffect(() => {
    isEditingSpokenAnswerRef.current = isEditingSpokenAnswer;
  }, [isEditingSpokenAnswer]);

  useEffect(() => {
    autoSendEnabledRef.current = autoSendEnabled;
  }, [autoSendEnabled]);

  // Candidate Camera State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Silence Detection (Generous 4.5s natural pause before Emily responds automatically)
  const silenceTimerRef = useRef<any>(null);

  // Audio Web Speech Contexts
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Timer Countdown (44:53 start like in Photo 4)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(44 * 60 + 53);
  const [isEndingSession, setIsEndingSession] = useState<boolean>(false);

  // Full Dialogue History
  const [transcriptMessages, setTranscriptMessages] = useState<
    Array<{ sender: 'interviewer' | 'candidate'; text: string; time: string }>
  >([]);

  // 1. Initialize Webcam Stream
  useEffect(() => {
    let stream: MediaStream | null = null;
    const startWebcam = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false,
        });
        setCameraStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Webcam permission not granted:', err);
        setIsCameraActive(false);
      }
    };

    if (isCameraActive) {
      startWebcam();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCameraActive]);

  // 2. Microphone Audio Level Analyzer
  const startAudioVisualizer = async () => {
    try {
      if (audioContextRef.current) return;
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micStreamRef.current = audioStream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(audioStream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const level = Math.min(100, Math.round((avg / 128) * 100));
        setMicVolumeLevel(level);

        const now = Date.now();
        // Smoothly calibrate ambient room noise floor while no new transcript is arriving
        if (now - lastTranscriptActivityAtRef.current > 1500) {
          ambientNoiseFloorRef.current = ambientNoiseFloorRef.current * 0.92 + level * 0.08;
        }

        const speechThreshold = Math.max(20, ambientNoiseFloorRef.current + 12);
        // Acoustic VAD: Extend silence budget only for genuine above-noise speech shortly after STT activity
        if (
          level >= speechThreshold &&
          conversationStateRef.current === 'listening' &&
          now - lastTranscriptActivityAtRef.current < 3000
        ) {
          lastVoiceActivityAtRef.current = now;
        }

        animFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (err) {
      console.warn('Audio visualizer note:', err);
    }
  };

  const stopAudioVisualizer = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    setMicVolumeLevel(0);
  };

  // 3. Clear Silence Timer & Countdown
  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (pauseIntervalRef.current) {
      clearInterval(pauseIntervalRef.current);
      pauseIntervalRef.current = null;
    }
    setPauseCountdown(null);
  }, []);

  // 4. Start & Stop Mic
  const startMicListening = useCallback(() => {
    lastVoiceActivityAtRef.current = Date.now();
    lastTranscriptActivityAtRef.current = Date.now();
    isListeningMicRef.current = true;
    setIsListeningMic(true);
    startAudioVisualizer();
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
    } catch {}
  }, []);

  const stopMicListening = useCallback(() => {
    clearSilenceTimer();
    isListeningMicRef.current = false;
    setIsListeningMic(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    stopAudioVisualizer();
  }, [clearSilenceTimer]);

  // 5. High-Quality TTS Speech for Emily Zhou
  const speakInterviewerSpeech = useCallback((text: string, onEndCallback?: () => void) => {
    if (speechSafetyTimerRef.current) {
      clearTimeout(speechSafetyTimerRef.current);
      speechSafetyTimerRef.current = null;
    }

    if (!('speechSynthesis' in window)) {
      conversationStateRef.current = 'listening';
      setConversationState('listening');
      lastVoiceActivityAtRef.current = Date.now();
      lastTranscriptActivityAtRef.current = Date.now();
      startMicListening();
      if (onEndCallback) onEndCallback();
      return;
    }

    window.speechSynthesis.cancel();
    stopMicListening();
    conversationStateRef.current = 'interviewer_speaking';
    setConversationState('interviewer_speaking');
    setCurrentInterviewerCaption(text);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice =
      voices.find((v) => /natural|samantha|zira|karen|female|google uk english female/i.test(v.name)) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0];

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    activeUtteranceRef.current = utterance;

    let finished = false;
    const handleSpeechDone = () => {
      if (finished) return;
      finished = true;
      if (speechSafetyTimerRef.current) {
        clearTimeout(speechSafetyTimerRef.current);
        speechSafetyTimerRef.current = null;
      }
      activeUtteranceRef.current = null;
      conversationStateRef.current = 'listening';
      setConversationState('listening');
      lastVoiceActivityAtRef.current = Date.now();
      lastTranscriptActivityAtRef.current = Date.now();
      startMicListening();
      if (onEndCallback) onEndCallback();
    };

    utterance.onend = handleSpeechDone;
    utterance.onerror = handleSpeechDone;

    // Chromium SpeechSynthesis watchdog in case onend is dropped after a long pause
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const maxSpeechMs = Math.min(45000, Math.max(5000, wordCount * 550 + 3000));
    speechSafetyTimerRef.current = setTimeout(handleSpeechDone, maxSpeechMs);

    window.speechSynthesis.speak(utterance);
  }, [startMicListening, stopMicListening]);

  // 5b. Repeat Current Question explicitly on user request or voice clarification
  const handleRepeatCurrentQuestion = useCallback(() => {
    if (!session) return;
    const currentQ = session.questions[currentQuestionIndex];
    if (!currentQ) return;

    clearSilenceTimer();
    setUserSpokenAnswer('');
    setInterimTranscript('');
    latestSpokenAnswerRef.current = '';
    latestInterimRef.current = '';
    lastSpokenTextSnapshotRef.current = '';

    const text = `Let me repeat the question: ${currentQ.question}`;
    setTranscriptMessages((prev) => [
      ...prev,
      {
        sender: 'interviewer',
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    speakInterviewerSpeech(text);
  }, [session, currentQuestionIndex, clearSilenceTimer, speakInterviewerSpeech]);

  // 6. Automatic Continuous Dialogue Processing (Candidate finishes speaking -> Emily responds!)
  const handleAutoProcessCandidateAnswer = useCallback(async () => {
    clearSilenceTimer();
    if (isSubmittingAnswerRef.current) return;

    // Combine finalized spoken answer with any in-flight interim speech and clean technical jargon
    const rawSpoken = (latestSpokenAnswerRef.current + ' ' + (latestInterimRef.current || '')).trim();
    const spoken = sanitizeSpokenTranscript(rawSpoken, candidateName);
    if (!spoken || spoken.length < 2) return;

    if (!session || !id) return;
    const currentQ = session.questions[currentQuestionIndex];
    if (!currentQ) return;

    const words = spoken.split(/\s+/).filter(Boolean);
    const isShortVoiceCommand = words.length <= 12;

    // A. CLARIFICATION & REPEAT INTENT DETECTION (only for short direct requests, never mid-answer)
    const repeatRegex = /\b(wait\s*once\s*again|once\s*again|repeat\s*(the\s*)?question|repeat\s*please|say\s*(that|it)\s*again|speak\s*again|pardon\s*me|didn'?t\s*hear|didn'?t\s*catch|what\s*did\s*you\s*say|could\s*you\s*repeat|can\s*you\s*repeat)\b/i;
    if (isShortVoiceCommand && repeatRegex.test(spoken)) {
      setUserSpokenAnswer('');
      setInterimTranscript('');
      latestSpokenAnswerRef.current = '';
      latestInterimRef.current = '';
      lastSpokenTextSnapshotRef.current = '';
      clearSilenceTimer();

      const repeatPrompt = `Sure, no problem! Let me repeat the question for you: ${currentQ.question}`;
      setTranscriptMessages((prev) => [
        ...prev,
        {
          sender: 'interviewer',
          text: repeatPrompt,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      speakInterviewerSpeech(repeatPrompt);
      return;
    }

    // B. PAUSE / THINKING INTENT DETECTION (only for short direct requests, never technical phrasing like "wait for lock")
    const pauseRegex = /\b(wait\s+(a\s+(minute|moment|second|bit)|one\s+(second|moment|minute)|please)|hold\s*on(\s*a\s*(second|moment|minute))?|give\s*me\s*a\s*(moment|minute|second)|let\s*me\s*think|just\s*a\s*(moment|minute|second)|take\s*a\s*minute)\b/i;
    if (isShortVoiceCommand && pauseRegex.test(spoken)) {
      setUserSpokenAnswer('');
      setInterimTranscript('');
      latestSpokenAnswerRef.current = '';
      latestInterimRef.current = '';
      lastSpokenTextSnapshotRef.current = '';
      clearSilenceTimer();

      const candidateFirstName =
        candidateName && candidateName !== 'Candidate' ? candidateName.split(' ')[0] : 'there';
      const pausePrompt = `Of course, take your time ${candidateFirstName}! I'm right here listening whenever you're ready to share your answer.`;
      setTranscriptMessages((prev) => [
        ...prev,
        {
          sender: 'interviewer',
          text: pausePrompt,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      speakInterviewerSpeech(pausePrompt);
      return;
    }

    // C. MINIMUM MEANINGFUL CONTENT GUARD (Ignore accidental 1-word fillers like "ok", "uh", "hmm")
    if (words.length < 2 && spoken.length < 8) {
      return;
    }

    isSubmittingAnswerRef.current = true;
    conversationStateRef.current = 'evaluating';
    setConversationState('evaluating');
    stopMicListening();

    try {
      // 1. Add candidate answer to transcript
      setTranscriptMessages((prev) => [
        ...prev,
        {
          sender: 'candidate',
          text: spoken,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      // 2. Mark current topic as discussed and move next topic to discussing (matching Photo 4)
      setResumeTopics((prev) =>
        prev.map((t, idx) => {
          if (idx === currentQuestionIndex) return { ...t, status: 'discussed' };
          if (idx === currentQuestionIndex + 1) return { ...t, status: 'discussing' };
          return t;
        })
      );

      // 3. Send to backend AI
      let result: any = null;
      try {
        result = await submitMockAnswer(id, currentQ.id, spoken, currentQuestionIndex);
      } catch (e) {
        console.warn('Evaluation fallback note:', e);
      }

      // Reset spoken answer buffers
      setUserSpokenAnswer('');
      setInterimTranscript('');
      latestSpokenAnswerRef.current = '';
      latestInterimRef.current = '';
      lastSpokenTextSnapshotRef.current = '';

      // 4. Check if more questions remain
      if (!result?.isCompleted && currentQuestionIndex + 1 < session.questions.length) {
        const nextIdx = currentQuestionIndex + 1;
        if (result?.nextQuestion) {
          setSession((prev) => {
            if (!prev) return prev;
            const updatedQuestions = [...prev.questions];
            updatedQuestions[nextIdx] = result.nextQuestion;
            return { ...prev, questions: updatedQuestions };
          });
        }

        setCurrentQuestionIndex(nextIdx);

        // Emily speaks next natural question live
        const nextSpeech =
          result?.interviewerSpeech ||
          `Hmm, okay. ${session.questions[nextIdx].question}`;

        setTranscriptMessages((prev) => [
          ...prev,
          {
            sender: 'interviewer',
            text: nextSpeech,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);

        speakInterviewerSpeech(nextSpeech);
      } else {
        // Complete interview session naturally
        const closing =
          result?.interviewerSpeech ||
          `Thank you ${candidateName}. That gives me a thorough understanding of your technical background and projects. I am preparing your assessment report now.`;
        speakInterviewerSpeech(closing, () => {
          handleEndSession();
        });
      }
    } catch (err) {
      console.error('Error in conversation step:', err);
      conversationStateRef.current = 'listening';
      setConversationState('listening');
      startMicListening();
    } finally {
      isSubmittingAnswerRef.current = false;
    }
  }, [
    session,
    id,
    candidateName,
    currentQuestionIndex,
    clearSilenceTimer,
    stopMicListening,
    startMicListening,
    speakInterviewerSpeech,
  ]);

  useEffect(() => {
    handleAutoProcessRef.current = () => {
      handleAutoProcessCandidateAnswer();
    };
  }, [handleAutoProcessCandidateAnswer]);

  // 7. Initialize Speech Recognition cleanly (not torn down between questions)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    // Set speech recognition language explicitly (en-IN by default for accurate Indian accent & tech phonetics)
    recognition.lang = speechLang;

    recognition.onresult = (event: any) => {
      // Drop late buffered STT events while interviewer is speaking, evaluating, or editing
      if (
        !isListeningMicRef.current ||
        conversationStateRef.current !== 'listening' ||
        isSubmittingAnswerRef.current ||
        isEditingSpokenAnswerRef.current
      ) {
        return;
      }

      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript + ' ';
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (final.trim()) {
        const cleanedFinal = sanitizeSpokenTranscript(final.trim(), candidateNameRef.current);
        const updatedFinal = latestSpokenAnswerRef.current
          ? `${latestSpokenAnswerRef.current} ${cleanedFinal}`
          : cleanedFinal;
        latestSpokenAnswerRef.current = updatedFinal;
        setUserSpokenAnswer(updatedFinal);
      }

      const cleanedInterim = sanitizeSpokenTranscript(interim, candidateNameRef.current);
      latestInterimRef.current = cleanedInterim;
      setInterimTranscript(cleanedInterim);

      const currentFullText = (latestSpokenAnswerRef.current + ' ' + cleanedInterim).trim();
      if (currentFullText !== lastSpokenTextSnapshotRef.current) {
        lastSpokenTextSnapshotRef.current = currentFullText;
        lastTranscriptActivityAtRef.current = Date.now();
        lastVoiceActivityAtRef.current = Date.now();
      }
    };

    recognition.onspeechend = () => {
      // Do NOT cut off on brief speech pauses; the acoustic + transcript silence monitor manages turn-taking.
    };

    recognition.onerror = (e: any) => {
      if (e?.error !== 'no-speech' && e?.error !== 'aborted') {
        console.warn('Speech recognition notice:', e?.error);
      }
    };

    recognition.onend = () => {
      if (isListeningMicRef.current && conversationStateRef.current === 'listening') {
        setTimeout(() => {
          if (
            isListeningMicRef.current &&
            conversationStateRef.current === 'listening' &&
            recognitionRef.current
          ) {
            try {
              recognitionRef.current.start();
            } catch {}
          }
        }, 150);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, [speechLang]);

  // 7b. Acoustic + Transcript Silence Monitor (Snappy auto-send with breathing room for long answers)
  useEffect(() => {
    if (
      conversationState !== 'listening' ||
      !isListeningMic ||
      !autoSendEnabled ||
      isEditingSpokenAnswer
    ) {
      setPauseCountdown(null);
      return;
    }

    const monitor = setInterval(() => {
      if (
        !autoSendEnabledRef.current ||
        !isListeningMicRef.current ||
        conversationStateRef.current !== 'listening' ||
        isSubmittingAnswerRef.current ||
        isEditingSpokenAnswerRef.current
      ) {
        setPauseCountdown(null);
        return;
      }

      const combined = (latestSpokenAnswerRef.current + ' ' + latestInterimRef.current).trim();
      const words = combined.split(/\s+/).filter(Boolean);
      if (words.length < 2 && combined.length < 8) {
        setPauseCountdown(null);
        return;
      }

      const lastActivityAt = Math.max(
        lastVoiceActivityAtRef.current,
        lastTranscriptActivityAtRef.current
      );
      const silentMs = Date.now() - lastActivityAt;

      // Show countdown after 1.8s of silence; give extra breathing room for longer (>=25 words) answers.
      if (silentMs < 1800) {
        setPauseCountdown(null);
        return;
      }

      const totalSilenceBudgetMs = words.length >= 25 ? 6000 : 4500;
      const remainingSec = Math.ceil((totalSilenceBudgetMs - silentMs) / 1000);

      if (remainingSec <= 0) {
        setPauseCountdown(null);
        handleAutoProcessRef.current();
      } else {
        setPauseCountdown(remainingSec);
      }
    }, 500);

    return () => clearInterval(monitor);
  }, [conversationState, isListeningMic, autoSendEnabled, isEditingSpokenAnswer]);

  // 8. Countdown Timer (44:53)
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 9. Load Session & Start Call Immediately (guarded against StrictMode double-load)
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const loadSession = async () => {
      setIsLoading(true);
      try {
        const data = await getMockInterview(id);
        if (cancelled) return;
        setSession(data);

        // Initialize candidate talking points notes from session or track-aware starter bullets
        const sessionNotes = (data as any).candidateNotes;
        if (typeof sessionNotes === 'string' && sessionNotes.trim().length > 0) {
          setNotesContent(sessionNotes);
        } else if (data.interviewType === 'HR' || data.interviewType === 'Behavioral') {
          setNotesContent(
            `- Situation: Brief project / team context\n- Task: What responsibility you owned\n- Action: Concrete steps & trade-offs you drove\n- Result: Measurable impact & key takeaway`
          );
        } else if (data.interviewType === 'Coding') {
          setNotesContent(
            `- Clarify input size, constraints & edge cases\n- Brute force vs optimal data structure\n- Time & auxiliary space complexity (Big-O)`
          );
        }

        // Initialize 8 Resume Topics
        if (data.resumeTopics && data.resumeTopics.length > 0) {
          setResumeTopics(data.resumeTopics);
        } else {
          setResumeTopics([
            { id: 't1', title: `${candidateName}`, category: 'Profile', description: `${data.role || 'Software Engineer'} · ${data.interviewType || 'Technical'}`, status: 'discussing' },
            { id: 't2', title: `${data.interviewType || 'Technical'} Foundations`, category: 'TRACK', description: `Core concepts, design decisions, and problem solving`, status: 'not_yet' },
            { id: 't3', title: 'Core Project Architecture & Design', category: 'PROJECT', description: 'End-to-end architecture, data flow, and trade-offs.', status: 'not_yet' },
            { id: 't4', title: 'Technical Stack & Internals', category: 'STACK', description: 'Language runtime, state/data handling, and indexing strategies.', status: 'not_yet' },
            { id: 't5', title: 'Edge Cases & Performance', category: 'ALGORITHMS', description: 'Time and space complexity, bottlenecks, and reliability.', status: 'not_yet' },
            { id: 't6', title: 'STAR Behavioral Scenarios', category: 'BEHAVIORAL', description: 'Ownership, debugging under pressure, and collaboration.', status: 'not_yet' },
          ]);
        }

        // Welcome candidate & ask the ACTUAL first generated question for this round
        const firstQuestion =
          data.questions?.[0]?.question ||
          'Tell me about yourself and walk me through your background and a project you built.';
        const roundLabel = data.interviewType || 'Technical';
        const greeting = `Hi ${candidateName}, welcome to your ${data.company || 'Tech'} ${data.role || 'Software Engineer'} ${roundLabel} interview. I'm ${data.interviewerName || 'Emily Zhou'}. ${firstQuestion}`;

        setTranscriptMessages([
          {
            sender: 'interviewer',
            text: greeting,
            time: 'Just now',
          },
        ]);

        speakInterviewerSpeech(greeting);
      } catch (err: any) {
        if (!cancelled) {
          console.error('Failed to load session:', err);
          setErrorMessage('Could not load interview session details.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadSession();

    return () => {
      cancelled = true;
      if (speechSafetyTimerRef.current) {
        clearTimeout(speechSafetyTimerRef.current);
        speechSafetyTimerRef.current = null;
      }
      activeUtteranceRef.current = null;
      window.speechSynthesis?.cancel();
      clearSilenceTimer();
      stopMicListening();
    };
  }, [id]);

  // 10. Complete Interview & Navigate to Report
  const handleEndSession = async () => {
    if (!id) return;
    setIsEndingSession(true);
    window.speechSynthesis?.cancel();
    stopMicListening();

    try {
      await completeMockInterview(id);
      navigate(`/ai-interview/${id}/result`);
    } catch {
      navigate(`/ai-interview/${id}/result`);
    } finally {
      setIsEndingSession(false);
    }
  };

  const discussedCount = resumeTopics.filter((t) => t.status === 'discussed').length;
  const startedAtIso = (session as any)?.startedAt || session?.createdAt;
  const formattedStartTime = startedAtIso
    ? new Date(startedAtIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Live';
  const codingProblem: any = (session as any)?.codingProblem || null;
  const activeQuestion: any = session?.questions?.[currentQuestionIndex];
  const sessionTypeLower = (session?.interviewType || '').toLowerCase();
  const isNonCodingRound = sessionTypeLower === 'hr' || sessionTypeLower === 'behavioral';
  const isCodingTrack = sessionTypeLower === 'coding' || sessionTypeLower.includes('coding');

  // Show compiler ONLY when the active question actually requires live coding / SQL implementation
  const activeQuestionNeedsCode = React.useMemo(() => {
    if (!activeQuestion || isNonCodingRound) return false;
    if (activeQuestion.stage === 'introduction' || currentQuestionIndex === 0) return false;
    if (typeof activeQuestion.requiresCode === 'boolean') return activeQuestion.requiresCode;
    if (isCodingTrack && currentQuestionIndex >= 1) return true;
    const qText = String(activeQuestion.question || '');
    return /\b(write a (function|method|query|sql|program)|implement (a|an|the)|using the coding ide|in the coding ide)\b/i.test(
      qText
    );
  }, [activeQuestion, currentQuestionIndex, isNonCodingRound, isCodingTrack]);

  // Coding IDE tab is only surfaced when the current question needs code or in programming-focused rounds after intro
  const showCodingIdeTab =
    !isNonCodingRound &&
    (activeQuestionNeedsCode || (isCodingTrack && currentQuestionIndex >= 1));

  useEffect(() => {
    if (!session) return;
    if (activeQuestionNeedsCode) {
      setCenterTab('code');
      const problemStarter = codingProblem?.starterCode?.[interviewLang];
      const currentDefault = DEFAULT_INTERVIEW_STARTERS[interviewLang];
      if (problemStarter && (!interviewCode.trim() || interviewCode.trim() === currentDefault.trim())) {
        setInterviewCode(problemStarter);
      }
    } else {
      setCenterTab('notes');
    }
  }, [session?._id, currentQuestionIndex, activeQuestion?.id, activeQuestionNeedsCode]);

  const handleInterviewLangChange = (nextLang: SupportedLanguage) => {
    const prevStarter = codingProblem?.starterCode?.[interviewLang] || DEFAULT_INTERVIEW_STARTERS[interviewLang];
    const nextStarter = codingProblem?.starterCode?.[nextLang] || DEFAULT_INTERVIEW_STARTERS[nextLang];
    setInterviewLang(nextLang);
    if (!interviewCode.trim() || interviewCode.trim() === prevStarter.trim()) {
      setInterviewCode(nextStarter);
    }
  };

  const handleRunCodeInSession = async () => {
    if (!id || !interviewCode.trim()) return;
    setIsRunningCode(true);
    try {
      const output = await runInterviewCode(id, interviewCode, interviewLang);
      setCodeOutput(output);
    } catch (err: any) {
      setCodeOutput({
        stdout: '',
        stderr: err?.data?.error || err?.response?.data?.error || err?.message || 'Failed to execute code.',
        time: '0ms',
        exitCode: 1,
      });
    } finally {
      setIsRunningCode(false);
    }
  };

  const handleSubmitCodingSolution = async () => {
    if (!id || !session || isSubmittingAnswerRef.current) return;
    const spokenOrTyped = (latestSpokenAnswerRef.current + ' ' + latestInterimRef.current).trim();
    const explanationText =
      spokenOrTyped.length >= 10
        ? spokenOrTyped
        : `Submitted ${interviewLang.toUpperCase()} implementation in Live Coding IDE:\n${interviewCode.slice(0, 500)}`;

    const q = session.questions[currentQuestionIndex] as any;
    const questionId = q?._id || q?.id || `q-${currentQuestionIndex}`;
    isSubmittingAnswerRef.current = true;
    conversationStateRef.current = 'evaluating';
    setConversationState('evaluating');
    stopMicListening();

    try {
      setTranscriptMessages((prev) => [
        ...prev,
        {
          sender: 'candidate',
          text: `${explanationText} [${interviewLang.toUpperCase()} code attached]`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      const result = await submitMockAnswer(
        id,
        questionId,
        explanationText,
        currentQuestionIndex,
        interviewCode,
        interviewLang
      );

      setUserSpokenAnswer('');
      setInterimTranscript('');
      latestSpokenAnswerRef.current = '';
      latestInterimRef.current = '';
      lastSpokenTextSnapshotRef.current = '';

      if (result?.interviewerSpeech) {
        setTranscriptMessages((prev) => [
          ...prev,
          {
            sender: 'interviewer',
            text: result.interviewerSpeech!,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        speakInterviewerSpeech(result.interviewerSpeech);
      }

      if (result?.isCompleted) {
        setTimeout(() => navigate(`/ai-interview/${id}/result`), 1800);
        return;
      }

      if (currentQuestionIndex + 1 < session.questions.length) {
        const nextIdx = currentQuestionIndex + 1;
        if (result?.nextQuestion) {
          setSession((prev) => {
            if (!prev) return prev;
            const updatedQuestions = [...prev.questions];
            updatedQuestions[nextIdx] = result.nextQuestion;
            return { ...prev, questions: updatedQuestions };
          });
        }
        setCurrentQuestionIndex(nextIdx);
      }
    } catch (err) {
      console.error('Coding submission error:', err);
      conversationStateRef.current = 'listening';
      setConversationState('listening');
    } finally {
      isSubmittingAnswerRef.current = false;
    }
  };

  const applyMarkdownFormat = (prefix: string, suffix: string = '', placeholder: string = '') => {
    const el = notesTextareaRef.current;
    const start = el ? el.selectionStart : notesContent.length;
    const end = el ? el.selectionEnd : notesContent.length;
    const selected = notesContent.slice(start, end) || placeholder;
    const updated = notesContent.slice(0, start) + prefix + selected + suffix + notesContent.slice(end);
    setNotesContent(updated);
    if (id) saveCandidateNotes(id, updated);
    requestAnimationFrame(() => {
      if (!notesTextareaRef.current) return;
      notesTextareaRef.current.focus();
      const cursorPos = start + prefix.length + selected.length;
      notesTextareaRef.current.setSelectionRange(cursorPos, cursorPos);
    });
  };

  const handleAddNoteTag = () => {
    const clean = newTagText.trim();
    if (clean && !noteTags.includes(clean)) {
      setNoteTags((prev) => [...prev, clean]);
    }
    setNewTagText('');
    setIsAddingTag(false);
  };

  const handleCreateNoteSection = () => {
    const nextLabel = activeNotePage === 'talking_points' ? 'scratchpad' : 'talking_points';
    setActiveNotePage(nextLabel);
    if (nextLabel === 'scratchpad' && !notesContent.includes('## Scratchpad')) {
      const updated = `${notesContent.trimEnd()}\n\n## Scratchpad\n- `;
      setNotesContent(updated);
      if (id) saveCandidateNotes(id, updated);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07070d] text-white flex flex-col items-center justify-center space-y-4">
        <span className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wide text-slate-300">
          Connecting to {session?.interviewerName || 'AI Interviewer'} · Interview Session...
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#0c0d14] text-slate-100 flex flex-col font-sans select-none antialiased overflow-hidden">
      
      {/* =========================================================================
          TOP BAR (Matching Photo 4: Arrow left, moon, "Resume interview", status, timer)
          ========================================================================= */}
      <header className="h-14 px-4 sm:px-6 border-b border-slate-800/80 bg-[#10111a] flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <Link
            to="/ai-interview"
            onClick={() => window.speechSynthesis?.cancel()}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Exit interview"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Toggle theme"
          >
            <Moon className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-800" />

          <div>
            <h1 className="text-xs font-bold text-white tracking-wide">
              AI Mock Interview
            </h1>
            <p className="text-[11px] flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  conversationState === 'interviewer_speaking'
                    ? 'bg-emerald-400 animate-ping'
                    : conversationState === 'listening'
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-indigo-400'
                }`}
              />
              <span className="text-slate-400">
                Connected ·{' '}
                <strong className="text-slate-200 font-semibold">
                  {conversationState === 'interviewer_speaking'
                    ? 'Interviewer speaking'
                    : conversationState === 'listening'
                    ? 'Listening to you'
                    : 'Analyzing response'}
                </strong>
              </span>
            </p>
          </div>
        </div>

        {/* Right Timer: "44:53" (Photo 4) */}
        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-300">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatTimer(secondsRemaining)}</span>
        </div>
      </header>

      {/* =========================================================================
          MAIN INTERVIEW WORKSPACE (Balanced 3-column layout)
          ========================================================================= */}
      <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden relative min-w-0">

        {/* -----------------------------------------------------------------------
            LEFT COLUMN: "Your resume"
            ----------------------------------------------------------------------- */}
        <aside
          className={`col-span-12 md:col-span-3 lg:col-span-3 min-w-0 border-r border-slate-800/80 bg-[#0e0f17] flex flex-col h-full overflow-hidden transition-all duration-300 ${
            isSidebarOpen ? '' : 'hidden'
          }`}
        >
          {/* Header Bar */}
          <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-200">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Your resume</span>
              <span className="text-slate-400 font-normal">
                {discussedCount} of {resumeTopics.length} discussed
              </span>
            </span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              title="Collapse resume"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* List of 8 Resume Cards (Exact Photo 4 Cards) */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {resumeTopics.map((topic, idx) => {
              const isDiscussing = topic.status === 'discussing';
              const isDiscussed = topic.status === 'discussed';

              return (
                <div
                  key={topic.id || idx}
                  className={`p-3 rounded-xl border text-xs transition-all ${
                    isDiscussing
                      ? 'border-indigo-500 bg-indigo-950/30 ring-1 ring-indigo-500/40 shadow-sm'
                      : isDiscussed
                      ? 'border-emerald-500/30 bg-emerald-950/15'
                      : 'border-slate-800/80 bg-[#13141f] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {topic.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isDiscussed
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isDiscussing
                          ? 'bg-indigo-500/20 text-indigo-300 animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isDiscussed ? '✓ Discussed' : isDiscussing ? '● Discussing' : 'Not yet'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-200 text-xs leading-snug">
                    {topic.title}
                  </h3>

                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-3">
                    {topic.description}
                  </p>
                </div>
              );
            })}
          </div>
        </aside>

        {/* -----------------------------------------------------------------------
            MIDDLE COLUMN: Notes (Talking points) / Live Coding IDE (when needed)
            ----------------------------------------------------------------------- */}
        <main
          className={`min-w-0 ${
            isSidebarOpen
              ? 'col-span-12 md:col-span-5 lg:col-span-6'
              : 'col-span-12 md:col-span-8 lg:col-span-9'
          } bg-[#0c0d14] flex flex-col h-full border-r border-slate-800/80 overflow-hidden`}
        >
          {/* Notes / Coding IDE Top Tab Bar */}
          <div className="h-11 px-4 border-b border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-300 bg-[#0e0f17] shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              {!isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white mr-1"
                  title="Expand resume"
                >
                  <PanelLeftOpen className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setCenterTab('notes')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  centerTab === 'notes'
                    ? 'text-white font-bold bg-slate-800/90'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Talking Points
              </button>
              {showCodingIdeTab && (
                <button
                  type="button"
                  onClick={() => setCenterTab('code')}
                  className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                    centerTab === 'code'
                      ? 'text-white font-bold bg-indigo-600/30 border border-indigo-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Coding IDE</span>
                </button>
              )}
              {centerTab === 'notes' && (
                <>
                  <span className="text-slate-700">|</span>
                  <button
                    type="button"
                    onClick={handleCreateNoteSection}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    title="Add / toggle Scratchpad section in notes"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{activeNotePage === 'talking_points' ? 'New page' : 'Talking points'}</span>
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">
                {centerTab === 'code'
                  ? 'Live Coding Compiler'
                  : `${formattedStartTime} ${activeNotePage === 'talking_points' ? 'Talking points' : 'Scratchpad'}`}
              </span>
            </div>
          </div>

          {/* =====================================================================
              ACTIVE INTERVIEW QUESTION BANNER (Clear prominent display so candidate never misses audio)
              ===================================================================== */}
          <div className="p-4 sm:p-5 m-3 sm:m-4 mb-2 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-[#131525] to-[#0f101c] border border-indigo-500/40 shadow-xl space-y-3 shrink-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/25 text-indigo-300 font-bold text-xs uppercase tracking-wider border border-indigo-500/30">
                  Question {currentQuestionIndex + 1} of {session?.questions.length || 5}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800/80 text-[10px] font-semibold text-slate-300 border border-slate-700/60 uppercase">
                  {session?.questions[currentQuestionIndex]?.category || 'Core Architecture'}
                </span>
              </div>

              {/* Explicit Repeat Question Button */}
              <button
                onClick={handleRepeatCurrentQuestion}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm"
                title="Ask interviewer to repeat this question out loud"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Repeat Question</span>
              </button>
            </div>

            {/* Active Question Text in Crisp High-Contrast Typography */}
            <h2 className="text-sm sm:text-base font-bold text-white leading-relaxed">
              {session?.questions[currentQuestionIndex]?.question ||
                'Tell me about yourself and your journey in software development.'}
            </h2>

            {/* Live Speech Captions Bar during Emily's voice */}
            {conversationState === 'interviewer_speaking' && currentInterviewerCaption && (
              <div className="flex items-start gap-2 text-xs text-emerald-300 bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-500/30 animate-fade-in">
                <Volume2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                <span className="italic leading-relaxed">"{currentInterviewerCaption}"</span>
              </div>
            )}
          </div>

          {centerTab === 'notes' ? (
            <>
              {/* Talking Points Card Header */}
              <div className="px-4 sm:px-6 pt-2 pb-3 space-y-3 shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-white">Talking points</h2>
                  <button
                    onClick={() => setNotesContent('')}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                    title="Clear notes"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Tags row: interactive tags + real session start time */}
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  {noteTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-600/30 text-indigo-300 font-bold border border-indigo-500/30"
                    >
                      <span>{tag}</span>
                      {tag !== 'Resume' && (
                        <button
                          type="button"
                          onClick={() => setNoteTags((prev) => prev.filter((t) => t !== tag))}
                          className="text-indigo-300/70 hover:text-white ml-0.5 cursor-pointer"
                          aria-label={`Remove ${tag}`}
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                  <span className="text-slate-400">Started {formattedStartTime}</span>
                  {isAddingTag ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAddNoteTag();
                      }}
                      className="inline-flex items-center gap-1"
                    >
                      <input
                        type="text"
                        autoFocus
                        value={newTagText}
                        onChange={(e) => setNewTagText(e.target.value)}
                        onBlur={handleAddNoteTag}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            setNewTagText('');
                            setIsAddingTag(false);
                          }
                        }}
                        placeholder="tag..."
                        className="w-20 px-2 py-0.5 rounded bg-slate-900 border border-indigo-500/50 text-slate-200 text-[11px] focus:outline-none"
                      />
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAddingTag(true)}
                      className="text-slate-500 hover:text-slate-300 font-medium cursor-pointer"
                    >
                      + add tag
                    </button>
                  )}
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>Your interviewer can read these notes.</span>
                  </span>
                </div>

                {/* Rich Text Markdown Toolbar */}
                <div className="flex items-center gap-1 py-1.5 px-2 rounded-xl bg-slate-900/70 border border-slate-800 text-slate-400 text-xs">
                  <button
                    type="button"
                    onClick={() => applyMarkdownFormat('\n## ', '', 'Section Heading')}
                    className="p-1 rounded hover:bg-slate-800 hover:text-white cursor-pointer"
                    title="Heading"
                  >
                    <Heading2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyMarkdownFormat('**', '**', 'bold text')}
                    className="p-1 rounded hover:bg-slate-800 hover:text-white cursor-pointer"
                    title="Bold"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyMarkdownFormat('*', '*', 'italic text')}
                    className="p-1 rounded hover:bg-slate-800 hover:text-white cursor-pointer"
                    title="Italic"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <div className="h-3 w-px bg-slate-800 mx-1" />
                  <button
                    type="button"
                    onClick={() => applyMarkdownFormat('\n- ', '', 'Bullet point')}
                    className="p-1 rounded hover:bg-slate-800 hover:text-white cursor-pointer"
                    title="Bullet list"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyMarkdownFormat('\n1. ', '', 'Step 1')}
                    className="p-1 rounded hover:bg-slate-800 hover:text-white cursor-pointer"
                    title="Numbered list"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyMarkdownFormat('\n```\n', '\n```\n', 'code snippet')}
                    className="p-1 rounded hover:bg-slate-800 hover:text-white cursor-pointer"
                    title="Code snippet"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyMarkdownFormat('[', '](https://example.com)', 'reference')}
                    className="p-1 rounded hover:bg-slate-800 hover:text-white cursor-pointer"
                    title="Insert link"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      applyMarkdownFormat('\n| Metric | Value |\n| --- | --- |\n| Latency | <50ms |\n', '', '')
                    }
                    className="p-1 rounded hover:bg-slate-800 hover:text-white cursor-pointer"
                    title="Insert table"
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Editable Notepad Area */}
              <div className="flex-1 px-4 sm:px-6 pb-24 overflow-hidden flex flex-col">
                <textarea
                  ref={notesTextareaRef}
                  value={notesContent}
                  onChange={(e) => {
                    setNotesContent(e.target.value);
                    if (id) saveCandidateNotes(id, e.target.value);
                  }}
                  placeholder="- Key concepts & edge cases\n- Architecture & trade-offs\n- Examples from your projects"
                  className="w-full flex-1 bg-transparent border-0 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none resize-none leading-relaxed overflow-y-auto"
                />
              </div>
            </>
          ) : (
            /* Live Coding IDE Panel */
            <div className="flex-1 px-4 sm:px-6 pt-2 pb-24 overflow-y-auto flex flex-col gap-3 min-w-0">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  <span>Live Coding Workspace</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setCenterTab('notes')}
                  className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Switch to Talking Points
                </button>
              </div>

              {codingProblem && (
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-white">{codingProblem.title}</span>
                    {codingProblem.difficulty && (
                      <Badge
                        variant={
                          codingProblem.difficulty === 'Easy' || codingProblem.difficulty === 'Beginner'
                            ? 'success'
                            : codingProblem.difficulty === 'Medium' || codingProblem.difficulty === 'Intermediate'
                            ? 'warning'
                            : 'danger'
                        }
                        size="sm"
                      >
                        {codingProblem.difficulty}
                      </Badge>
                    )}
                  </div>
                  {codingProblem.description && (
                    <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-4">
                      {codingProblem.description}
                    </p>
                  )}
                </div>
              )}

              <div className="h-[300px] shrink-0 min-w-0">
                <CodeEditor
                  language={interviewLang}
                  code={interviewCode}
                  onChange={setInterviewCode}
                  onLanguageChange={handleInterviewLangChange}
                  onReset={() => {
                    const starter =
                      codingProblem?.starterCode?.[interviewLang] || DEFAULT_INTERVIEW_STARTERS[interviewLang];
                    setInterviewCode(starter);
                  }}
                  isDarkTheme={true}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRunCodeInSession}
                    isLoading={isRunningCode}
                    leftIcon={<Play className="w-3.5 h-3.5" />}
                  >
                    Run Code
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleSubmitCodingSolution}
                    disabled={conversationState === 'evaluating'}
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                  >
                    Submit Code & Approach
                  </Button>
                </div>
                {codeOutput && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    Exit {codeOutput.exitCode} · {codeOutput.time}
                  </span>
                )}
              </div>

              {codeOutput && (
                <div
                  className={`p-3 rounded-xl border text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto ${
                    codeOutput.stderr || codeOutput.exitCode !== 0
                      ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                      : 'bg-slate-950 border-slate-800 text-emerald-300'
                  }`}
                >
                  {codeOutput.stderr || codeOutput.stdout || 'Executed with empty output.'}
                </div>
              )}
            </div>
          )}
        </main>

        {/* -----------------------------------------------------------------------
            RIGHT COLUMN: Interviewer Portrait Tile + Candidate Tile
            ----------------------------------------------------------------------- */}
        <section className="col-span-12 md:col-span-4 lg:col-span-3 min-w-0 bg-[#0e0f17] flex flex-col p-4 gap-4 h-full overflow-y-auto pb-24">
          
          {/* 1. Centered Static Portrait with Speaking Light Ring */}
          <EmilyAIVideoAvatar
            conversationState={conversationState}
            avatarUrl={
              session?.interviewerAvatar ||
              'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=600&auto=format&fit=crop&crop=faces,center&q=85'
            }
            name={session?.interviewerName || 'Emily Zhou'}
            role={session?.interviewerRole || 'Senior Software Engineer (Amazon)'}
            onRepeatQuestion={handleRepeatCurrentQuestion}
          />

          {/* 2. Candidate Live Video Tile with Green "M" or Webcam (Photo 4 Bottom Right) */}
          <div className="rounded-2xl border border-slate-800 bg-[#12131f] overflow-hidden shadow-lg shrink-0">
            <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
              {isCameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-emerald-600 text-white font-bold text-2xl flex items-center justify-center shadow-md">
                  {candidateName ? candidateName[0].toUpperCase() : 'M'}
                </div>
              )}

              {/* Mic Status & Live Audio Level on Candidate Video */}
              <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] text-white">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isListeningMic ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                  }`}
                />
                <span>{isListeningMic ? 'Mic on' : 'Mic muted'}</span>
              </div>

              {/* "Transcript" Button (Photo 4 Bottom Right of Candidate Tile) */}
              <button
                onClick={() => setIsTranscriptOpen(true)}
                className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 hover:bg-black text-[11px] font-semibold text-slate-200 transition-colors flex items-center gap-1 backdrop-blur-md"
              >
                <MessageSquare className="w-3 h-3 text-slate-400" />
                <span>Transcript</span>
              </button>
            </div>

            <div className="p-2.5 bg-[#11121d] flex items-center justify-between border-t border-slate-800 text-xs">
              <span className="font-semibold text-slate-200">
                {candidateName}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Candidate · Connected</span>
            </div>
          </div>

          {/* Current Spoken Transcript Streaming Preview with Instant "Done Speaking" Action, Auto-Send Toggle & Quick Edit */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Live Voice Feed
                </span>
                {/* Speech Accent Selector: default en-IN for Indian candidates */}
                <button
                  type="button"
                  onClick={() => setSpeechLang((prev) => (prev === 'en-IN' ? 'en-US' : 'en-IN'))}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[9px] text-emerald-400 font-bold border border-slate-700 transition-colors cursor-pointer"
                  title="Click to toggle speech recognition accent"
                >
                  {speechLang === 'en-IN' ? '🇮🇳 en-IN' : '🇺🇸 en-US'}
                </button>
                {/* Auto-send on long silence toggle so candidate has complete control during long explanations */}
                <button
                  type="button"
                  onClick={() => {
                    setAutoSendEnabled((prev) => {
                      const next = !prev;
                      if (!next) setPauseCountdown(null);
                      else {
                        lastVoiceActivityAtRef.current = Date.now();
                        lastTranscriptActivityAtRef.current = Date.now();
                      }
                      return next;
                    });
                  }}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-colors cursor-pointer ${
                    autoSendEnabled
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                  title={
                    autoSendEnabled
                      ? 'Auto-submits after extended silence. Click to switch to Manual Submit Only.'
                      : 'Manual mode: speak as long as you want and click Done Speaking when finished.'
                  }
                >
                  {autoSendEnabled ? 'Auto-send: ON' : 'Manual Only'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                {userSpokenAnswer && !isEditingSpokenAnswer && conversationState !== 'evaluating' && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingSpokenAnswer(true);
                      clearSilenceTimer();
                    }}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-0.5 cursor-pointer"
                    title="Edit any misheard words before submitting"
                  >
                    ✏️ Edit words
                  </button>
                )}
                {pauseCountdown !== null && pauseCountdown > 0 && !isEditingSpokenAnswer && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-amber-400 animate-pulse">
                      Auto-sending in {pauseCountdown}s...
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        lastVoiceActivityAtRef.current = Date.now() + 8000;
                        lastTranscriptActivityAtRef.current = Date.now() + 8000;
                        setPauseCountdown(null);
                      }}
                      className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[9px] font-bold text-emerald-400 border border-emerald-500/40 cursor-pointer"
                      title="Delay auto-submit and keep speaking"
                    >
                      ✋ Wait
                    </button>
                  </div>
                )}
              </div>
            </div>

            {isEditingSpokenAnswer ? (
              <div className="space-y-2 mt-1">
                <textarea
                  value={userSpokenAnswer}
                  onChange={(e) => {
                    setUserSpokenAnswer(e.target.value);
                    latestSpokenAnswerRef.current = e.target.value;
                  }}
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-indigo-500 bg-[#0c0d16] text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 font-sans"
                  placeholder="Correct any words here..."
                />
                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditingSpokenAnswer(false)}
                    className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white text-[11px] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingSpokenAnswer(false);
                      handleAutoProcessCandidateAnswer();
                    }}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Submit Fixed Answer ↵</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-slate-300 leading-relaxed font-sans min-h-[35px]">
                {conversationState === 'evaluating' ? (
                  <span className="text-indigo-400 italic flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                    {(session?.interviewerName || 'Emily Zhou').split(' ')[0]} is analyzing your response & preparing the next question...
                  </span>
                ) : userSpokenAnswer || interimTranscript ? (
                  <span>
                    {userSpokenAnswer}{' '}
                    <span className="text-emerald-400 italic">{interimTranscript}</span>
                  </span>
                ) : conversationState === 'interviewer_speaking' ? (
                  <span className="text-slate-400 italic">
                    {(session?.interviewerName || 'Emily Zhou').split(' ')[0]} is speaking...
                  </span>
                ) : (
                  <span className="text-emerald-400/80 italic animate-pulse">
                    🎙️ Speak your answer naturally...
                  </span>
                )}
              </p>
            )}

            {/* Instant "Done Speaking" Action Button */}
            {!isEditingSpokenAnswer && (userSpokenAnswer.trim() || interimTranscript.trim()) && conversationState !== 'evaluating' && (
              <button
                onClick={() => handleAutoProcessCandidateAnswer()}
                className="w-full mt-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-900/30 flex items-center justify-center gap-1.5 transition-all transform active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Done Speaking · Submit Answer ↵</span>
              </button>
            )}
          </div>
        </section>
      </div>

      {/* =========================================================================
          BOTTOM CALL DOCK (Matching Photo 4: Floating Mic, Done Speaking, Chat, End session)
          ========================================================================= */}
      <footer className="absolute bottom-3 left-0 right-0 px-4 flex items-center justify-between pointer-events-none z-30">
        <div className="hidden sm:block w-32" />

        {/* Center Floating Pill: [Mic] [Done Speaking] [Chat] [End session] */}
        <div className="pointer-events-auto mx-auto flex items-center gap-2 p-1.5 rounded-2xl bg-[#161724]/90 border border-slate-700/80 shadow-2xl backdrop-blur-lg">
          {/* Mic Button */}
          <button
            onClick={() => {
              if (isListeningMic) stopMicListening();
              else startMicListening();
            }}
            className={`p-2.5 rounded-xl transition-all ${
              isListeningMic
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
            }`}
            title="Toggle microphone"
          >
            {isListeningMic ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4 text-rose-400" />}
          </button>

          {/* Quick "Done Speaking" button right in dock if user has spoken */}
          {(userSpokenAnswer.trim() || interimTranscript.trim()) && conversationState !== 'evaluating' && (
            <button
              onClick={() => handleAutoProcessCandidateAnswer()}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-md shadow-emerald-600/30 animate-pulse"
              title="Done speaking, submit now"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Done Speaking</span>
            </button>
          )}

          {/* Typing Chat Button */}
          <button
            onClick={() => setIsTextModeOpen(true)}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
            title="Answer by typing"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* Red End Session Button (Photo 4) */}
          <button
            onClick={handleEndSession}
            disabled={isEndingSession}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-rose-600/30"
          >
            <Square className="w-3 h-3 fill-white" />
            <span>End session</span>
          </button>
        </div>

        {/* Right Corner: "Having mic trouble? Switch to text" Pill (Photo 4) */}
        <div className="pointer-events-auto">
          <button
            onClick={() => setIsTextModeOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-[11px] font-semibold text-slate-300 hover:text-white transition-all shadow-lg backdrop-blur-md hidden sm:flex items-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Having mic trouble? Switch to text</span>
          </button>
        </div>
      </footer>

      {/* =========================================================================
          SLIDE-OVER TRANSCRIPT DRAWER (Opened via Photo 4 "Transcript" button)
          ========================================================================= */}
      {isTranscriptOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md h-full bg-[#10111d] border-l border-slate-800 p-5 flex flex-col space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span>Interview Transcript</span>
              </h3>
              <button
                onClick={() => setIsTranscriptOpen(false)}
                className="text-slate-400 hover:text-white text-xs p-1"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {transcriptMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl text-xs space-y-1 ${
                    msg.sender === 'interviewer'
                      ? 'bg-slate-900 border border-slate-800 text-slate-200'
                      : 'bg-indigo-600/25 border border-indigo-500/40 text-indigo-100 ml-4'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                    <span>
                      {msg.sender === 'interviewer'
                        ? session?.interviewerName || 'Emily Zhou'
                        : `You (${candidateName})`}
                    </span>
                    <span>{msg.time}</span>
                  </div>
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          KEYBOARD ANSWER DRAWER (Opened via Photo 4 "Answer by typing")
          ========================================================================= */}
      {isTextModeOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#141524] border border-slate-800 p-5 space-y-3 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-indigo-400" />
                <span>Answer by typing</span>
              </h3>
              <button
                onClick={() => setIsTextModeOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕ Close
              </button>
            </div>

            <textarea
              rows={5}
              value={userSpokenAnswer}
              onChange={(e) => {
                setUserSpokenAnswer(e.target.value);
                latestSpokenAnswerRef.current = e.target.value;
              }}
              placeholder="Type your response here..."
              className="w-full p-3 rounded-xl bg-[#0d0e18] border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-none"
            />

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button size="sm" variant="outline" onClick={() => setIsTextModeOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setIsTextModeOpen(false);
                  handleAutoProcessCandidateAnswer();
                }}
              >
                Send Answer
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
