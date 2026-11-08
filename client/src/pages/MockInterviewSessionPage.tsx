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
} from '@/services/aiService';
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

export const MockInterviewSessionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const candidateName = user?.name && user.name !== 'Mohammed Farooq' && !user.name.includes('Farooq') ? user.name : 'Mohammed Hassan Ahmed';
  const { theme, toggleTheme } = useTheme();

  // Core Session State
  const [session, setSession] = useState<MockInterviewDetailedSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Conversational State matching Photo 4 ("Connected · Interviewer speaking" / "Connected · Listening to you")
  const [conversationState, setConversationState] = useState<ConversationState>('connecting');
  const [currentInterviewerCaption, setCurrentInterviewerCaption] = useState<string>('');

  // Silence detection & fast auto-submit states
  const [pauseCountdown, setPauseCountdown] = useState<number | null>(null);
  const pauseIntervalRef = useRef<any>(null);
  const isSubmittingAnswerRef = useRef<boolean>(false);
  const lastSpokenTextSnapshotRef = useRef<string>('');

  // Resume Topics (8 Cards from Photo 4)
  const [resumeTopics, setResumeTopics] = useState<ResumeTopicItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Candidate Notes Notepad (Photo 4 Middle Area)
  const [notesContent, setNotesContent] = useState<string>(
    `- High-Level Microservices Architecture\n- Event-driven communication & Redis Caching\n- ACID guarantees & MongoDB transactions\n- Latency trade-offs & zero-downtime deployment`
  );
  const [activeNotePage, setActiveNotePage] = useState<string>('talking_points');

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
        setMicVolumeLevel(Math.min(100, Math.round((avg / 128) * 100)));

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
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      isListeningMicRef.current = true;
      setIsListeningMic(true);
      startAudioVisualizer();
    } catch {}
  }, []);

  const stopMicListening = useCallback(() => {
    clearSilenceTimer();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    isListeningMicRef.current = false;
    setIsListeningMic(false);
    stopAudioVisualizer();
  }, [clearSilenceTimer]);

  // 5. High-Quality TTS Speech for Emily Zhou
  const speakInterviewerSpeech = useCallback((text: string, onEndCallback?: () => void) => {
    if (!('speechSynthesis' in window)) {
      if (onEndCallback) onEndCallback();
      return;
    }

    window.speechSynthesis.cancel();
    stopMicListening();
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

    utterance.onend = () => {
      setConversationState('listening');
      startMicListening();
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = () => {
      setConversationState('listening');
      startMicListening();
      if (onEndCallback) onEndCallback();
    };

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

    // Combine finalized spoken answer with any in-flight interim speech so sentences are never cut off in half
    const combinedSpoken = (latestSpokenAnswerRef.current + ' ' + (latestInterimRef.current || '')).trim();
    const spoken = combinedSpoken;
    if (!spoken || spoken.length < 2) return;

    if (!session || !id) return;
    const currentQ = session.questions[currentQuestionIndex];
    if (!currentQ) return;

    // A. CLARIFICATION & REPEAT INTENT DETECTION (e.g., "wait once again", "repeat please", "could you repeat")
    const repeatRegex = /\b(wait\s*once\s*again|once\s*again|repeat|repeat\s*the\s*question|say\s*(that\s*)?again|speak\s*again|pardon|didn'?t\s*hear|didn'?t\s*catch|what\s*did\s*you\s*say|could\s*you\s*repeat|can\s*you\s*repeat|say\s*it\s*again)\b/i;
    if (repeatRegex.test(spoken)) {
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

    // B. PAUSE / THINKING INTENT DETECTION (e.g., "wait a minute", "give me a moment", "let me think")
    const pauseRegex = /\b(wait\s*(a\s*(minute|moment|second|bit)|one\s*(second|moment|minute))?|hold\s*on|give\s*me\s*a\s*(moment|minute|second)|let\s*me\s*think|just\s*a\s*(moment|minute|second)|take\s*a\s*minute)\b/i;
    if (pauseRegex.test(spoken)) {
      setUserSpokenAnswer('');
      setInterimTranscript('');
      latestSpokenAnswerRef.current = '';
      latestInterimRef.current = '';
      lastSpokenTextSnapshotRef.current = '';
      clearSilenceTimer();

      const candidateFirstName = candidateName ? candidateName.split(' ')[0] : 'Mohammed';
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

    // C. MINIMUM MEANINGFUL CONTENT GUARD (Ignore accidental 1-2 words like "ok", "yes", "uh", "hmm")
    const words = spoken.split(/\s+/).filter((w) => w.length > 1);
    if (words.length < 3) {
      return;
    }

    isSubmittingAnswerRef.current = true;
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
          session.questions[nextIdx] = result.nextQuestion;
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
          `Thank you ${candidateName}. That gives me a thorough understanding of your technical background and projects. I am preparing your performance evaluation report now.`;
        speakInterviewerSpeech(closing, () => {
          handleEndSession();
        });
      }
    } catch (err) {
      console.error('Error in conversation step:', err);
      startMicListening();
    } finally {
      isSubmittingAnswerRef.current = false;
    }
  }, [
    session,
    id,
    user,
    currentQuestionIndex,
    clearSilenceTimer,
    stopMicListening,
    startMicListening,
    speakInterviewerSpeech,
  ]);

  // 7. Initialize Speech Recognition with Natural Turn-Taking
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    // Set speech recognition language with en-IN support for accurate Indian accent recognition
    const userLocale = navigator.language || 'en-IN';
    recognition.lang = userLocale.toLowerCase().includes('in') ? 'en-IN' : 'en-US';

    recognition.onresult = (event: any) => {
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
        setUserSpokenAnswer((prev) => {
          const updated = prev ? `${prev} ${final.trim()}` : final.trim();
          latestSpokenAnswerRef.current = updated;
          return updated;
        });
      }
      latestInterimRef.current = interim;
      setInterimTranscript(interim);

      const currentFullText = (latestSpokenAnswerRef.current + ' ' + interim).trim();
      const wordCount = currentFullText.split(/\s+/).filter(Boolean).length;

      // Smart silence detection: only reset and re-arm timer when NEW speech content arrives
      if (currentFullText !== lastSpokenTextSnapshotRef.current) {
        lastSpokenTextSnapshotRef.current = currentFullText;
        clearSilenceTimer();

        if (wordCount >= 2) {
          setPauseCountdown(5);
          pauseIntervalRef.current = setInterval(() => {
            setPauseCountdown((prev) => {
              if (prev === null || prev <= 1) {
                if (pauseIntervalRef.current) clearInterval(pauseIntervalRef.current);
                return null;
              }
              return prev - 1;
            });
          }, 1000);

          silenceTimerRef.current = setTimeout(() => {
            handleAutoProcessCandidateAnswer();
          }, 5500); // 5.5s generous natural silence
        }
      }
    };

    recognition.onspeechend = () => {
      // In professional interviews, speech end indicates natural pause or clause transition;
      // Do NOT abruptly cut the candidate off after 1.2s! The 5.5s silenceTimerRef comfortably manages natural turn-taking.
    };

    recognition.onerror = (e: any) => {
      console.warn('Speech recognition notice:', e?.error);
    };

    recognition.onend = () => {
      if (isListeningMicRef.current) {
        setTimeout(() => {
          if (isListeningMicRef.current && recognitionRef.current) {
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
  }, [clearSilenceTimer, handleAutoProcessCandidateAnswer]);

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

  // 9. Load Session & Start Call Immediately
  useEffect(() => {
    if (!id) return;

    const loadSession = async () => {
      setIsLoading(true);
      try {
        const data = await getMockInterview(id);
        setSession(data);

        // Initialize 8 Resume Topics from Photo 4
        if (data.resumeTopics && data.resumeTopics.length > 0) {
          setResumeTopics(data.resumeTopics);
        } else {
          setResumeTopics([
            { id: 't1', title: `${candidateName}`, category: 'Profile', description: 'Computer Science Engineering | Web Development 9482364185 | College Email LinkedIn | GitHub', status: 'discussing' },
            { id: 't2', title: 'Undergraduate Engineering Profile', category: 'PROFILE', description: 'Computer Science Engineering student interested in software development and problem-solving. Familiar with HTML, CSS, React.js, Node.js, and Express.js, with basic knowledge of Java and Python. Developed academic web projects and used AI-assisted tools for coding support, debugging, and learning.', status: 'not_yet' },
            { id: 't3', title: 'Core Project Architecture & Design', category: 'PROJECT', description: 'Cloud Microservices Platform with Node.js, React, and MongoDB. High-scale REST APIs, ACID guarantees, and caching.', status: 'not_yet' },
            { id: 't4', title: 'Concurrency, Data Consistency & Scale', category: 'PROJECT', description: 'Handling distributed locking, ACID transaction guarantees, Redis cache invalidation, and race condition prevention.', status: 'not_yet' },
            { id: 't5', title: 'Technical Stack & Language Internals', category: 'STACK', description: 'JavaScript event loop, V8 runtime, React reconciliation engine, and database indexing strategies.', status: 'not_yet' },
            { id: 't6', title: 'Data Structures & Algorithmic Trade-offs', category: 'ALGORITHMS', description: 'Time and space complexity, hash table lookups, tree/graph traversals, and dynamic programming.', status: 'not_yet' },
            { id: 't7', title: 'STAR Behavioral Scenarios', category: 'BEHAVIORAL', description: 'Amazon Leadership Principles, technical team conflict resolution, and delivering under tight deadlines.', status: 'not_yet' },
            { id: 't8', title: 'Production Reliability & System Design', category: 'SYSTEM DESIGN', description: 'High-availability microservices, rate limiting, circuit breaker patterns, and zero-downtime deployment.', status: 'not_yet' },
          ]);
        }

        // Initialize First Interview Greeting from Emily Zhou
        const firstQ = data.questions?.[0];
        const greeting = `Hi ${candidateName}, welcome to your Amazon SDE-1 interview. I'm Emily Zhou. I've reviewed your resume and project background. Let's start with a brief overview: tell me about yourself and your journey in software development.`;

        setTranscriptMessages([
          {
            sender: 'interviewer',
            text: greeting,
            time: 'Just now',
          },
        ]);

        speakInterviewerSpeech(greeting);
      } catch (err: any) {
        console.error('Failed to load session:', err);
        setErrorMessage('Could not load interview session details.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [id, user, speakInterviewerSpeech]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07070d] text-white flex flex-col items-center justify-center space-y-4">
        <span className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wide text-slate-300">
          Connecting to Emily Zhou · Amazon SDE-1 Interview Call...
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
              AI Interview
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
          MAIN INTERVIEW WORKSPACE (Matching Photo 4 exact 3-column layout)
          ========================================================================= */}
      <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden relative">

        {/* -----------------------------------------------------------------------
            LEFT COLUMN (Width ~30%): "Your resume - 0 of 8 discussed" (Photo 4)
            ----------------------------------------------------------------------- */}
        <aside
          className={`col-span-12 md:col-span-4 lg:col-span-3 border-r border-slate-800/80 bg-[#0e0f17] flex flex-col h-full overflow-hidden transition-all duration-300 ${
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
            MIDDLE COLUMN (Width ~45%): "Notes / Talking points" Editor (Photo 4)
            ----------------------------------------------------------------------- */}
        <main className="col-span-12 md:col-span-8 lg:col-span-6 bg-[#0c0d14] flex flex-col h-full border-r border-slate-800/80 overflow-hidden">
          {/* Notes Top Tab Bar */}
          <div className="h-11 px-4 border-b border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-300 bg-[#0e0f17]">
            <div className="flex items-center gap-3">
              {!isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white mr-1"
                  title="Expand resume"
                >
                  <PanelLeftOpen className="w-4 h-4" />
                </button>
              )}
              <span className="text-white font-bold">Notes</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">Pages</span>
              <button className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1">
                <Plus className="w-3 h-3" />
                <span>New page</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">11:43 PM Talking points</span>
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
                title="Ask Emily to repeat this question out loud"
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

          {/* Talking Points Card Header */}
          <div className="p-4 sm:p-6 space-y-3 shrink-0">
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

            {/* Tags row: "Resume", "Started 11:43 PM", "+ add tag", eye icon (Photo 4) */}
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-600/30 text-indigo-300 font-bold border border-indigo-500/30">
                Resume
              </span>
              <span className="text-slate-400">Started 11:43 PM</span>
              <button className="text-slate-500 hover:text-slate-300 font-medium">+ add tag</button>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>Your interviewer can read these notes.</span>
              </span>
            </div>

            {/* Rich Text Toolbar (H2, B, I, lists, code, link, table - Photo 4) */}
            <div className="flex items-center gap-1 py-1.5 px-2 rounded-xl bg-slate-900/70 border border-slate-800 text-slate-400 text-xs">
              <button className="p-1 rounded hover:bg-slate-800 hover:text-white" title="Heading">
                <Heading2 className="w-3.5 h-3.5" />
              </button>
              <button className="p-1 rounded hover:bg-slate-800 hover:text-white" title="Bold">
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button className="p-1 rounded hover:bg-slate-800 hover:text-white" title="Italic">
                <Italic className="w-3.5 h-3.5" />
              </button>
              <div className="h-3 w-px bg-slate-800 mx-1" />
              <button className="p-1 rounded hover:bg-slate-800 hover:text-white" title="List">
                <List className="w-3.5 h-3.5" />
              </button>
              <button className="p-1 rounded hover:bg-slate-800 hover:text-white" title="Numbered list">
                <ListOrdered className="w-3.5 h-3.5" />
              </button>
              <button className="p-1 rounded hover:bg-slate-800 hover:text-white" title="Code snippet">
                <Code2 className="w-3.5 h-3.5" />
              </button>
              <button className="p-1 rounded hover:bg-slate-800 hover:text-white" title="Insert link">
                <Link2 className="w-3.5 h-3.5" />
              </button>
              <button className="p-1 rounded hover:bg-slate-800 hover:text-white" title="Insert table">
                <TableIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Editable Notepad Area */}
          <div className="flex-1 px-4 sm:px-6 pb-24 overflow-hidden flex flex-col">
            <textarea
              value={notesContent}
              onChange={(e) => {
                setNotesContent(e.target.value);
                if (id) saveCandidateNotes(id, e.target.value);
              }}
              placeholder="- High-Level Architecture & Component Boundaries\n- Data Consistency & Concurrency (ACID / Locks / Redis)\n- System Scalability & Latency Trade-offs"
              className="w-full flex-1 bg-transparent border-0 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none resize-none leading-relaxed overflow-y-auto"
            />
          </div>
        </main>

        {/* -----------------------------------------------------------------------
            RIGHT COLUMN (Width ~25%): Emily Zhou Video Tile + Candidate Tile (Photo 4)
            ----------------------------------------------------------------------- */}
        <section className="col-span-12 lg:col-span-3 bg-[#0e0f17] flex flex-col p-4 gap-4 h-full overflow-y-auto pb-24">
          
          {/* 1. Emily Zhou Animated AI Video Avatar (Real-Time Lip Visemes, Eye-Blinks, Listening Nods) */}
          <EmilyAIVideoAvatar
            conversationState={conversationState}
            avatarUrl={
              session?.interviewerAvatar ||
              'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80'
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

          {/* Current Spoken Transcript Streaming Preview with Instant "Done Speaking" Action */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Live Voice Feed
              </span>
              {pauseCountdown !== null && pauseCountdown > 0 && (
                <span className="text-[10px] font-bold text-amber-400 animate-pulse">
                  Auto-sending in {pauseCountdown}s...
                </span>
              )}
            </div>

            <p className="text-slate-300 leading-relaxed font-sans min-h-[35px]">
              {conversationState === 'evaluating' ? (
                <span className="text-indigo-400 italic flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  Emily is analyzing your response & preparing the next question...
                </span>
              ) : userSpokenAnswer || interimTranscript ? (
                <span>
                  {userSpokenAnswer}{' '}
                  <span className="text-emerald-400 italic">{interimTranscript}</span>
                </span>
              ) : conversationState === 'interviewer_speaking' ? (
                <span className="text-slate-400 italic">Emily is speaking...</span>
              ) : (
                <span className="text-emerald-400/80 italic animate-pulse">
                  🎙️ Speak your answer naturally...
                </span>
              )}
            </p>

            {/* Instant "Done Speaking" Action Button */}
            {(userSpokenAnswer.trim() || interimTranscript.trim()) && conversationState !== 'evaluating' && (
              <button
                onClick={() => handleAutoProcessCandidateAnswer()}
                className="w-full mt-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-900/30 flex items-center justify-center gap-1.5 transition-all transform active:scale-95"
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
                    <span>{msg.sender === 'interviewer' ? 'Emily Zhou' : `You (${candidateName})`}</span>
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
