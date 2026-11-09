import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw, Sparkles, Volume2, Radio } from 'lucide-react';

interface EmilyAIVideoAvatarProps {
  conversationState: 'connecting' | 'interviewer_speaking' | 'listening' | 'evaluating';
  avatarUrl?: string;
  name?: string;
  role?: string;
  onRepeatQuestion?: () => void;
}

// Authentic Asian female tech lead with glasses matching Photo 4
const DEFAULT_AVATAR_URL =
  'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=800&auto=format&fit=crop&q=80';

export const EmilyAIVideoAvatar: React.FC<EmilyAIVideoAvatarProps> = ({
  conversationState,
  avatarUrl = DEFAULT_AVATAR_URL,
  name = 'Emily Zhou',
  role = 'Senior Software Engineer (Amazon)',
  onRepeatQuestion,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Animation timeline state
  const stateRef = useRef({
    time: 0,
    lastBlinkTime: 0,
    blinkProgress: 0, // 0 = open, 1 = fully closed
    headNod: 0,
    headTilt: 0,
    speechCycle: 0,
    jawOffset: 0,
    isSpeaking: false,
    isListening: false,
  });

  stateRef.current.isSpeaking = conversationState === 'interviewer_speaking';
  stateRef.current.isListening = conversationState === 'listening';

  // Load avatar image into offscreen object
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = avatarUrl || DEFAULT_AVATAR_URL;
    img.onload = () => {
      imageRef.current = img;
      setIsImageLoaded(true);
    };
    img.onerror = () => {
      // Fallback to high-res tech lead portrait
      const fallbackImg = new Image();
      fallbackImg.crossOrigin = 'anonymous';
      fallbackImg.src = DEFAULT_AVATAR_URL;
      fallbackImg.onload = () => {
        imageRef.current = fallbackImg;
        setIsImageLoaded(true);
      };
    };
  }, [avatarUrl]);

  // 60 FPS Organic Conversational Animation Engine on HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = performance.now();

    const render = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const s = stateRef.current;
      s.time = elapsed;

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // 1. Natural Breathing & Conversational Micro-Motions
      const breathing = Math.sin(elapsed * 1.6) * 1.8;

      if (s.isListening) {
        // Attentive listening nods (gently nods every ~3.5s to candidate's words)
        const nodCycle = (elapsed % 3.6);
        if (nodCycle < 0.75) {
          s.headNod = Math.sin((nodCycle / 0.75) * Math.PI) * 4.5;
        } else {
          s.headNod = 0;
        }
        s.headTilt = Math.sin(elapsed * 0.7) * 0.012;
        s.jawOffset = 0;
      } else if (s.isSpeaking) {
        // Natural speech cadence (head tilts slightly and micro-nods to syllables)
        s.headNod = Math.sin(elapsed * 4.5) * 2.5 + Math.sin(elapsed * 2.2) * 1.5;
        s.headTilt = Math.sin(elapsed * 2.8) * 0.018;
        // Natural lower-face speech resonance (jaw moves smoothly with vocal cadence)
        s.jawOffset = Math.max(0, Math.sin(elapsed * 12) * 2.2 + Math.cos(elapsed * 18) * 1.2);
      } else {
        s.headNod = breathing;
        s.headTilt = 0;
        s.jawOffset = 0;
      }

      // 2. Natural Eye Blink Controller (Every ~3.8 seconds for ~140ms)
      if (now - s.lastBlinkTime > 3800) {
        s.blinkProgress = 1;
        s.lastBlinkTime = now;
      }
      if (s.blinkProgress > 0) {
        s.blinkProgress -= 0.14; // rapid close & open
        if (s.blinkProgress < 0) s.blinkProgress = 0;
      }

      // 3. Render Avatar with 3D Center Transformations
      ctx.save();
      ctx.translate(w / 2, h / 2 + s.headNod);
      ctx.rotate(s.headTilt);

      if (imageRef.current && isImageLoaded) {
        const img = imageRef.current;
        const scale = Math.max(w / img.width, h / img.height) * 1.05;
        const imgW = img.width * scale;
        const imgH = img.height * scale;

        // Render upper torso & face
        ctx.drawImage(img, -imgW / 2, -imgH / 2, imgW, imgH);

        // 4. Natural Organic Eye Blink (Natural Shadow Gradient - NO cartoon brown shapes!)
        if (s.blinkProgress > 0.08) {
          ctx.save();
          // Target eye zone smoothly
          const eyeCenterY = -h * 0.06;
          const eyeH = 14 * s.blinkProgress;

          // Left & Right eye soft natural lid shadow
          const lidGrad = ctx.createLinearGradient(0, eyeCenterY - 10, 0, eyeCenterY + eyeH);
          lidGrad.addColorStop(0, 'rgba(30, 20, 15, 0.0)');
          lidGrad.addColorStop(0.5, `rgba(45, 30, 25, ${0.75 * s.blinkProgress})`);
          lidGrad.addColorStop(1, 'rgba(30, 20, 15, 0.0)');

          ctx.fillStyle = lidGrad;
          // Left Eye natural soft shadow
          ctx.beginPath();
          ctx.ellipse(-w * 0.10, eyeCenterY, w * 0.07, eyeH, 0, 0, Math.PI * 2);
          ctx.fill();

          // Right Eye natural soft shadow
          ctx.beginPath();
          ctx.ellipse(w * 0.10, eyeCenterY, w * 0.07, eyeH, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // 5. Speech Lower-Face Cadence (Micro-warp jaw area naturally while speaking)
        if (s.isSpeaking && s.jawOffset > 0.5) {
          ctx.save();
          const mouthY = h * 0.13;
          // Subtle natural jaw shade modulation (matches speaking frequency)
          const mouthGrad = ctx.createRadialGradient(0, mouthY, 2, 0, mouthY, 28);
          mouthGrad.addColorStop(0, `rgba(40, 15, 15, ${Math.min(0.35, s.jawOffset * 0.12)})`);
          mouthGrad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');

          ctx.fillStyle = mouthGrad;
          ctx.beginPath();
          ctx.ellipse(0, mouthY + s.jawOffset * 0.5, 24, 8 + s.jawOffset * 1.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      } else {
        // Fallback gradient while photo loads
        const grad = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
        grad.addColorStop(0, '#1c1e30');
        grad.addColorStop(1, '#0e0f18');
        ctx.fillStyle = grad;
        ctx.fillRect(-w / 2, -h / 2, w, h);
      }

      ctx.restore();

      // 6. Professional Studio Vignette
      const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.4, w / 2, h / 2, w * 0.65);
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(1, 'rgba(6, 8, 16, 0.65)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isImageLoaded]);

  return (
    <div className="rounded-2xl border border-slate-700/80 bg-[#12131f] overflow-hidden shadow-2xl shrink-0 ring-1 ring-slate-800 flex flex-col transition-all">
      {/* Aspect Video Call Frame */}
      <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
        
        {/* Real-Time Neural Animated Canvas (Natural Breathing, Listening Nods, Speech Articulation) */}
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          className={`w-full h-full object-cover select-none pointer-events-none transition-all duration-300 ${
            conversationState === 'evaluating' ? 'filter blur-[1.5px] brightness-75' : ''
          }`}
        />

        {/* Audio-Reactive Speaking Radiant Halo */}
        {conversationState === 'interviewer_speaking' && (
          <div className="absolute inset-0 border-3 border-emerald-400/90 pointer-events-none shadow-[inset_0_0_30px_rgba(52,211,153,0.35)] animate-pulse z-10" />
        )}

        {/* Top Video Call Bar: [● AI VIDEO CALL] & 60 FPS */}
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
              <span>AI VIDEO CALL</span>
              <Sparkles className="w-2.5 h-2.5 text-amber-300" />
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-slate-800 text-[9px] font-mono text-slate-300">
            <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
            <span>60 FPS</span>
          </div>
        </div>

        {/* Evaluating / Thinking Screen: Exact Match to User Screenshot (Yellow dot "Thinking" + Green Spinner) */}
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

        {/* Speaking Live Audio Bar Overlay */}
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
                title="Replay Emily's voice"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Replay</span>
              </button>
            )}
          </div>
        )}

        {/* Attentive Listening State when Candidate Speaks */}
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
