import React, { useState, useRef, useEffect } from 'react';
import { Radio, RotateCcw, Sparkles, Video, Volume2, UserCheck } from 'lucide-react';

interface EmilyAIVideoAvatarProps {
  conversationState: 'connecting' | 'interviewer_speaking' | 'listening' | 'evaluating';
  avatarUrl?: string;
  name?: string;
  role?: string;
  onRepeatQuestion?: () => void;
}

// High-Definition royalty-free video loops for realistic digital human interaction
const SPEAKING_VIDEO_URL = 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-talking-on-video-call-with-laptop-42998-large.mp4';
const LISTENING_VIDEO_URL = 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-working-on-a-laptop-in-an-office-42997-large.mp4';

// Default authentic Asian female engineer with glasses matching Photo 4
const DEFAULT_AVATAR_URL = 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=800&auto=format&fit=crop&q=80';

export const EmilyAIVideoAvatar: React.FC<EmilyAIVideoAvatarProps> = ({
  conversationState,
  avatarUrl = DEFAULT_AVATAR_URL,
  name = 'Emily Zhou',
  role = 'Senior Software Engineer (Amazon)',
  onRepeatQuestion,
}) => {
  const [avatarMode, setAvatarMode] = useState<'video' | 'portrait'>('video');
  const [videoHasError, setVideoHasError] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Pick video source based on conversational state
  const currentVideoSrc = conversationState === 'interviewer_speaking' 
    ? SPEAKING_VIDEO_URL 
    : LISTENING_VIDEO_URL;

  // Sync video playback
  useEffect(() => {
    if (avatarMode === 'video' && videoRef.current && !videoHasError) {
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback: muted video
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => setVideoHasError(true));
        }
      });
    }
  }, [conversationState, avatarMode, videoHasError, currentVideoSrc]);

  return (
    <div className="rounded-2xl border border-slate-700/80 bg-[#12131f] overflow-hidden shadow-2xl shrink-0 ring-1 ring-slate-800 flex flex-col transition-all">
      {/* Aspect Video Call Frame */}
      <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">

        {/* 1. Real Video Avatar Stream Mode */}
        {avatarMode === 'video' && !videoHasError ? (
          <video
            ref={videoRef}
            key={currentVideoSrc}
            src={currentVideoSrc}
            autoPlay
            loop
            muted
            playsInline
            onLoadedData={() => setIsVideoLoaded(true)}
            onError={() => setVideoHasError(true)}
            className={`w-full h-full object-cover select-none transition-opacity duration-500 ${
              isVideoLoaded ? 'opacity-100' : 'opacity-80'
            } ${conversationState === 'evaluating' ? 'filter blur-[1.5px] brightness-75' : ''}`}
          />
        ) : null}

        {/* 2. Studio Portrait Mode (Active when Video is off or loading, NO fake drawn lips/eyes) */}
        {(avatarMode === 'portrait' || videoHasError || !isVideoLoaded) && (
          <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-gradient-to-b from-slate-900 to-[#0e0f1a]">
            <img
              src={avatarUrl || DEFAULT_AVATAR_URL}
              alt={name}
              className={`w-full h-full object-cover select-none transition-all duration-700 ${
                conversationState === 'interviewer_speaking'
                  ? 'scale-105 filter brightness-105'
                  : conversationState === 'evaluating'
                  ? 'filter blur-[2px] brightness-75 scale-100'
                  : 'scale-100 filter brightness-95'
              }`}
            />

            {/* Subtle Studio Lighting Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

            {/* Audio-Reactive Speaking Aura Glow (Pulsing emerald ring when Emily talks) */}
            {conversationState === 'interviewer_speaking' && (
              <div className="absolute inset-0 border-4 border-emerald-400/80 pointer-events-none shadow-[inset_0_0_35px_rgba(52,211,153,0.4)] animate-pulse" />
            )}
          </div>
        )}

        {/* Top Video Call Bar: [● 1080p AI VIDEO STREAM] & Mode Switcher */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-auto z-20">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-slate-700/60 shadow-lg">
            <span
              className={`w-2 h-2 rounded-full ${
                conversationState === 'interviewer_speaking'
                  ? 'bg-emerald-400 animate-ping'
                  : 'bg-emerald-400 animate-pulse'
              } shadow-[0_0_8px_#34d399]`}
            />
            <span className="text-[10px] font-bold text-white tracking-wider flex items-center gap-1">
              <span>{avatarMode === 'video' && !videoHasError ? 'LIVE AI VIDEO' : 'STUDIO AVATAR'}</span>
              <Sparkles className="w-2.5 h-2.5 text-amber-300" />
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Toggle Mode: Video vs Portrait */}
            <button
              onClick={() => {
                setVideoHasError(false);
                setAvatarMode((prev) => (prev === 'video' ? 'portrait' : 'video'));
              }}
              className="px-2 py-0.5 rounded-full bg-black/75 hover:bg-black/90 backdrop-blur-md border border-slate-700 text-[9px] font-semibold text-slate-300 flex items-center gap-1 transition-all"
              title="Switch between video stream and studio portrait"
            >
              <Video className="w-2.5 h-2.5 text-indigo-400" />
              <span>{avatarMode === 'video' && !videoHasError ? 'HD Video' : 'Portrait'}</span>
            </button>

            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-slate-800 text-[9px] font-mono text-slate-300">
              <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
              <span>60 FPS</span>
            </div>
          </div>
        </div>

        {/* 3. Evaluating / Thinking Overlay (Matching Photo: Yellow dot "Thinking" + Green Spinner "Analyzing response...") */}
        {conversationState === 'evaluating' && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-30 animate-fade-in">
            {/* Top Right "Thinking" Badge matching Screenshot */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#182a20] border border-emerald-500/40 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_#fbbf24]" />
              <span className="text-[10px] font-bold text-emerald-300">Thinking</span>
            </div>

            {/* Center Spinning Ring & Analyzing Text */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
              <p className="text-xs font-bold text-white tracking-wide drop-shadow-md">
                Analyzing response...
              </p>
            </div>
          </div>
        )}

        {/* 4. Speaking Live Audio Bar Overlay */}
        {conversationState === 'interviewer_speaking' && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-auto z-20">
            <div className="flex items-end gap-1 px-3 py-1.5 rounded-full bg-black/90 backdrop-blur-md border border-emerald-500/40 shadow-lg">
              <span className="w-1 bg-emerald-400 rounded-full animate-pulse h-3" />
              <span className="w-1 bg-emerald-300 rounded-full animate-pulse h-5" />
              <span className="w-1 bg-emerald-400 rounded-full animate-pulse h-3.5" />
              <span className="w-1 bg-emerald-300 rounded-full animate-pulse h-4.5" />
              <span className="w-1 bg-emerald-400 rounded-full animate-pulse h-2.5" />
              <span className="text-[10px] font-bold text-emerald-300 ml-1.5 uppercase tracking-wider">
                Speaking Live
              </span>
            </div>

            {onRepeatQuestion && (
              <button
                onClick={onRepeatQuestion}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                title="Replay Emily's question"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Replay</span>
              </button>
            )}
          </div>
        )}

        {/* 5. Attentive Listening State when Candidate Speaks */}
        {conversationState === 'listening' && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-auto z-20">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/85 backdrop-blur-md border border-slate-700/80 text-[10px] font-medium text-emerald-300 shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
              <span>Nodding · Listening to you</span>
            </div>

            {onRepeatQuestion && (
              <button
                onClick={onRepeatQuestion}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold border border-slate-700 transition-colors cursor-pointer"
                title="Repeat Question"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Repeat</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Video Call Nameplate & Status Pill */}
      <div className="p-3 bg-[#11121d] flex items-center justify-between border-t border-slate-800">
        <div>
          <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
            <span>{name}</span>
            <span className="text-[10px] font-normal text-slate-400">· Senior Interviewer</span>
          </h3>
          <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{role}</p>
        </div>

        <span
          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
            conversationState === 'interviewer_speaking'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse'
              : conversationState === 'listening'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
          }`}
        >
          {conversationState === 'interviewer_speaking'
            ? '● Speaking'
            : conversationState === 'listening'
            ? '● Listening'
            : '● Analyzing'}
        </span>
      </div>
    </div>
  );
};
