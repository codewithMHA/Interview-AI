import React, { useState, useEffect } from 'react';
import { Bot, Volume2, Sparkles, Video, UserCheck, Eye } from 'lucide-react';

interface AnimatedInterviewerAvatarProps {
  interviewerName: string;
  interviewerRole: string;
  company: string;
  avatarUrl?: string;
  isAiSpeaking: boolean;
  isCandidateSpeaking: boolean;
  isAnalyzing: boolean;
  currentCaption?: string;
  onRepeatVoice?: () => void;
}

export const AnimatedInterviewerAvatar: React.FC<AnimatedInterviewerAvatarProps> = ({
  interviewerName,
  interviewerRole,
  company,
  avatarUrl,
  isAiSpeaking,
  isCandidateSpeaking,
  isAnalyzing,
  currentCaption,
  onRepeatVoice,
}) => {
  // Visual Mode: 'avatar' (interactive animated vector/canvas layer) or 'studio' (HD video stream)
  const [visualMode, setVisualMode] = useState<'avatar' | 'studio'>('avatar');
  const [mouthShape, setMouthShape] = useState<number>(0);

  // Dynamic Lip-Sync Viseme Generator while AI is speaking
  useEffect(() => {
    if (!isAiSpeaking) {
      setMouthShape(0);
      return;
    }

    const interval = setInterval(() => {
      // Random viseme mouth shapes (0 = resting closed, 1 = slightly open, 2 = wide vowel, 3 = 'O' shape)
      setMouthShape((prev) => {
        const next = Math.floor(Math.random() * 4);
        return next === prev ? (next + 1) % 4 : next;
      });
    }, 110);

    return () => clearInterval(interval);
  }, [isAiSpeaking]);

  const defaultPhoto =
    avatarUrl ||
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="relative w-full h-full min-h-[340px] sm:min-h-[420px] rounded-3xl overflow-hidden bg-gradient-to-b from-[#131322] to-[#0a0a14] border border-slate-800 shadow-2xl flex flex-col justify-between">
      
      {/* 1. TOP STATUS OVERLAY & CONTROLS */}
      <div className="p-4 flex items-center justify-between z-20 bg-gradient-to-b from-black/70 via-black/30 to-transparent">
        <div className="flex items-center gap-2">
          {/* Live Status Pill */}
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 backdrop-blur-md transition-all shadow-md ${
              isAiSpeaking
                ? 'bg-purple-950/80 text-purple-200 border border-purple-500/50'
                : isCandidateSpeaking
                ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-500/50'
                : isAnalyzing
                ? 'bg-indigo-950/80 text-indigo-200 border border-indigo-500/50'
                : 'bg-slate-900/80 text-slate-300 border border-slate-700/60'
            }`}
          >
            {isAiSpeaking ? (
              <>
                <div className="flex items-center gap-0.5 h-3">
                  <span className="w-1 h-3 bg-purple-400 rounded-full animate-bounce" />
                  <span className="w-1 h-4 bg-purple-300 rounded-full animate-bounce delay-75" />
                  <span className="w-1 h-2 bg-purple-400 rounded-full animate-bounce delay-150" />
                  <span className="w-1 h-3.5 bg-purple-300 rounded-full animate-bounce delay-100" />
                </div>
                <span>Speaking</span>
              </>
            ) : isCandidateSpeaking ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Nodding & Listening</span>
              </>
            ) : isAnalyzing ? (
              <>
                <span className="w-2.5 h-2.5 border-2 border-indigo-400/40 border-t-indigo-400 rounded-full animate-spin" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>Ready</span>
              </>
            )}
          </div>
        </div>

        {/* View Switcher: Interactive Avatar vs Studio Video */}
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-slate-700/60 text-[11px] font-semibold text-slate-300">
          <button
            onClick={() => setVisualMode('avatar')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              visualMode === 'avatar'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Animated AI
          </button>
          <button
            onClick={() => setVisualMode('studio')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              visualMode === 'studio'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Studio Video
          </button>
        </div>
      </div>

      {/* 2. MAIN AVATAR / VIDEO DISPLAY STAGE */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        
        {/* Ambient Aura Lighting */}
        <div
          className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
            isAiSpeaking
              ? 'opacity-70 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent'
              : isCandidateSpeaking
              ? 'opacity-60 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-600/15 via-transparent to-transparent'
              : 'opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-600/10 via-transparent to-transparent'
          }`}
        />

        {visualMode === 'studio' ? (
          /* STUDIO VIDEO MODE: High-quality looped video of professional interviewer */
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              autoPlay
              loop
              muted
              playsInline
              className={`w-full h-full object-cover transition-transform duration-500 ${
                isCandidateSpeaking ? 'scale-105' : 'scale-100'
              }`}
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
              poster={defaultPhoto}
            />
            {/* Soft dark vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] via-transparent to-transparent" />
          </div>
        ) : (
          /* INTERACTIVE ANIMATED AVATAR: Photo base + Responsive Mouth Visemes + Blinking + Nodding */
          <div
            className={`relative flex flex-col items-center justify-center transition-all duration-300 ${
              isCandidateSpeaking ? 'animate-interviewer-nod' : isAiSpeaking ? 'scale-105' : 'animate-avatar-breathe'
            }`}
          >
            {/* Outer Soundwave Glow Ring when Interviewer Speaks */}
            {isAiSpeaking && (
              <>
                <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-purple-500/30 via-indigo-500/30 to-pink-500/30 blur-xl animate-pulse" />
                <div className="absolute -inset-2 rounded-full border-2 border-purple-500/50 animate-ping opacity-30" />
              </>
            )}

            {/* Avatar Base Head Container */}
            <div className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-full overflow-hidden border-4 border-slate-700/80 shadow-2xl bg-slate-900 ring-4 ring-purple-500/20">
              <img
                src={defaultPhoto}
                alt={interviewerName}
                className="w-full h-full object-cover object-top select-none"
              />

              {/* EYE BLINK OVERLAY (Natural human eye blink every 4s) */}
              <div className="absolute top-[42%] left-[34%] w-[33%] h-[12px] flex justify-between pointer-events-none animate-avatar-blink">
                <div className="w-[18px] h-[3px] bg-slate-900/60 rounded-full backdrop-blur-[1px]" />
                <div className="w-[18px] h-[3px] bg-slate-900/60 rounded-full backdrop-blur-[1px]" />
              </div>

              {/* DYNAMIC LIP-SYNC MOUTH OVERLAY (Moves & opens dynamically when AI speaks!) */}
              {isAiSpeaking ? (
                <div className="absolute top-[70%] left-[50%] -translate-x-1/2 flex items-center justify-center pointer-events-none">
                  {mouthShape === 0 && (
                    /* Closed / resting smile */
                    <div className="w-8 h-[3px] bg-rose-950 rounded-full border-t border-rose-800/80 transition-all duration-75" />
                  )}
                  {mouthShape === 1 && (
                    /* Slightly open */
                    <div className="w-9 h-2.5 bg-gradient-to-b from-stone-900 to-rose-950 rounded-full border border-rose-800/60 shadow-inner transition-all duration-75 flex items-center justify-center">
                      <div className="w-6 h-1 bg-white/40 rounded-full opacity-80" />
                    </div>
                  )}
                  {mouthShape === 2 && (
                    /* Wide open vowel (A/E) */
                    <div className="w-10 h-4 bg-gradient-to-b from-stone-900 via-rose-950 to-stone-950 rounded-[40%] border border-rose-800 shadow-inner transition-all duration-75 flex items-center justify-center">
                      <div className="w-7 h-1.5 bg-white/50 rounded-full" />
                    </div>
                  )}
                  {mouthShape === 3 && (
                    /* Round 'O' viseme */
                    <div className="w-6 h-4 bg-gradient-to-b from-stone-950 to-rose-950 rounded-full border border-rose-800 shadow-inner transition-all duration-75" />
                  )}
                </div>
              ) : (
                /* Natural Resting Smile */
                <div className="absolute top-[71%] left-[50%] -translate-x-1/2 w-8 h-[3px] bg-rose-900/70 rounded-full pointer-events-none" />
              )}
            </div>

            {/* Speaking Voice Aura Waveforms underneath avatar */}
            {isAiSpeaking && (
              <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-500/30">
                <span className="w-1 h-2 bg-purple-400 rounded-full animate-bounce" />
                <span className="w-1 h-4 bg-purple-300 rounded-full animate-bounce delay-100" />
                <span className="w-1 h-5 bg-purple-200 rounded-full animate-bounce delay-75" />
                <span className="w-1 h-3 bg-purple-300 rounded-full animate-bounce delay-150" />
                <span className="w-1 h-1.5 bg-purple-400 rounded-full animate-bounce" />
                <span className="text-[10px] text-purple-200 font-mono font-bold ml-1">AUDIO STREAM ACTIVE</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. BOTTOM INFO & LIVE SUBTITLE CAPTION BANNER */}
      <div className="p-4 z-20 bg-gradient-to-t from-black/90 via-black/60 to-transparent space-y-2">
        {/* Live Subtitle Transcript Banner */}
        {currentCaption && (
          <div className="p-3 rounded-2xl bg-black/75 backdrop-blur-md border border-slate-800/80 text-xs text-slate-100 leading-relaxed shadow-lg">
            <span className="text-[10px] uppercase font-bold text-indigo-400 mr-2 block sm:inline">
              {interviewerName}:
            </span>
            <span className="font-sans italic">{currentCaption}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-wide">{interviewerName}</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                {company}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">{interviewerRole}</p>
          </div>

          {onRepeatVoice && (
            <button
              onClick={onRepeatVoice}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all flex items-center gap-1.5 text-xs font-semibold"
              title="Hear interviewer question again"
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Repeat Voice</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

