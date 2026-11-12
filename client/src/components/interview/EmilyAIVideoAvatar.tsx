import React, { useEffect, useState } from 'react';
import { Mic, RotateCcw, Sparkles, Volume2 } from 'lucide-react';

interface EmilyAIVideoAvatarProps {
  conversationState: 'connecting' | 'interviewer_speaking' | 'listening' | 'evaluating';
  avatarUrl?: string;
  name?: string;
  role?: string;
  onRepeatQuestion?: () => void;
}

// High-resolution centered studio portrait default
const DEFAULT_AVATAR_URL =
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=600&auto=format&fit=crop&crop=faces,center&q=85';

// Normalize Unsplash portrait URLs so faces are always centered in square crops
const normalizePortraitUrl = (rawUrl?: string): string => {
  const url = (rawUrl || '').trim();
  if (!url) return DEFAULT_AVATAR_URL;
  if (url.includes('images.unsplash.com/')) {
    const base = url.split('?')[0];
    return `${base}?w=600&h=600&auto=format&fit=crop&crop=faces,center&q=85`;
  }
  return url;
};

export const EmilyAIVideoAvatar: React.FC<EmilyAIVideoAvatarProps> = ({
  conversationState,
  avatarUrl,
  name = 'Emily Zhou',
  role = 'Senior Software Engineer (Amazon)',
  onRepeatQuestion,
}) => {
  const [imgSrc, setImgSrc] = useState<string>(() => normalizePortraitUrl(avatarUrl));
  const [hasImageError, setHasImageError] = useState<boolean>(false);

  useEffect(() => {
    setHasImageError(false);
    setImgSrc(normalizePortraitUrl(avatarUrl));
  }, [avatarUrl]);

  const isSpeaking = conversationState === 'interviewer_speaking';
  const isListening = conversationState === 'listening';
  const isEvaluating = conversationState === 'evaluating';
  const isConnecting = conversationState === 'connecting';

  const statusLabel = isSpeaking
    ? 'Speaking'
    : isListening
    ? 'Listening'
    : isEvaluating
    ? 'Thinking'
    : 'Connecting';

  const statusBadgeClass = isSpeaking
    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40'
    : isListening
    ? 'bg-indigo-500/15 text-indigo-300 border-indigo-400/40'
    : isEvaluating
    ? 'bg-amber-500/15 text-amber-300 border-amber-400/40'
    : 'bg-slate-800 text-slate-300 border-slate-700';

  const statusDotClass = isSpeaking
    ? 'bg-emerald-400 animate-pulse'
    : isListening
    ? 'bg-indigo-400 animate-pulse'
    : isEvaluating
    ? 'bg-amber-400 animate-pulse'
    : 'bg-slate-400';

  const frameGradientClass = isSpeaking
    ? 'bg-gradient-to-tr from-emerald-400 via-teal-300 to-cyan-400 shadow-[0_0_28px_rgba(52,211,153,0.65)]'
    : isListening
    ? 'bg-gradient-to-tr from-indigo-500/80 via-brand-400/70 to-indigo-400/80 shadow-[0_0_16px_rgba(129,140,248,0.28)]'
    : isEvaluating
    ? 'bg-gradient-to-tr from-amber-400/80 via-orange-400/70 to-amber-300/80 shadow-[0_0_18px_rgba(251,191,36,0.28)]'
    : 'bg-slate-700/80';

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#12131f] overflow-hidden shadow-xl shrink-0">
      {/* Studio Portrait Stage */}
      <div className="relative min-h-[224px] w-full flex flex-col items-center justify-center px-4 pt-11 pb-4 overflow-hidden bg-[radial-gradient(circle_at_50%_38%,rgba(79,70,229,0.24),rgba(17,19,31,0.96)_68%,#0b0c14_100%)]">
        {/* Subtle studio top-left badge */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/70 backdrop-blur-md text-[10px] font-semibold text-slate-200">
          <span className={`w-1.5 h-1.5 rounded-full ${statusDotClass}`} />
          <span>AI Interviewer</span>
        </div>

        {/* Top-right Repeat Question Button */}
        {onRepeatQuestion && (
          <button
            type="button"
            onClick={onRepeatQuestion}
            title="Repeat current question"
            className="absolute top-3 right-3 z-20 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 hover:border-slate-500 backdrop-blur-md text-[11px] font-medium text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Repeat</span>
          </button>
        )}

        {/* Centered Static Portrait with Speaking Light Ring */}
        <div className="relative flex items-center justify-center my-1">
          {/* Soft ambient halo behind frame */}
          <div
            className={`absolute -inset-4 rounded-full blur-xl transition-all duration-500 pointer-events-none ${
              isSpeaking
                ? 'bg-emerald-400/30 opacity-100 scale-105'
                : isListening
                ? 'bg-indigo-500/15 opacity-100 scale-100'
                : isEvaluating
                ? 'bg-amber-400/15 opacity-100 scale-100'
                : 'opacity-0 scale-95'
            }`}
          />

          {/* Outer luminous pulse rings while speaking */}
          {isSpeaking && (
            <>
              <span className="absolute -inset-2.5 rounded-full border-2 border-emerald-400/55 animate-pulse pointer-events-none" />
              <span
                className="absolute -inset-4 rounded-full border border-cyan-300/35 animate-ping pointer-events-none"
                style={{ animationDuration: '2.2s' }}
              />
            </>
          )}

          {/* Primary Light Ring & Crisp Centered Static Portrait */}
          <div
            className={`relative mx-auto w-32 h-32 sm:w-36 sm:h-36 rounded-full p-[3px] transition-all duration-300 ${frameGradientClass}`}
          >
            <div className="w-full h-full rounded-full p-[2px] bg-[#0e101a] overflow-hidden flex items-center justify-center">
              {hasImageError ? (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white font-bold text-3xl select-none">
                  {name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
              ) : (
                <img
                  src={imgSrc}
                  alt={name}
                  onError={() => {
                    if (imgSrc !== DEFAULT_AVATAR_URL) {
                      setImgSrc(DEFAULT_AVATAR_URL);
                    } else {
                      setHasImageError(true);
                    }
                  }}
                  draggable={false}
                  className="w-full h-full rounded-full object-cover object-center select-none"
                />
              )}
            </div>
          </div>
        </div>

        {/* Clean non-intrusive status strip under portrait when evaluating or connecting */}
        {(isEvaluating || isConnecting) && (
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/85 border border-slate-700/80 text-[11px] font-medium text-slate-200 backdrop-blur-md">
            <Sparkles className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
            <span>{isEvaluating ? 'Analyzing your response...' : 'Joining interview room...'}</span>
          </div>
        )}
      </div>

      {/* Bottom Nameplate */}
      <div className="px-4 py-2.5 bg-[#0e101a] border-t border-slate-800/90 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">{name}</p>
          <p className="text-[11px] text-slate-400 truncate">{role}</p>
        </div>

        <span
          className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${statusBadgeClass}`}
        >
          {isSpeaking ? (
            <Volume2 className="w-3 h-3" />
          ) : isListening ? (
            <Mic className="w-3 h-3" />
          ) : (
            <span className={`w-1.5 h-1.5 rounded-full ${statusDotClass}`} />
          )}
          <span>{statusLabel}</span>
        </span>
      </div>
    </div>
  );
};

export default EmilyAIVideoAvatar;
